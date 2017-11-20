const logger = require('../../../framework/logger');
const models = require('../models');
const CoinManager = require('./coin-manager');

class AccountManager{
    constructor(configuration){
        this.chainManager = new CoinManager(configuration);
    }

    async getUserAccounts(userId){
        return await models.Account.all({
            where: {
                userId,
            },
        });
    }

    async getById(id, userId){
        return await models.Account.findOne({
            where: {
                id,
                userId,
            },
        });
    }

    async getBalance(coinId, address){
        logger.verbose(`getting balance on coin ${coinId} for address ${address}`);
        const coin = await models.Coin.findOne({
            where: {
                id: coinId,
            },
        });

        const observer = await this.chainManager.getChainObserver(coin);
        return await observer.getBalance(coin, address);
    }
}

module.exports = AccountManager;
