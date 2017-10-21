const theInternet = require('request-promise-native');
const models = require('../models');
const uuid = require('uuid/v4');

const timeout = ms => new Promise(res => setTimeout(res, ms))

class PriceManager{
    constructor(){
    }

    async getPrices(fromDate, toDate, coins, currencies, maxReq, extraTs){
        if(toDate < fromDate){
            throw new Error('toDate < fromDate');
        }

        let totalDiffMs = toDate - fromDate;
        let daysInDiff = totalDiffMs / (24 * 60 * 60 * 1000);
        let requests = Math.min(maxReq, daysInDiff);
        let step = Math.ceil(totalDiffMs / requests);

        var dates = extraTs;

        for(var i = 0;i<requests;i++)
        {
            let d = new Date(fromDate.getTime() + i * step);
            let ts = d.getTime();
            dates.push(ts);
        }

        if(toDate.getTime() !== dates[dates.length - 1]){
            dates.push(toDate.getTime());
        }

        let sorted = dates.sort((x,y) => x - y);

        return await this.getPricesForCurrencies(sorted, coins, currencies)
    }

    async getPricesForCurrencies(dates, coins, currencies){    
        let result = {
            dates: dates,
            prices: {}
        };

        for(let coin of coins){
            result.prices[coin.id] = [];

            for(let currency of currencies){
                let prices = await this.getPricesForDateArray(dates, coin, currency);
                
                result.prices[coin.id].push({
                    currencyId: currency.id,
                    prices: prices
                });
            }
        }

        return result;
    }

    async getPricesForDateArray(dates, coin, currency){
        var results = [];
        
        for(var i = 0;i<dates.length;i++)
        {
            let ts = dates[i];
            let transaction = await this.getPriceForDateAndCurrency(ts, coin, currency);
            results.push(transaction);
        }

        return results;
    }

    async getPriceForDateAndCurrency(serverTs, coin, currency){
        let url = `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${coin.code}&tsyms=${currency.code}&ts=${serverTs}&extraParams=tstapp`;
       
        let cached = await this.getCachedPrice(currency.id, coin.id, serverTs);
        if(cached !== null){
            return cached;
        }

        const options = {
            uri: url,
            json: true,
            timeout: 5000
        };

        let data = null;
        let tries = 0;

        while(data === null && tries < 4){
            try{
                data = await theInternet(options);
            }catch(Error){
                tries++;
                console.log("retry "+tries);
                await timeout(100);
            }
        }
                    
        if(data === null || data === undefined || data[coin.code] === null || data[coin.code] === undefined){
            console.log(url);
            console.log(data);
            throw new Error('Could not get price.');
        }else{
            //console.log("success: " + url);
        }

        let price = this.formatResultData(serverTs, coin, currency, data);
        await this.savePrice(currency.id, coin.id, serverTs, price.price);

        return price;
    }

    async getCachedPrice(currencyId, coinId, timestamp){
        let price = await models.Price.findOne({
            where: {
                currencyId: currencyId,
                coinId: coinId,
                ts: timestamp
            }
        });

        return price;
    }

    async savePrice(currencyId, coinId, timestamp, price){
        let record = {
            id: uuid(),
            currencyId: currencyId,
            coinId: coinId,
            price: price,
            ts: timestamp
        };

        await models.Price.create(record);
    }

    formatResultData(ts, coin, currency, data){
        return {
            ts: ts,
            price: data[coin.code][currency.code],
        };
    }
}

module.exports = PriceManager;
