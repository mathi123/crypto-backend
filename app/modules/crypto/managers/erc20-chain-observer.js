const logger = require('../../../framework/logger');
const models = require('../models');
const erc20 = require('../ethereum/erc20-abi');
const Web3 = require('web3');

class Erc20ChainObserver {
    constructor(configuration){
        this.apiUrl = configuration.ethereumApi;
    }

    async getLastBlock(coin){
        logger.verbose(`Getting latest block for ${coin.description}.`);
        const lastBlock = await models.EthereumBlock.max('id');
        return lastBlock;
    }

    async getBalance(coin, address){
        const web3 = this.getWeb3();
        const contract = this.getContract(web3, coin.baseAddress);
        const balance = await contract.balanceOf(address);
        return balance;
    }

    getContract(web3, contractAddress){
        return new web3.eth.Contract(erc20, contractAddress);
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

module.exports = Erc20ChainObserver;
