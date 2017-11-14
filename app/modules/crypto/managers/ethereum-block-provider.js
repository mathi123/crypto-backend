const logger = require('../../../framework/logger');
const models = require('../models');
const Web3 = require('web3');

class EthereumBlockProvider{
    constructor(configuration){
        this.apiUrl = configuration.ethereumApi;
    }

    async getBlocks(coin, from, to){
        logger.verbose(`getting ethereum blocks from ${from} > ${to}`);

        const result = [];
        const web3 = this.getWeb3();
        for(let i = from; i<to;i++){
            const block = await web3.eth.getBlock(i);
            result.push(block);
        }
        return result;
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

module.exports = EthereumBlockProvider;
