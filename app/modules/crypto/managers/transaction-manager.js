const models = require('../models');
const uuid = require('uuid/v4');
const CoinApiFactory = require('../coin-apis/coin-api-factory');
const SocketManager = require("../../../framework/socket-manager");

class TransactionManager{
    async getAll(accountId){
        return models.Transaction.all({
            where: { 
                accountId: accountId
            }
        }); // Todo order by timestamp
    }
    
    async getById(id, accountId){
        return await models.Transaction.findOne({
            where: { 
                id: id,
                accountId: accountId
            }
        });
    }

    async loadTransactions(accountId){
        console.log("loading transactions now");
        let account = await models.Account.findOne({
            where: {
                id: accountId
            }
        });

        if(account === null){
            throw new Error("account not found");
        }

        let factory = await (new CoinApiFactory()).getCoinFactory(account.coinId);

        console.log("getting transactions");
        let transactions = await factory.getTransactions(account.address);

        console.log("getting existing transactions");
        let existingTransactions = await models.Transaction.find({
            where: {
                accountId: accountId
            }
        }) || [];

        await this.merge(accountId, existingTransactions, transactions);

        console.log("io should publish event now.");
        SocketManager.Current.emitForUserId(account.userId, 'reloadTransactions', { accountId: accountId});
    }

    async merge(accountId, existingTransactions, transactions){
        for(let transaction of transactions){
            let existing = existingTransactions.filter(e => e.transactionId === transaction.id)[0];
        
            if(existing === null || existing === undefined){
                await this.insertTransaction(accountId, transaction);
            }else{
                this.updateTransaction(existing, transaction);
            }
        }
    }

    async insertTransaction(accountId, data){
        console.log("inserting transaction");

        let transaction = {
            accountId: accountId,
            id: uuid(),
            transactionId: data.id,
            ts: data.ts,
            amount: data.value
        };

        await models.Transaction.create(transaction);
    }

    updateTransaction(existing, transaction){

    }
}

module.exports = TransactionManager;