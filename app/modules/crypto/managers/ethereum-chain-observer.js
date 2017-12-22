const logger = require('../../../framework/logger');
const Web3 = require('web3');
const theInternet = require('request-promise-native');
const sleep = require('sleep-promise');

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

    isValid(coin, address){
        return /^(0x)?[0-9a-f]{40}$/i.test(address);
    }

    // Todo: use Web3js
    async getBalance(coin, address){
        logger.verbose(`getting balance for ${address}`);
        const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${this.apiKey}`;

        const options = {
            uri: url,
            json: true,
        };

        let data = null;
        let tries = 0;
        try{
            while((data === null || data.status != this.okStatus) && tries++ < 5){
                if(tries > 1){
                    await sleep(50);
                }

                data = await theInternet(options);
            }
        }catch(Error){
            logger.warn(`Could not perform webrequest to ${url} (${tries} tries)`);
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
