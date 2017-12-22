const logger = require('../../../framework/logger');
const theInternet = require('request-promise-native');
const models = require('../models');
const uuid = require('uuid/v4');

const timeout = ms => new Promise(res => setTimeout(res, ms));

class PriceManager{
    constructor(){
        this.MaxTries = 5;
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
            const date = new Date(fromDate.getTime() + i * step);
            dates.push(date);
        }

        if(toDate !== dates[dates.length - 1]){
            dates.push(toDate);
        }

        const sorted = dates.sort((x, y) => x - y);

        return await this.getHistoricalPricesForCurrencies(sorted, coins, currencies);
    }

    async getHistoricalPricesForCurrencies(dates, coins, currencies){
        const result = {
            dates,
            prices: {},
        };

        for(const coin of coins){
            result.prices[coin.id] = [];

            for(const currency of currencies){
                const prices = await this.getHistoricalPrices(dates, coin, currency);

                result.prices[coin.id].push({
                    currencyId: currency.id,
                    prices,
                });
            }
        }

        return result;
    }

    async getCurrentPricesForCurrencies(coins, currencies){
        const result = {};

        for(const coin of coins){
            result[coin.id] = [];

            for(const currency of currencies){
                const price = await this.getCurrentPrice(coin, currency);

                result[coin.id].push({
                    currencyId: currency.id,
                    price,
                });
            }
        }
        return result;
    }

    async getHistoricalPrices(dates, coin, currency){
        var results = [];

        for(var i = 0;i<dates.length;i++)
        {
            const date = dates[i];
            const price = await this.getHistoricalPrice(date, coin, currency);
            results.push(price);
        }

        return results;
    }

    async getCurrentPrice(coin, currency){
        const date = new Date();
        const url = `https://min-api.cryptocompare.com/data/price?fsym=${coin.code}&tsyms=${currency.code}`;
        const options = {
            uri: url,
            json: true,
            timeout: 5000,
        };

        let data = null;
        let tries = 0;

        while(data === null && tries < this.MaxTries){
            try{
                data = await theInternet(options);
            }catch(Error){
                tries++;
                logger.warn(`retry ${tries} for url ${url} (${tries} tries)`);
                await timeout(tries * 100);
            }
        }

        if(data === null || data === undefined){
            logger.warn(`could not get price data from url ${url} (${tries} tries)`);
            throw new Error('Could not get price.');
        }

        const price = {
            date,
            price: data[currency.code]
        };

        await this.savePrice(currency.id, coin.id, date, data[currency.code], true);

        return price;
    }

    async getHistoricalPrice(date, coin, currency){
        const serverTs = Math.round(date.getTime()/1000);
        logger.verbose(`getting price for ${coin.description} on timestamp ${serverTs}`);
        const url = `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${coin.code}&tsyms=${currency.code}&ts=${serverTs}&extraParams=tstapp`;

        const cached = await this.getCachedPrice(currency.id, coin.id, date);
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

        while(data === null && tries < this.MaxTries){
            try{
                data = await theInternet(options);
            }catch(Error){
                tries++;
                logger.warn(`retry ${tries} for url ${url}`);
                await timeout(tries * 100);
            }
        }

        if(data === null || data === undefined || data[coin.code] === null || data[coin.code] === undefined){
            logger.warn(`could not get price data from url ${url}`);
            throw new Error('Could not get price.');
        }

        const price = this.formatHistoricPriceResultData(date, coin, currency, data);
        await this.savePrice(currency.id, coin.id, date, price.price, false);

        return price;
    }

    async getCachedPrice(currencyId, coinId, timestamp){
        const price = await models.Price.findOne({
            where: {
                currencyId,
                coinId,
                date: timestamp,
            },
        });

        return price;
    }

    async savePrice(currencyId, coinId, date, price, isDayPrice){
        const record = {
            id: uuid(),
            currencyId,
            coinId,
            price,
            date,
            isDayPrice,
        };

        await models.Price.create(record);
    }

    formatHistoricPriceResultData(date, coin, currency, data){
        return {
            date,
            price: data[coin.code][currency.code],
            isDayPrice: false,
        };
    }
}

module.exports = PriceManager;
