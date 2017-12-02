const logger = require('../../../framework/logger');
const models = require('../models');
const CoinManager = require('./coin-manager');
const sequelize = require('sequelize');
const uuid = require('uuid/v4');

class AccountManager{
    constructor(configuration){
        this.chainManager = new CoinManager(configuration);
    }

    async getUserAccounts(userId){
        logger.verbose(userId.length);
        const now = new Date();
        const timestamp = now.getTime();
        const oneHour = Math.floor(new Date(timestamp - 3600 * 1000).getTime() / 1000);
        const lastWeek = Math.floor(new Date(timestamp - 7 * 24 * 3600 * 1000).getTime() / 1000);
        const oneMonth = Math.floor(new Date(timestamp - 30 * 24 * 3600 * 1000).getTime() / 1000);

        const records = await sequelize.Current.query(`
        SELECT
        "Account".*,
            COALESCE(qryNow.amount, 0) AS balance,
            COALESCE(oneHour.amount, 0) AS balanceOneHourAgo,
            COALESCE(oneWeekAgo.amount, 0) AS balanceOneWeekAgo,
            COALESCE(oneMonthAgo.amount, 0) AS balanceOneMonthAgo
        FROM "Account"
        LEFT JOIN
            (
            SELECT "accountId", SUM("Transaction".amount) AS amount
            FROM "Transaction"
            GROUP BY "accountId"
            ) qryNow
            ON "Account".id = qryNow."accountId"
        LEFT JOIN
            (
            SELECT "accountId", SUM("Transaction".amount) AS amount
            FROM "Transaction" WHERE ts <= ${oneHour}
            GROUP BY "accountId"
            ) oneHour
            ON "Account".id = oneHour."accountId"
        LEFT JOIN
            (
            SELECT "accountId", SUM("Transaction".amount) AS amount
            FROM "Transaction" WHERE ts <= ${lastWeek}
            GROUP BY "accountId"
            ) oneWeekAgo
            ON "Account".id = oneWeekAgo."accountId"
        LEFT JOIN
            (
            SELECT "accountId", SUM("Transaction".amount) AS amount
            FROM "Transaction" WHERE ts <= ${oneMonth}
            GROUP BY "accountId"
            ) oneMonthAgo
            ON "Account".id = oneMonthAgo."accountId"
        WHERE "Account".userId = '${userId}'`, { type: sequelize.QueryTypes.SELECT });

        logger.verbose(JSON.stringify(records));
        return records;
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

    async setState(accountId, state){
        await models.Account.update({ state }, {
            where: {
                id: accountId,
            },
            fields: ['state'],
        });
    }

    async updateWithUserCheck(userId, id, data){
        const record = await models.Account.findOne({
            where: {
                id,
            },
        });

        if(record === null){
            throw new Error('account not found');
        }else if(record.userId !== userId){
            throw new Error('cant update other users account');
        }

        await this.update(id, data);

        // reload transactions but don't wait for the result
        if(record.address !== data.address && record.transactionType === 'auto'){
            this.transactionManager.loadTransactions(record.id);
        }
    }

    async update(id, data) {
        const values = {
            description: data.description,
            color: data.color,
            address: data.address,
            note: data.note,
            transactionType: data.transactionType,
        };
        const updateOptions = {
            where: { id },
            fields: ['description', 'color', 'address', 'note', 'transactionType'],
        };

        await models.Account.update(values, updateOptions);
    }

    async create(userId, data){
        const record = {
            id: uuid(),
            userId,
            coinId: data.coinId,
            description: data.description,
            color: data.color,
            address: data.address,
            note: data.note,
            transactionType: data.transactionType,
        };

        if(record.coinId === null || record.coinId === undefined){
            throw new Error('coinId is required');
        }else if(record.description === null || record.description === undefined){
            throw new Error('description');
        }else if(record.address === null || record.address === undefined){
            throw new Error('address is required');
        }else if(record.transactionType !== 'auto' && record.transactionType !== 'manual'){
            throw new Error('transaction type should be auto or manual');
        }

        if(record.transactionType === 'auto'){
            record.state = 'importing';
        }else{
            record.state = 'new';
        }

        await models.Account.create(record);

        // load transactions but don't wait for the result
        if(record.transactionType === 'auto'){
            this.transactionManager.loadTransactions(record.id);
        }

        return record;
    }
}

module.exports = AccountManager;
