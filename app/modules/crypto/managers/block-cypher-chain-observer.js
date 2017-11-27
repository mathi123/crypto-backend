const logger = require('../../../framework/logger');
const theInternet = require('request-promise-native');
const sleep = require('sleep-promise');

class BlockCypherChainObserver {
    constructor(){
        this.MaxTries = 5;
    }

    async getLastBlock(coin){
        logger.verbose(`Getting latest block for ${coin.description}.`);
        const url = `https://api.blockcypher.com/v1/${coin.code.toLowerCase()}/main`;
        const options = {
            uri: url,
            json: true,
        };

        let data = null;
        let tries = 0;

        while(tries < this.MaxTries && (data === null || data === undefined || data.height === null || data.height === undefined))
        {
            try{
                data = await theInternet(options);
            }catch(Error){
                logger.warn(`Could not perform webrequest to ${url}`);
                await sleep(50*(tries + 1));
            }
            tries++;
        }

        if(data === null || data === undefined || data.height === null || data.height === undefined){
            throw new Error('Could not get height.');
        }

        return data.height;
    }

    async getBalance(coin, address){
        const url = `http://api.blockcypher.com/v1/${coin.code.toLowerCase()}/main/addrs/${address}`;

        const options = {
            uri: url,
            json: true,
        };

        let data = null;
        let tries = 0;
        while(tries < this.MaxTries && (data === null || data === undefined || data.height === null || data.height === undefined))
        {
            try{
                data = await theInternet(options);
            }catch(Error){
                logger.warn(`Could not perform webrequest to ${url}`);
                await sleep(50)*(tries + 1);
            }
            tries++;
        }

        if(data === null || data === undefined || data.balance === null || data.balance === undefined){
            throw new Error('Could not get balance.');
        }
        const conversionFactor = Math.pow(10, coin.decimals);
        return data.balance / conversionFactor;
    }
}

module.exports = BlockCypherChainObserver;
