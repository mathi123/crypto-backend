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
        const oneHour = Math.floor(new Date(timestamp - 3600 * 1000).getTime());
        const lastWeek = Math.floor(new Date(timestamp - 7 * 24 * 3600 * 1000).getTime());
        const oneMonth = Math.floor(new Date(timestamp - 30 * 24 * 3600 * 1000).getTime());
        const parameters = [timestamp, oneHour, lastWeek, oneMonth, userId];

        logger.verbose(JSON.stringify(parameters));

        const records = await sequelize.Current.query(`
        SELECT
        "Account".*,
        COALESCE(qryNow.amount, 0)      AS balance,
        COALESCE(oneHour.amount, 0)     AS balanceOneHourAgo,
        COALESCE(oneWeekAgo.amount, 0)  AS balanceOneWeekAgo,
        COALESCE(oneMonthAgo.amount, 0) AS balanceOneMonthAgo,
        COALESCE(priceNow.price, 0) AS priceNow,
        priceNow.ts as priceNowTs,
        COALESCE(priceOneHour.price, 0) AS priceOneHour,
        priceOneHour.ts as priceOneHourTs,
        COALESCE(priceLastWeek.price, 0) AS priceLastWeek,
        priceLastWeek.ts as priceLastWeekTs,
        COALESCE(priceLastMonth.price, 0) AS priceLastMonth,
        priceLastMonth.ts as priceLastMonthTs,
        coin."code" AS coinCode,
        coin."fileId" AS coinFileId,
        coin."description" AS coinDescription
      FROM "Account"
        JOIN "Coin" coin 
          ON coin."id" = "Account"."coinId"
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
          WHERE ts <= $2
          GROUP BY "accountId"
        ) oneHour
          ON "Account".id = oneHour."accountId"
        LEFT JOIN
        (
          SELECT
            "accountId",
            SUM("Transaction".amount) AS amount
          FROM "Transaction"
          WHERE ts <= $3
          GROUP BY "accountId"
        ) oneWeekAgo
          ON "Account".id = oneWeekAgo."accountId"
        LEFT JOIN
        (
          SELECT
            "accountId",
            SUM("Transaction".amount) AS amount
          FROM "Transaction"
          WHERE ts <= $4
          GROUP BY "accountId"
        ) oneMonthAgo
          ON "Account".id = oneMonthAgo."accountId"
        LEFT JOIN
        (
          SELECT
            "Price"."price",
            "Price"."ts",
            "Price"."coinId"
          FROM "Price"
            JOIN
            (SELECT
               "a"."coinId",
               "a"."currencyId",
               MIN(ABS(ts - $1)) AS diff
             FROM ((SELECT
                      "Price"."coinId",
                      "Price"."currencyId",
                      max("Price"."ts") AS ts
                    FROM "Price"
                    WHERE ts <= $1
                    GROUP BY "Price"."coinId", "Price"."currencyId")
                   UNION ALL
                   (SELECT
                      "Price"."coinId",
                      "Price"."currencyId",
                      min("Price"."ts") AS ts
                    FROM "Price"
                    WHERE ts > $1
                    GROUP BY "Price"."coinId", "Price"."currencyId")) a
             GROUP BY "a"."coinId", "a"."currencyId"
            ) ml
              ON "Price"."currencyId" = ml."currencyId" AND "Price"."coinId" = ml."coinId"
          WHERE
            ABS("Price"."ts" - $1) = ml."diff"
            AND "Price"."currencyId" = (SELECT "Users"."currencyId"
                                        FROM "Users"
                                        WHERE "Users"."id" = $5)
        ) priceNow
          ON "Account"."coinId" = priceNow."coinId"
        
        LEFT JOIN
          (
            SELECT
              "Price"."price",
              "Price"."ts",
              "Price"."coinId"
            FROM "Price"
              JOIN
              (SELECT
                 "a"."coinId",
                 "a"."currencyId",
                 MIN(ABS(ts - $2)) AS diff
               FROM ((SELECT
                        "Price"."coinId",
                        "Price"."currencyId",
                        max("Price"."ts") AS ts
                      FROM "Price"
                      WHERE ts <= $2
                      GROUP BY "Price"."coinId", "Price"."currencyId")
                     UNION ALL
                     (SELECT
                        "Price"."coinId",
                        "Price"."currencyId",
                        min("Price"."ts") AS ts
                      FROM "Price"
                      WHERE ts > $2
                      GROUP BY "Price"."coinId", "Price"."currencyId")) a
               GROUP BY "a"."coinId", "a"."currencyId"
              ) ml
                ON "Price"."currencyId" = ml."currencyId" AND "Price"."coinId" = ml."coinId"
            WHERE
              ABS("Price"."ts" - $2) = ml."diff"
              AND "Price"."currencyId" = (SELECT "Users"."currencyId"
                                          FROM "Users"
                                          WHERE "Users"."id" = $5)
          ) priceOneHour
            ON "Account"."coinId" = priceOneHour."coinId"
            
        LEFT JOIN
            (
            SELECT
                "Price"."price",
                "Price"."ts",
                "Price"."coinId"
            FROM "Price"
                JOIN
                (SELECT
                    "a"."coinId",
                    "a"."currencyId",
                    MIN(ABS(ts - $3)) AS diff
                FROM ((SELECT
                        "Price"."coinId",
                        "Price"."currencyId",
                        max("Price"."ts") AS ts
                        FROM "Price"
                        WHERE ts <= $3
                        GROUP BY "Price"."coinId", "Price"."currencyId")
                        UNION ALL
                        (SELECT
                        "Price"."coinId",
                        "Price"."currencyId",
                        min("Price"."ts") AS ts
                        FROM "Price"
                        WHERE ts > $3
                        GROUP BY "Price"."coinId", "Price"."currencyId")) a
                GROUP BY "a"."coinId", "a"."currencyId"
                ) ml
                ON "Price"."currencyId" = ml."currencyId" AND "Price"."coinId" = ml."coinId"
            WHERE
                ABS("Price"."ts" - $3) = ml."diff"
                AND "Price"."currencyId" = (SELECT "Users"."currencyId"
                                            FROM "Users"
                                            WHERE "Users"."id" = $5)
            ) priceLastWeek
            ON "Account"."coinId" = priceLastWeek."coinId"
                
        LEFT JOIN
            (
            SELECT
                "Price"."price",
                "Price"."ts",
                "Price"."coinId"
            FROM "Price"
                JOIN
                (SELECT
                    "a"."coinId",
                    "a"."currencyId",
                    MIN(ABS(ts - $4)) AS diff
                FROM ((SELECT
                        "Price"."coinId",
                        "Price"."currencyId",
                        max("Price"."ts") AS ts
                        FROM "Price"
                        WHERE ts <= $4
                        GROUP BY "Price"."coinId", "Price"."currencyId")
                        UNION ALL
                        (SELECT
                        "Price"."coinId",
                        "Price"."currencyId",
                        min("Price"."ts") AS ts
                        FROM "Price"
                        WHERE ts > $4
                        GROUP BY "Price"."coinId", "Price"."currencyId")) a
                GROUP BY "a"."coinId", "a"."currencyId"
                ) ml
                ON "Price"."currencyId" = ml."currencyId" AND "Price"."coinId" = ml."coinId"
            WHERE
                ABS("Price"."ts" - $4) = ml."diff"
                AND "Price"."currencyId" = (SELECT "Users"."currencyId"
                                            FROM "Users"
                                            WHERE "Users"."id" = $5)
            ) priceLastMonth
            ON "Account"."coinId" = priceLastMonth."coinId"

      WHERE "Account"."userId" = $5`, { bind: parameters, type: sequelize.QueryTypes.SELECT });

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
