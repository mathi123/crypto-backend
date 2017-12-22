const models = require('../models');
const HttpStatus = require('http-status-codes');
const AccountManager = require('../managers/account-manager');
const TransactionManager = require('../managers/transaction-manager');
const logger = require('../../../framework/logger');
const AccountColorManager = require('../managers/account-color-manager');

class AccountController{
    constructor(configuration){
        this.routePrefix = `/${configuration.routePrefix}/account`;
        this.manager = new AccountManager(configuration);
        this.transactionManager = new TransactionManager(configuration);
        this.colorManager = new AccountColorManager();
    }

    buildAuthenticatedRoutes(app) {
        app.get(this.routePrefix, (req, res, next) => this.getAll(req, res).catch(next));
        app.get(`${this.routePrefix}/validate`, (req, res, next) => this.validate(req, res).catch(next));
        app.get(`${this.routePrefix }/:id`, (req, res, next) => this.getById(req, res).catch(next));
        app.get(`${this.routePrefix}-color`, (req, res, next) => this.getColors(req, res).catch(next));
        app.delete(`${this.routePrefix }/:id`, (req, res, next) => this.remove(req, res).catch(next));
        app.post(`${this.routePrefix }`, (req, res, next) => this.create(req, res).catch(next));
        app.put(`${this.routePrefix }/:id`, (req, res, next) => this.update(req, res).catch(next));
        app.post(`${this.routePrefix }/:id/import`, (req, res, next) => this.import(req, res).catch(next));
    }

    async getColors(req, res){
        const colors = this.colorManager.getAllColors();
        res.json(colors);
    }

    async getAll(req, res) {
        const stateFilter = req.query.state;

        if(stateFilter !== null && stateFilter !== undefined){
            if(!req.isAdmin){
                res.sendStatus(HttpStatus.UNAUTHORIZED);
                return;
            } else {
                const records = await this.manager.getAccountsByStatus(stateFilter);
                res.json(records.map(u => this.export(u, false)));
            }
        } else {
            const records = await this.manager.getUserAccounts(req.userId);

            res.json(records.map(u => this.export(u, true)));
        }
    }

    async getById(req, res) {
        const id = req.params.id;
        const record = await this.manager.getById(id, req.userId);

        if(record === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            res.json(this.export(record));
        }
    }

    async update(req, res) {
        const id = req.params.id;
        const data = req.body;

        try{
            await this.manager.updateWithUserCheck(req.userId, id, data);
            res.location(`/${this.routePrefix}/${ id }`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }catch(error){
            logger.error('could not update account');
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async import(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const id = req.params.id;

        try{
            this.manager.loadTransactionsFireAndForget(id);

            res.location(`/${this.routePrefix}/${ id }`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }catch(error){
            logger.error('could not start import of account txns');
            logger.error(error);
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async create(req, res) {
        const data = req.body;

        try{
            const record = await this.manager.create(req.userId, data);
            res.location(`${this.routePrefix}/${ record.id }`);
            res.sendStatus(HttpStatus.CREATED);
        }catch(error){
            logger.error('could not create account');
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async remove(req, res) {
        const id = req.params.id;
        const record = await this.manager.getById(id, req.userId);

        if(record === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
            return;
        }

        await models.Account.destroy({
            where: {
                id,
            },
        });

        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    async validate(req, res) {
        const result = {};
        try{
            result.isValid = await this.manager.isValidAddress(req.query.coinId, req.query.address);
        }catch(err){
            logger.warn(`invalid address: ${req.query.address}`);
            logger.error(err);
            result.isValid = false;
        }

        res.json(result);
    }

    export(record, includeBalance) {
        const result = {
            id: record.id,
            coinId: record.coinId,
            description: record.description,
            color: record.color,
            address: record.address,
            note: record.note,
            transactionType: record.transactionType,
            state: record.state,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            _links : {
                self: `${this.routePrefix}/${ record.id }`,
            },
        };

        if(record.Coin !== undefined){
            result.coinDescription = record.Coin.description;
            result.coinCode = record.Coin.code;
            result.coinFileId = record.Coin.fileId;
        }

        if(includeBalance){
            result.coinCode = record.coinCode;
            result.coinDescription = record.coinDescription;
            result.coinFileId = record.coinFileId;
            result.balance = record.balance;
            result.balanceOneHourAgo = record.balanceOneHourAgo;
            result.balanceOneDayAgo = record.balanceOneDayAgo;
            result.balanceOneWeekAgo = record.balanceOneWeekAgo;
            result.balanceOneMonthAgo = record.balanceOneMonthAgo;
            result.priceNow = record.priceNow;
            result.priceNowTs = record.priceNowTs;
            result.priceOneHour = record.priceOneHour;
            result.priceOneDay = record.priceOneDay;
            result.priceOneHourTs = record.priceOneHourTs;
            result.priceLastWeek = record.priceLastWeek;
            result.priceLastWeekTs = record.priceLastWeekTs;
            result.priceLastMonth = record.priceLastMonth;
            result.priceLastMonthTs = record.priceLastMonthTs;
            result.txnCount = record.txnCount;
            result.priceDiff = record.priceDiff;
        }

        return result;
    }
}

module.exports = AccountController;
