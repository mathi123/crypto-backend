const logger = require('../../../framework/logger');
const theInternet = require('request-promise-native');
const models = require('../models');
const uuid = require('uuid/v4');

const timeout = ms => new Promise(res => setTimeout(res, ms));

class PriceManager{
    constructor(){
    }

    async getPrices(fromDate, toDate, coins, currencies, maxReq, extraTs){
        if(toDate < fromDate){
            throw new Error('toDate < fromDate');
        }

        const totalDiffMs = toDate - fromDate;
        const daysInDiff = totalDiffMs / (24 * 60 * 60 * 1000);
        const requests = Math.min(maxReq, daysInDiff);
        const step = Math.ceil(totalDiffMs / requests);

        var dates = extraTs;

        for(var i = 0;i<requests;i++)
        {
            const d = new Date(fromDate.getTime() + i * step);
            const ts = d.getTime();
            dates.push(ts);
        }

        if(toDate.getTime() !== dates[dates.length - 1]){
            dates.push(toDate.getTime());
        }

        const sorted = dates.sort((x, y) => x - y);

        return await this.getPricesForCurrencies(sorted, coins, currencies);
    }

    async getPricesForCurrencies(dates, coins, currencies){
        const result = {
            dates,
            prices: {},
        };

        for(const coin of coins){
            result.prices[coin.id] = [];

            for(const currency of currencies){
                const prices = await this.getPricesForDateArray(dates, coin, currency);

                result.prices[coin.id].push({
                    currencyId: currency.id,
                    prices,
                });
            }
        }

        return result;
    }

    async getPricesForDateArray(dates, coin, currency){
        var results = [];

        for(var i = 0;i<dates.length;i++)
        {
            const ts = dates[i];
            const transaction = await this.getPriceForDateAndCurrency(ts, coin, currency);
            results.push(transaction);
        }

        return results;
    }

    async getPriceForDateAndCurrency(serverTs, coin, currency){
        logger.verbose(`getting price for ${coin.description} on timestamp ${serverTs}`);
        const url = `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${coin.code}&tsyms=${currency.code}&ts=${serverTs}&extraParams=tstapp`;

        const cached = await this.getCachedPrice(currency.id, coin.id, serverTs);
        if(cached !== null){
            return cached;
        }

        const options = {
            uri: url,
            json: true,
            timeout: 5000,
        };

        let data = null;
        let tries = 0;

        while(data === null && tries < 4){
            try{
                data = await theInternet(options);
            }catch(Error){
                tries++;
                logger.warn(`retry ${tries} for url ${url}`);
                await timeout(100);
            }
        }

        if(data === null || data === undefined || data[coin.code] === null || data[coin.code] === undefined){
            logger.warn(`could not get price data from url ${url}`);
            throw new Error('Could not get price.');
        }

        const price = this.formatResultData(serverTs, coin, currency, data);
        await this.savePrice(currency.id, coin.id, serverTs, price.price);

        return price;
    }

    async getCachedPrice(currencyId, coinId, timestamp){
        const price = await models.Price.findOne({
            where: {
                currencyId,
                coinId,
                ts: timestamp,
            },
        });

        return price;
    }

    async savePrice(currencyId, coinId, timestamp, price){
        const record = {
            id: uuid(),
            currencyId,
            coinId,
            price,
            ts: timestamp,
        };

        await models.Price.create(record);
    }

    formatResultData(ts, coin, currency, data){
        return {
            ts,
            price: data[coin.code][currency.code],
        };
    }
}

module.exports = PriceManager;
