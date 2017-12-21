const logger = require('../../../framework/logger');
const theInternet = require('request-promise-native');
const sleep = require('sleep-promise');

class BlockCypherTransactionProvider{
    constructor(configuration){
        this.token = configuration.blockCypher.token;
        this.MaxTries = 5;
    }

    async getTransactionsForBlocks(coin, from, to){
        logger.verbose(`Getting transactions for ${coin.description} for block ${from} to block ${to}.`);
        throw new Error('This method should not be called.');
    }

    async getTransactionsForAddress(coin, address){
        const url = `https://api.blockcypher.com/v1/${coin.code.toLowerCase()}/main/addrs/${address}/full`;
        const data = await this.loadTransactions(`${url}?token=${this.token}`);

        const conversionFactor = Math.pow(10, coin.decimals);
        const transactions = [];
        for(const element of data.txs){
            const formatted = await this.processTransaction(element, address, conversionFactor);
            transactions.push(formatted);
        }

        return transactions;
    }

    async loadTransactions(url) {
        let data = null;
        const options = {
            uri: url,
            json: true,
        };

        let tries = 0;
        while (tries < this.MaxTries && (data === null || data === undefined)) {
            try {
                await sleep(50) * (tries + 1);
                logger.verbose(`making webrequest to ${options.uri}`);
                data = await theInternet(options);
            }
            catch (Error) {
                logger.warn(`Error loading url: ${url} (${tries} tries)`);
            }
            tries++;
        }
        if (data === null || data === undefined) {
            throw new Error('Could not get transactions.');
        }
        return data;
    }

    async processTransaction(rawTransaction, address, conversionFactor){
        const inputs = rawTransaction.inputs;
        const outputs = rawTransaction.outputs;

        const transaction = {};

        transaction.id = rawTransaction.hash;
        transaction.date = new Date(rawTransaction.confirmed);

        while(rawTransaction.next_inputs !== undefined){
            const url = rawTransaction.next_inputs.replace('\u0026', '&');
            rawTransaction = await this.loadTransactions(`${url}&token=${this.token}`);
            for(const input of rawTransaction.inputs){
                inputs.push(input);
            }
        }
        while(rawTransaction.next_outputs !== undefined){
            const url = rawTransaction.next_outputs.replace('\u0026', '&');
            rawTransaction = await this.loadTransactions(`${url}&token=${this.token}`);
            for(const output of rawTransaction.outputs){
                outputs.push(output);
            }
        }

        const spent = inputs.filter(rec => rec.addresses.indexOf(address) >= 0)
                            .map(rec => rec.output_value)
                            .reduce((prev, curr) => prev + curr, 0) / conversionFactor;

        const received = outputs.filter(rec => rec.addresses.indexOf(address) >= 0)
                                .map(rec => rec.value)
                                .reduce((prev, curr) => prev + curr, 0)/ conversionFactor;

        if(received > 0){
            transaction.amount = received;
        }
        else{
            transaction.amount = -spent;
        }

        return transaction;
    }
}

module.exports = BlockCypherTransactionProvider;
