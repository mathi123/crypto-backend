const models = require('../models');
const CoinApiFactory = require('../coin-apis/coin-api-factory');
const uuid = require('uuid/v4');
const coreModels = require('../../core/models');
const SocketManager = require('../../../framework/socket-manager');

class AccountSummaryManager{

    constructor(){
        this.coinFactory = new CoinApiFactory();
    }

    async getUserAccounts(){
        const accounts = await models.Account.findAll({
            include: [
                { model: models.Coin },
            ],
        });

        return accounts;
    }

    async refreshAllAccounts(timestamp){
        console.log('refreshing all account summaries with timestamp '+timestamp);
        const accounts = await models.Account.findAll();

        for(const account of accounts){
            await this.refreshAccount(timestamp, account);
        }
    }

    async refreshAccount(timestamp, account){
        const user = await coreModels.User.findOne({
            where: {
                id: account.userId,
            },
        });

        const price = await models.Price.findOne({
            where: {
                coinId: account.coinId,
                currencyId: user.currencyId,
                ts: timestamp,
            },
        });

        if(price === null) throw new Error('Price not found');

        const factory = await this.coinFactory.getTotalCalculator(account.coinId);
        const balance = await factory.getBalance(account.address);
        await this.createAccountSummary(account, timestamp, balance, price);

        console.log('io should publish event now.');
        SocketManager.Current.emitForUserId(account.userId, 'reloadTotal', { accountId: account.id });
    }

    async createAccountSummary(account, timestamp, balance, price){
        let increase = 0;
        const yesterday = new Date(timestamp - 24 * 3600 * 1000);

        const lastDate = await models.AccountSummary.max('ts', {
            where: {
                ts: {
                    lte: yesterday.getTime(),
                },
                accountId: account.id,
            },
        });

        if(lastDate > 0){
            const lastPrice = await models.AccountSummary.findOne({
                where: {
                    accountId: account.id,
                    ts: lastDate,
                },
            });

            const last = lastPrice.unitPrice;

            if(last !== 0 && last !== undefined){
                increase = (price.price - last) / last;
            }
        }

        const record = {
            id: uuid(),
            accountId: account.id,
            unitPrice: price.price,
            ts: timestamp,
            total: balance,
            increase,
        };
        //console.log("inserting " + JSON.stringify(record));

        await models.AccountSummary.create(record);
    }
}

module.exports = AccountSummaryManager;
