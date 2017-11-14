const logger = require('../../../framework/logger');
const Web3 = require('web3');
const theInternet = require('request-promise-native');

class EthereumChainObserver {

    constructor(configuration){
        this.apiUrl = configuration.ethereumApi;
        this.apiKey = configuration.blockCypher.apiKey;
        this.okStatus = 1;
    }

    async getLastBlock(coin){
        logger.verbose(`Getting latest block for ${coin.description}.`);
        const result = await this.getWeb3().eth.isSyncing();

        if(!result.currentBlock){
            const lastBlock = await this.getWeb3().eth.getBlockNumber();

            if(!lastBlock){
                throw new Error('could not get last block number.');
            }else{
                return lastBlock;
            }
        }

        return result.currentBlock;
    }

    // Todo: use Web3js
    async getBalance(coin, address){
        const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${this.apiKey}`;

        const options = {
            uri: url,
            json: true,
        };

        let data = null;
        try{
            data = await theInternet(options);
        }catch(Error){
            logger.warn(`Could not perform webrequest to ${url}`);
        }

        if(data === null || data === undefined || data.status != this.okStatus || data.result === null || data.result === undefined){
            throw new Error('Could not get balance.');
        }

        const weiToEther = Math.pow(10, coin.decimals);
        return data.result / weiToEther;
    }

    getWeb3(){
        if(this.web3 === undefined){
            this.web3 = this.buildWeb3();
        }
        return this.web3;
    }

    buildWeb3(){
        logger.verbose(`getting web3 js connection from ${this.apiUrl}`);
        return new Web3(new Web3.providers.HttpProvider(this.apiUrl));
    }
}

module.exports = EthereumChainObserver;
