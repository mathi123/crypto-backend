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
        const url = `https://api.blockcypher.com/v1/${coin.code.toLowerCase()}/main/addrs/${address}`;
        const data = await this.loadTransactions(`${url}?token=${this.token}`);

        const conversionFactor = Math.pow(10, coin.decimals);
        const transactions = [];
        for(const element of data.txrefs){
            const formatted = await this.processTransaction(element, address, conversionFactor, coin);
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

    async processTransaction(rawTransaction, address, conversionFactor, coin){
        const url = `https://api.blockcypher.com/v1/${coin.code.toLowerCase()}/main/txs/${rawTransaction.tx_hash}?instart=0&outstart=0&limit=10000&token=${this.token}`;
        const transactionInfo = await this.loadTransactions(url);

        if(transactionInfo.next_inputs !== undefined || transactionInfo.next_outputs !== undefined){
            throw new Error('transaction has more than 10000 inputs or outputs!');
        }

        const spent = transactionInfo.inputs.filter(rec => rec.addresses.indexOf(address) >= 0)
                            .map(rec => rec.output_value)
                            .reduce((prev, curr) => prev + curr, 0) / conversionFactor;

        const received = transactionInfo.outputs.filter(rec => rec.addresses.indexOf(address) >= 0)
                                .map(rec => rec.value)
                                .reduce((prev, curr) => prev + curr, 0)/ conversionFactor;

        const transaction = {
            id: rawTransaction.tx_hash,
            date: new Date(rawTransaction.confirmed),
            amount: (received > 0) ? received : -spent,
        };

        return transaction;
    }
}

module.exports = BlockCypherTransactionProvider;
