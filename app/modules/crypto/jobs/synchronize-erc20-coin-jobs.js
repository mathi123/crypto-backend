const theInternet = require('request-promise-native');
const uuid = require('uuid/v4');
const models = require("../models");
const cheerio = require('cheerio');
const JobProgressManager = require('../managers/job-progress-manager');
const Logger = require('../managers/logger');


class SynchronizeErc20CoinsJob{
    constructor(){
        this.jobName = 'SynchronizeErc20CoinsJob';
        this.jobProgressManager = new JobProgressManager();
        this.logger = new Logger();
    }

    enqueue(jobManager){
        /*jobManager.publish('SynchronizeErc20CoinsJob', {}, {startIn: 5})
            .then((id) => console.log("job published:"+id))
            .error((err) => console.error(err));*/
    }

    subscribe(jobManager){
        jobManager.subscribe(this.jobName, (data) => this.synchronizeCoins(data))
            .then(() => this.logger.verbose("Subscribed to job", this.jobName))
            .error((err) => this.logger.error("Could not subscribe to job", err));
    }

    async synchronizeCoins(data){
        await this.jobProgressManager.start(data.id, this.jobName, null)

        try{
            await this.synchronizeCoinsAsync(data.id);
            await this.jobProgressManager.setDone(data.id);
        }
        catch(err){
            await this.jobProgressManager.logError(data.id, "Job failed", err);
            await this.jobProgressManager.setFailed(data.id);
        }
    }

    async synchronizeCoinsAsync(jobId){
        this.jobProgressManager.logVerbose(jobId, "Synchronizing coins");
        this.jobProgressManager.logVerbose(jobId, "Getting coin list");

        let coins = await this.getCoins();
        
        this.jobProgressManager.updateProgress(jobId, 50);
        this.jobProgressManager.logVerbose(jobId, "Updating coins in database");

        await this.updateCoins(coins);
    
        this.jobProgressManager.logVerbose(jobId, "Done");
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
                            isActive: false,
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