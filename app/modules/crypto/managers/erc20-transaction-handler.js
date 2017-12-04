const logger = require('../../../framework/logger');
const models = require('../models');

class Erc20TransactionHandler {
    async handleTransactions(coin, transactions) {
        logger.info(`handling ${transactions.length} ${coin.description} transactions.`);

        for (const txn of transactions) {
            const existing = await models.Erc20Transaction.findOne({
                where: {
                    coinId: coin.id,
                    blockNumber: txn.blockNumber,
                    transactionHash: txn.transactionHash,
                    logIndex: txn.logIndex,
                },
            });

            if (existing === null) {
                await this.createTransaction(txn);
            } else {
                await this.updateTransaction(txn, coin);
            }
        }
    }

    async createTransaction(txn) {
        try{
            await models.Erc20Transaction.create(txn);
        }catch(err){
            logger.error('could not insert transaction!');
            logger.error(JSON.stringify(txn));
            throw err;
        }
    }

    async updateTransaction(txn, coin){
        const data = {
            isRemoved: txn.isRemoved,
        };
        const options = {
            fields: ['isRemoved'],
            where: {
                coinId: coin.id,
                blockNumber: txn.blockNumber,
                transactionHash: txn.transactionHash,
                logIndex: txn.logIndex,
            },
        };

        try{
            await models.Erc20Transaction.update(data, options);
        }catch(err){
            logger.error('could not update transaction!');
            logger.error(JSON.stringify(txn));
            throw err;
        }
    }
}

module.exports = Erc20TransactionHandler;
