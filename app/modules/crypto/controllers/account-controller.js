const models = require('../models');
const HttpStatus = require('http-status-codes');
const AccountManager = require('../managers/account-manager');
const TransactionManager = require('../managers/transaction-manager');
const logger = require('../../../framework/logger');

class AccountController{
    constructor(configuration){
        this.routePrefix = `/${configuration.routePrefix}/account`;
        this.manager = new AccountManager(configuration);
        this.transactionManager = new TransactionManager(configuration);
    }

    buildAuthenticatedRoutes(app) {
        app.get(this.routePrefix, (req, res, next) => this.getAll(req, res).catch(next));
        app.get(`${this.routePrefix}/validate`, (req, res, next) => this.validate(req, res).catch(next));
        app.get(`${this.routePrefix }/:id`, (req, res, next) => this.getById(req, res).catch(next));
        app.delete(`${this.routePrefix }/:id`, (req, res, next) => this.remove(req, res).catch(next));
        app.post(`${this.routePrefix }`, (req, res, next) => this.create(req, res).catch(next));
        app.put(`${this.routePrefix }/:id`, (req, res, next) => this.update(req, res).catch(next));
    }

    async getAll(req, res) {
        const records = await this.manager.getUserAccounts(req.userId);

        res.json(records.map(u => this.exporter(u)));
    }

    async getById(req, res) {
        const id = req.params.id;
        const record = await this.manager.getById(id, req.userId);

        if(record === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            res.json(this.exporter(record));
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
            const balance = await this.manager.getBalance(req.query.coinId, req.query.address);
            result.isValid = true;
            result.balance = balance;
        }catch(err){
            logger.warn(`invalid address: ${req.query.address}`);
            logger.error(err);
            result.isValid = false;
            result.balance = NaN;
        }

        res.json(result);
    }

    exporter(record) {
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
            coinCode: record.coinCode,
            coinDescription: record.coinDescription,
            coinFileId: record.coinFileId,
            balance: record.balance,
            balanceOneHourAgo: record.balanceOneHourAgo,
            balanceOneDayAgo: record.balanceOneDayAgo,
            balanceOneWeekAgo: record.balanceOneWeekAgo,
            balanceOneMonthAgo: record.balanceOneMonthAgo,
            priceNow: record.priceNow,
            priceNowTs: record.priceNowTs,
            priceOneHour: record.priceOneHour,
            priceOneDay: record.priceOneDay,
            priceOneHourTs: record.priceOneHourTs,
            priceLastWeek: record.priceLastWeek,
            priceLastWeekTs: record.priceLastWeekTs,
            priceLastMonth: record.priceLastMonth,
            priceLastMonthTs: record.priceLastMonthTs,
            txnCount: record.txnCount,
            _links : {
                self: `${this.routePrefix}/${ record.id }`,
            },
        };

        return result;
    }
}

module.exports = AccountController;
