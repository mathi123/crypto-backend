const logger = require('../../../framework/logger');
const models = require('../models');
const CoinManager = require('./coin-manager');
const sequelize = require('sequelize');
const uuid = require('uuid/v4');
const TransactionManager = require('./transaction-manager');
const AccountColorManager = require('./account-color-manager');

class AccountManager{
    constructor(configuration){
        this.chainManager = new CoinManager(configuration);
        this.transactionManager = new TransactionManager(configuration);
        this.colorManager = new AccountColorManager();
    }

    async getAccountsByStatus(stateFilter){
        logger.verbose('getting all accounts');

        const options = {
            where:{
                state: stateFilter,
            },
        };

        const accounts = await models.Account.findAll(options);
        return accounts;
    }

    async getUserAccounts(userId){
        const now = new Date();
        const timestamp = now.getTime();
        const oneHour = new Date(timestamp - 3600 * 1000);
        const oneDay = new Date(timestamp - 24 * 3600 * 1000);
        const lastWeek = new Date(timestamp - 7 * 24 * 3600 * 1000);
        const oneMonth = new Date(timestamp - 30 * 24 * 3600 * 1000);
        const parameters = [now, oneHour, lastWeek, oneMonth, userId, oneDay];

        const records = await sequelize.Current.query(`
        SELECT
        "Account".*,
        COALESCE(txnCount."txnCount", 0) AS "txnCount",
        COALESCE(qryNow.amount, 0)      AS "balance",
        COALESCE(oneHour.amount, 0)     AS "balanceOneHourAgo",
        COALESCE(oneWeekAgo.amount, 0)  AS "balanceOneWeekAgo",
        COALESCE(oneDayAgo.amount, 0)  AS "balanceOneDayAgo",
        COALESCE(oneMonthAgo.amount, 0) AS "balanceOneMonthAgo",
        COALESCE(priceNow.price, 0) AS "priceNow",
        priceNow."date" as "priceNowTs",
        COALESCE(priceOneHour.price, 0) AS "priceOneHour",
        priceOneHour."date" as "priceOneHourTs",
        COALESCE(priceOneDay.price, 0) AS "priceOneDay",
        priceOneDay."date" as "priceOneDayTs",
        COALESCE(priceLastWeek.price, 0) AS "priceLastWeek",
        priceLastWeek."date" as "priceLastWeekTs",
        COALESCE(priceLastMonth.price, 0) AS "priceLastMonth",
        priceLastMonth."date" as "priceLastMonthTs",
        coin."code" AS "coinCode",
        coin."fileId" AS "coinFileId",
        coin."description" AS "coinDescription",
        ROUND(-1 + COALESCE(priceNow.price, 0) / COALESCE(priceOneDay.price, 0), 2) AS "priceDiff"
      FROM "Account"
        JOIN "Coin" coin 
          ON coin."id" = "Account"."coinId"
        LEFT JOIN (SELECT COUNT(*) "txnCount", "accountId" FROM "Transaction" GROUP BY "accountId") txnCount 
            ON txnCount."accountId" = "Account"."id"
        LEFT JOIN
        (
          SELECT
            "accountId",
            SUM("Transaction".amount) AS amount
          FROM "Transaction"
          GROUP BY "accountId"
        ) qryNow
          ON "Account".id = qryNow."accountId"
        LEFT JOIN
        (
          SELECT
            "accountId",
            SUM("Transaction".amount) AS amount
          FROM "Transaction"
          WHERE date <= $2
          GROUP BY "accountId"
        ) oneHour
          ON "Account".id = oneHour."accountId"
        LEFT JOIN
          (
            SELECT
              "accountId",
              SUM("Transaction".amount) AS amount
            FROM "Transaction"
            WHERE date <= $6
            GROUP BY "accountId"
          ) oneDayAgo
            ON "Account".id = oneDayAgo."accountId"
        LEFT JOIN
        (
          SELECT
            "accountId",
            SUM("Transaction".amount) AS amount
          FROM "Transaction"
          WHERE date <= $3
          GROUP BY "accountId"
        ) oneWeekAgo
          ON "Account".id = oneWeekAgo."accountId"
        LEFT JOIN
        (
          SELECT
            "accountId",
            SUM("Transaction".amount) AS amount
          FROM "Transaction"
          WHERE date <= $4
          GROUP BY "accountId"
        ) oneMonthAgo
          ON "Account".id = oneMonthAgo."accountId"
        LEFT JOIN
        (
          SELECT
            "Price"."price",
            "Price"."date",
            "Price"."coinId"
          FROM "Price"
            JOIN
            (SELECT
               "a"."coinId",
               "a"."currencyId",
               MIN(LEAST(date - $1, - (date - $1))) AS diff
             FROM ((SELECT
                      "Price"."coinId",
                      "Price"."currencyId",
                      max("Price"."date") AS date
                    FROM "Price"
                    WHERE date <= $1
                    GROUP BY "Price"."coinId", "Price"."currencyId")
                   UNION ALL
                   (SELECT
                      "Price"."coinId",
                      "Price"."currencyId",
                      min("Price"."date") AS date
                    FROM "Price"
                    WHERE date > $1
                    GROUP BY "Price"."coinId", "Price"."currencyId")) a
             GROUP BY "a"."coinId", "a"."currencyId"
            ) ml
              ON "Price"."currencyId" = ml."currencyId" AND "Price"."coinId" = ml."coinId"
          WHERE
            LEAST("Price"."date" - $1, -("Price"."date" - $1)) = ml."diff"
            AND "Price"."currencyId" = (SELECT "Users"."currencyId"
                                        FROM "Users"
                                        WHERE "Users"."id" = $5)
        ) priceNow
          ON "Account"."coinId" = priceNow."coinId"
        
        LEFT JOIN
          (
            SELECT
              "Price"."price",
              "Price"."date",
              "Price"."coinId"
            FROM "Price"
              JOIN
              (SELECT
                 "a"."coinId",
                 "a"."currencyId",
                 MIN(LEAST(date - $2, -(date - $2))) AS diff
               FROM ((SELECT
                        "Price"."coinId",
                        "Price"."currencyId",
                        max("Price"."date") AS date
                      FROM "Price"
                      WHERE date <= $2
                      GROUP BY "Price"."coinId", "Price"."currencyId")
                     UNION ALL
                     (SELECT
                        "Price"."coinId",
                        "Price"."currencyId",
                        min("Price"."date") AS date
                      FROM "Price"
                      WHERE date > $2
                      GROUP BY "Price"."coinId", "Price"."currencyId")) a
               GROUP BY "a"."coinId", "a"."currencyId"
              ) ml
                ON "Price"."currencyId" = ml."currencyId" AND "Price"."coinId" = ml."coinId"
            WHERE
              LEAST("Price"."date" - $2, -("Price"."date" - $2)) = ml."diff"
              AND "Price"."currencyId" = (SELECT "Users"."currencyId"
                                          FROM "Users"
                                          WHERE "Users"."id" = $5)
          ) priceOneHour
            ON "Account"."coinId" = priceOneHour."coinId"
            
        LEFT JOIN
            (
            SELECT
                "Price"."price",
                "Price"."date",
                "Price"."coinId"
            FROM "Price"
                JOIN
                (SELECT
                    "a"."coinId",
                    "a"."currencyId",
                    MIN(LEAST(date - $6, -(date - $6))) AS diff
                FROM ((SELECT
                        "Price"."coinId",
                        "Price"."currencyId",
                        max("Price"."date") AS date
                        FROM "Price"
                        WHERE date <= $6
                        GROUP BY "Price"."coinId", "Price"."currencyId")
                        UNION ALL
                        (SELECT
                        "Price"."coinId",
                        "Price"."currencyId",
                        min("Price"."date") AS date
                        FROM "Price"
                        WHERE date > $6
                        GROUP BY "Price"."coinId", "Price"."currencyId")) a
                GROUP BY "a"."coinId", "a"."currencyId"
                ) ml
                ON "Price"."currencyId" = ml."currencyId" AND "Price"."coinId" = ml."coinId"
            WHERE
                LEAST("Price"."date" - $6, -("Price"."date" - $6)) = ml."diff"
                AND "Price"."currencyId" = (SELECT "Users"."currencyId"
                                            FROM "Users"
                                            WHERE "Users"."id" = $5)
            ) priceOneDay
            ON "Account"."coinId" = priceOneDay."coinId"
            
        LEFT JOIN
            (
            SELECT
                "Price"."price",
                "Price"."date",
                "Price"."coinId"
            FROM "Price"
                JOIN
                (SELECT
                    "a"."coinId",
                    "a"."currencyId",
                    MIN(LEAST(date - $3, -(date - $3))) AS diff
                FROM ((SELECT
                        "Price"."coinId",
                        "Price"."currencyId",
                        max("Price"."date") AS date
                        FROM "Price"
                        WHERE date <= $3
                        GROUP BY "Price"."coinId", "Price"."currencyId")
                        UNION ALL
                        (SELECT
                        "Price"."coinId",
                        "Price"."currencyId",
                        min("Price"."date") AS date
                        FROM "Price"
                        WHERE date > $3
                        GROUP BY "Price"."coinId", "Price"."currencyId")) a
                GROUP BY "a"."coinId", "a"."currencyId"
                ) ml
                ON "Price"."currencyId" = ml."currencyId" AND "Price"."coinId" = ml."coinId"
            WHERE
                LEAST("Price"."date" - $3, -("Price"."date" - $3)) = ml."diff"
                AND "Price"."currencyId" = (SELECT "Users"."currencyId"
                                            FROM "Users"
                                            WHERE "Users"."id" = $5)
            ) priceLastWeek
            ON "Account"."coinId" = priceLastWeek."coinId"
                
        LEFT JOIN
            (
            SELECT
                "Price"."price",
                "Price"."date",
                "Price"."coinId"
            FROM "Price"
                JOIN
                (SELECT
                    "a"."coinId",
                    "a"."currencyId",
                    MIN(LEAST(date - $4, -(date - $4))) AS diff
                FROM ((SELECT
                        "Price"."coinId",
                        "Price"."currencyId",
                        max("Price"."date") AS date
                        FROM "Price"
                        WHERE date <= $4
                        GROUP BY "Price"."coinId", "Price"."currencyId")
                        UNION ALL
                        (SELECT
                        "Price"."coinId",
                        "Price"."currencyId",
                        min("Price"."date") AS date
                        FROM "Price"
                        WHERE date > $4
                        GROUP BY "Price"."coinId", "Price"."currencyId")) a
                GROUP BY "a"."coinId", "a"."currencyId"
                ) ml
                ON "Price"."currencyId" = ml."currencyId" AND "Price"."coinId" = ml."coinId"
            WHERE
                LEAST("Price"."date" - $4, -("Price"."date" - $4)) = ml."diff"
                AND "Price"."currencyId" = (SELECT "Users"."currencyId"
                                            FROM "Users"
                                            WHERE "Users"."id" = $5)
            ) priceLastMonth
            ON "Account"."coinId" = priceLastMonth."coinId"

      WHERE "Account"."userId" = $5
      ORDER BY "Account"."description" ASC, "Account"."createdAt" ASC`, { bind: parameters, type: sequelize.QueryTypes.SELECT });

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
            this.loadTransactionsFireAndForget(record.id);
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

        if(record.color === null || record.color === undefined){
            record.color = (await this.colorManager.getNextColor(userId)).code;
        }

        await models.Account.create(record);

        // load transactions but don't wait for the result
        if(record.transactionType === 'auto'){
            this.loadTransactionsFireAndForget(record.id);
        }

        return record;
    }

    loadTransactionsFireAndForget(accountId){
        this.transactionManager.loadTransactions(accountId);
    }
}

module.exports = AccountManager;
