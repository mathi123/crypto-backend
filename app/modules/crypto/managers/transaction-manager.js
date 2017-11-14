const logger = require('../../../framework/logger');
const models = require('../models');
const uuid = require('uuid/v4');
const CoinManager = require('./coin-manager');
const SocketManager = require('../../../framework/socket-manager');

class TransactionManager{
    constructor(configuration){
        this.chainManager = new CoinManager(configuration);
    }

    async getAll(accountId){
        return models.Transaction.all({
            where: {
                accountId,
            },
        }); // Todo order by timestamp
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

        const coin = models.Coin.findOne({ where:
        {
            id: account.coinId,
        } });
        const factory = this.chainManager.getTransactionProvider(coin);

        console.log('getting transactions');
        const transactions = await factory.getTransactionsForAddress(coin, account.address);

        console.log('getting existing transactions');
        const existingTransactions = await models.Transaction.find({
            where: {
                accountId,
            },
        }) || [];

        await this.merge(accountId, existingTransactions, transactions);

        console.log('io should publish event now.');
        SocketManager.Current.emitForUserId(account.userId, 'reloadTransactions', { accountId });
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
        console.log('inserting transaction');

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
