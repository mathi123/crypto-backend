const logger = require('../../../framework/logger');
const theInternet = require('request-promise-native');
const sleep = require('sleep-promise');

class BlockCypherTransactionProvider{
    async getTransactionsForBlocks(coin, from, to){
        logger.verbose(`Getting transactions for ${coin.description} for block ${from} to block ${to}.`);
        throw new Error('This method should not be called.');
    }

    async getTransactionsForAddress(coin, address){
        const url = `https://api.blockcypher.com/v1/${coin.code.toLowerCase()}/main/addrs/${address}/full`;

        const options = {
            uri: url,
            json: true,
        };

        let data = null;
        let tries = 0;

        while(tries < this.MaxTries && (data === null || data === undefined || data.txs === null || data.txs === undefined)){
            try{
                data = await theInternet(options);
            }catch(Error){
                logger.warn(`Error loading url: ${url}`);
                await sleep(50)*(tries + 1);
            }
            tries++;
        }
        if(data === null || data === undefined || data.txs === null || data.txs === undefined){
            throw new Error('Could not get transactions.');
        }
        const conversionFactor = Math.pow(10, coin.decimals);
        const transactions = [];
        for(const element of data.txs){
            const formatted = this.formatResultData(element, address, conversionFactor);
            transactions.push(formatted);
        }

        return transactions;
    }

    formatResultData(rawTransaction, address, conversionFactor){
        const transaction = {};

        transaction.id = rawTransaction.hash;
        transaction.ts = new Date(rawTransaction.confirmed).getTime();

        const spent = rawTransaction.inputs.filter(rec => rec.addresses.indexOf(address) >= 0).map(rec => rec.output_value).reduce((prev, curr) => prev + curr, 0) / conversionFactor;
        const received = rawTransaction.outputs.filter(rec => rec.addresses.indexOf(address) >= 0).map(rec => rec.value).reduce((prev, curr) => prev + curr, 0)/ conversionFactor;

        if(received > 0){
            transaction.value = received;
        }
        else{
            transaction.value = -spent;
        }

        return transaction;
    }
}

module.exports = BlockCypherTransactionProvider;
