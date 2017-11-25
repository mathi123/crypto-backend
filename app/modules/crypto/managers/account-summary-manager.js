const logger = require('../../../framework/logger');
const models = require('../models');
const uuid = require('uuid/v4');
const coreModels = require('../../core/models');
const CoinManager = require('./coin-manager');

class AccountSummaryManager{

    constructor(configuration){
        this.chainManager = new CoinManager(configuration);
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
        logger.verbose(`refreshing all account summaries with timestamp ${timestamp}`);
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

        const coin = await models.Coin.findOne({
            where: {
                id: account.coinId,
            },
        });

        const chain = this.chainManager.getChainObserver(coin);
        const balance = await chain.getBalance(coin, account.address);
        await this.createAccountSummary(account, timestamp, balance, price);
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
