const logger = require('../../../framework/logger');
const models = require('../models');
const uuid = require('uuid/v4');
const CoinManager = require('./coin-manager');
const PriceManager = require('./price-manager');

class TransactionManager{
    constructor(configuration){
        this.coinManager = new CoinManager(configuration);
        this.priceManager = new PriceManager();
    }

    async getAll(accountId){
        return models.Transaction.findAll({
            where: {
                accountId,
            },
            order: [
                ['date', 'DESC'],
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

        const newTransactions = await this.merge(accountId, existingTransactions, transactions);

        await this.setState(accountId, 'done');

        await this.loadPrices(coin, account, newTransactions.map(txn => txn.date));
    }

    async loadPrices(coin, account, timestamps){
        logger.verbose(`loading prices for ${timestamps.length} timestamps`);
        const currencies = await models.Currency.findAll();
        for(const currency of currencies){
            await this.priceManager.getPricesForDateArray(timestamps, coin, currency);
        }
    }

    async merge(accountId, existingTransactions, transactions){
        const newTransactions = [];
        for(const transaction of transactions){
            const existing = existingTransactions.filter(e => e.transactionId === transaction.id)[0];

            if(existing === null || existing === undefined){
                const newTxn = await this.insertTransaction(accountId, transaction);
                newTransactions.push(newTxn);
            }
        }
        return newTransactions;
    }

    async insertTransaction(accountId, data){
        logger.verbose(`inserting transaction ${data.id}`);

        const transaction = {
            accountId,
            id: uuid(),
            transactionId: data.id,
            date: data.date,
            amount: data.amount,
        };

        await models.Transaction.create(transaction);

        await models.Account.update({ updatedAt: new Date() }, {
            where: {
                id: accountId,
            },
            fields: ['updatedAt'],
        });

        return transaction;
    }

    async setState(accountId, state){
        await models.Account.update({ state }, {
            where: {
                id: accountId,
            },
            fields: ['state'],
        });
    }
}

module.exports = TransactionManager;
