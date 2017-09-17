const theInternet = require('request-promise-native');

class CryptoCompareApi{
    constructor(){
    }

    async getPrices(fromDate, toDate, currencies, maxReq, extraTs){
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

        let sorted = dates.sort((x,y) => x - y);

        return await this.getPricesForCurrencies(sorted, currencies)
    }

    async getPricesForCurrencies(dates, currencies){    
        let result = {
            dates: dates,
            prices: []
        };

        for(let curr of currencies){
            let currency = curr.toUpperCase();
            let prices = await this.getPricesForDateArray(dates, currency);

            result.prices.push({
                currency: curr,
                prices: prices
            });
        }

        return result;
    }

    async getPricesForDateArray(dates, curr){
        let currency = curr.toUpperCase();

        var results = [];
        
        for(var i = 0;i<dates.length;i++)
        {
            let ts = dates[i];
            
            let transaction = await this.getPriceForDateAndCurrency(ts, currency);
            results.push(transaction);
        }

        return results;
    }

    async getPriceForDateAndCurrency(ts, currency){
        let serverTs = Math.round(ts/1000);
        let url = `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${currency}&tsyms=EUR&ts=${serverTs}&extraParams=tstapp`;
       
        let cached = CryptoCompareApi.Cache[url];
        if(cached !== undefined){
            return cached;
        }

        const options = {
            uri: url,
            json: true
        };

        let data = null;
        
        try{
            data = await theInternet(options);
        }catch(Error){}
                    
        if(data === null || data === undefined || data[currency] === null || data[currency] === undefined){
            console.log(url);
            console.log(data);
            throw new Error('Could not get price.');
        }

        let price = this.formatResultData(ts, currency, data);
        CryptoCompareApi.Cache = price;

        return price;
    }

    formatResultData(ts, currency, data){
        return {
            ts: ts,
            price: data[currency]['EUR'],
        };
    }
}
CryptoCompareApi.Cache = {};

module.exports = CryptoCompareApi;
