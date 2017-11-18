const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');
const AccountManager = require('../managers/account-manager');
const TransactionManager = require('../managers/transaction-manager');

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
        const record = await models.Account.findOne({
            where: {
                id,
                userId: req.userId,
            },
        });

        if(record === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            const values = {
                description: data.description,
                color: data.color,
                address: data.address,
                note: data.note,
                transactionType: data.transactionType,
            };

            await models.Account.update(values, { where: { id }, fields: ['description', 'color', 'address', 'note', 'transactionType'] });

            // reload transactions but don't wait for the result
            this.transactionManager.loadTransactions(record.id);

            res.location(`/${this.routePrefix}/${ id }`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    async create(req, res) {
        const data = req.body;

        const record = {
            id: uuid(),
            userId: req.userId,
            coinId: data.coinId,
            description: data.description,
            color: data.color,
            address: data.address,
            note: data.note,
            transactionType: data.transactionType,
        };

        await models.Account.create(record);

        // load transactions but don't wait for the result
        this.transactionManager.loadTransactions(record.id);

        res.location(`${this.routePrefix}/${ record.id }`);
        res.sendStatus(HttpStatus.CREATED);
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
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            _links : {
                self: `${this.routePrefix}/${ record.id }`,
            },
        };

        return result;
    }
}

module.exports = AccountController;
