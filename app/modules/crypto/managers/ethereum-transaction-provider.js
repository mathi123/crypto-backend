const logger = require('../../../framework/logger');
const theInternet = require('request-promise-native');
const sleep = require('sleep-promise');

class EthereumTransactionProvider{
    constructor(configuration){
        this.apiKey = configuration.blockCypher.apiKey;
        this.okStatus = 1;
    }

    async getTransactionsForBlocks(coin, from, to){
        logger.verbose(`Getting transactions for ${coin.description} for block ${from} to block ${to}.`);
        throw new Error('This method should not be called.');
    }

    async getTransactionsForAddress(coin, address){
        const url = `http://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${this.apiKey}`;

        const options = {
            uri: url,
            json: true,
            timeout: 5000,
        };

        let data = null;

        try{
            data = await theInternet(options);
        }catch(Error){
            if(data === null){
                try{
                    await sleep(50);
                    data = await theInternet(options);
                }catch(Error){
                    logger.warn(`retry failed on url ${url}`);
                }
            }
        }

        if(data === null || data === undefined || data.status != this.okStatus || data.result === null || data.result === undefined){
            throw new Error('Could not get transactions for '+address);
        }

        const weiToEther = Math.pow(10, coin.decimals);
        const transactions = [];
        for(const element of data.result){
            const formatted = this.formatResultData(element, weiToEther);

            if(element.to.toLowerCase() !== address.toLowerCase()){
                formatted.value = -formatted.value;
            }

            transactions.push(formatted);
        }

        return transactions;
    }

    formatResultData(rawTransaction, weiToEther){
        var result = {
            id: rawTransaction.hash,
            ts: rawTransaction.timeStamp * 1000,
            from: rawTransaction.from,
            to: rawTransaction.to,
            value: rawTransaction.value / weiToEther,
        };

        return result;
    }
}

module.exports = EthereumTransactionProvider;