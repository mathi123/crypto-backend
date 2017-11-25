const logger = require('../../../framework/logger');
const models = require('../models');
const uuid = require('uuid/v4');
const CoinManager = require('./coin-manager');

class TransactionManager{
    constructor(configuration){
        this.coinManager = new CoinManager(configuration);
    }

    async getAll(accountId){
        return models.Transaction.findAll({
            where: {
                accountId,
            },
            order: [
                ['ts', 'DESC'],
            ],
        });
    }

    async getById(id, accountId){
        return await models.Transaction.findOne({
            where: {
                id,
                accountId,
            },
        });
    }

    async loadTransactions(accountId){
        logger.verbose(`loading transactions for account ${accountId}`);
        const account = await models.Account.findOne({
            where: {
                id: accountId,
            },
        });

        if(account === null){
            throw new Error('account not found');
        }

        const coin = await this.coinManager.getById(account.coinId);
        const factory = this.coinManager.getTransactionProvider(coin);

        logger.verbose('getting transactions');
        const transactions = await factory.getTransactionsForAddress(coin, account.address);

        logger.verbose('getting existing transactions');
        const existingTransactions = await models.Transaction.findAll({
            where: {
                accountId,
            },
        }) || [];

        await this.merge(accountId, existingTransactions, transactions);
    }

    async merge(accountId, existingTransactions, transactions){
        for(const transaction of transactions){
            const existing = existingTransactions.filter(e => e.transactionId === transaction.id)[0];

            if(existing === null || existing === undefined){
                await this.insertTransaction(accountId, transaction);
            }else{
                this.updateTransaction(existing, transaction);
            }
        }
    }

    async insertTransaction(accountId, data){
        logger.verbose('inserting transaction');

        const transaction = {
            accountId,
            id: uuid(),
            transactionId: data.id,
            ts: data.ts,
            amount: data.value,
        };

        await models.Transaction.create(transaction);
    }

    updateTransaction(existing, transaction){

    }
}

module.exports = TransactionManager;
