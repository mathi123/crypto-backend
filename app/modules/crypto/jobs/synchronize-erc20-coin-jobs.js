const theInternet = require('request-promise-native');
const uuid = require('uuid/v4');
const models = require("../models");
const cheerio = require('cheerio');

class SynchronizeErc20CoinsJob{
    enqueue(jobManager){
        /*jobManager.publish('SynchronizeErc20CoinsJob', {}, {startIn: 5})
            .then((id) => console.log("job published:"+id))
            .error((err) => console.error(err));*/
    }

    subscribe(jobManager){
        jobManager.subscribe('SynchronizeErc20CoinsJob', () => this.synchronizeCoins())
            .then(() => console.log("subscribed to SynchronizeErc20CoinsJob"))
            .error((err) => console.error(err));
    }

    synchronizeCoins(){
        this.synchronizeCoinsAsync()
            .then(() => console.log("done syncing coins"))
            .catch((err) => console.error(err));
    }

    async synchronizeCoinsAsync(){
        console.log("Synchronizing coins");
    
        let coins = await this.getCoins();
    
        await this.updateCoins(coins);
    
        console.log("Done Synchronizing coins");
    }
    
    async getCoins(){
        const url = `https://bittrex.com/api/v1.1/public/getcurrencies`;
        
        const options = {
            uri: url,
            json: true
        };
    
        let data = null;
        try{
            data = await theInternet(options);
        }catch(Error){}
    
        if(data === null || data === undefined || data.result === null || data.result === undefined){
            throw new Error('Could not get coins.');
        }
    
        return data.result;
    }
    
    async updateCoins(coins){
        for(let coin of coins){
            if(coin.CoinType === "ETH_CONTRACT"){
                let existing = await models.Coin.findOne({
                    where: {
                      code: coin.Currency
                    }
                  });
    
                if(existing === null){
                    let baseAddress = '';
                    try{
                        let page = await theInternet({
                            uri: `https://etherscan.io/token/${coin.CurrencyLong}`
                        });
    
                        let doc = cheerio.load(page);
                        
                        baseAddress = doc("#ContentPlaceHolder1_trContract td a").text();
                    }catch(Err){
                        console.error(Err);
                        console.log("could not get base address for "+coin.CurrencyLong);
                    }
    
                    if(baseAddress != ''){
                        // Not found: importing
                        await models.Coin.create({
                            id: uuid(),
                            code: coin.Currency,
                            description: coin.CurrencyLong,
                            isActive: coin.IsActive,
                            coinType: 'erc20contract',
                            baseAddress: baseAddress
                        });
                    }
                }
            }
        }
    }
}

module.exports = SynchronizeErc20CoinsJob;