const logger = require('../../../framework/logger');
const models = require('../models');

class Erc20TransactionHandler{
    async handleTransactions(coin, transactions){
        logger.info(`handling ${transactions.length} ${coin.description} transactions.`);

        for(const txn of transactions){
            const existing = await models.Erc20Transaction.findOne({
                where: {
                    coinId: coin.id,
                    blockNumber: txn.blockNumber,
                    transactionHash: txn.transactionHash,
                    logIndex: txn.logIndex,
                },
            });

            if(existing === null){
                await models.Erc20Transaction.create(txn);
            }else{
                existing.isRemoved = txn.isRemoved;
                existing.save();
            }
        }
    }
}

module.exports = Erc20TransactionHandler;
