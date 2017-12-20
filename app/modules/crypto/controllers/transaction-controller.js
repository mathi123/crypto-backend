const models = require('../models');
const HttpStatus = require('http-status-codes');
const AccountManager = require('../managers/account-manager');
const TransactionManager = require('../managers/transaction-manager');

class TransactionController{
    constructor(configuration){
        this.routePrefix = `/${configuration.routePrefix}/account/:accountId/transaction`;
        this.accountManager = new AccountManager(configuration);
        this.manager = new TransactionManager(configuration);
    }

    buildAuthenticatedRoutes(app) {
        app.get(this.routePrefix, (req, res, next) => this.getAll(req, res).catch(next));
        app.get(`${this.routePrefix }/:id`, (req, res, next) => this.getById(req, res).catch(next));
        app.delete(`${this.routePrefix }/:id`, (req, res, next) => this.remove(req, res).catch(next));
        app.post(`${this.routePrefix }`, (req, res, next) => this.create(req, res).catch(next));
        app.put(`${this.routePrefix }/:id`, (req, res, next) => this.update(req, res).catch(next));
    }

    async getAll(req, res) {
        const accountId = req.params.accountId;
        const account = await this.accountManager.getById(accountId, req.userId);

        if(account === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            const records = await this.manager.getAll(accountId);
            res.json(records.map(u => this.exporter(u)));
        }
    }

    async getById(req, res) {
        const accountId = req.params.accountId;
        const account = await this.accountManager.getById(accountId, req.userId);

        if(account === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            const id = req.params.id;
            const record = await this.manager.getById(id, accountId);

            if(record === null){
                res.sendStatus(HttpStatus.NOT_FOUND);
            }else{
                res.json(this.exporter(record));
            }
        }
    }

    async update(req, res) {
        const accountId = req.params.accountId;
        const account = await this.accountManager.getById(accountId, req.userId);

        if(account === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            const id = req.params.id;
            const data = req.body;
            const record = await models.Transaction.findOne({
                where: {
                    id,
                    accountId,
                },
            });

            if(record === null){
                res.sendStatus(HttpStatus.NOT_FOUND);
            }else{
                const values = {
                    note: data.note,
                };

                await models.Transaction.update(values, { where: { id }, fields: ['note'] });

                res.location(`/${this.routePrefix}/${ id }`.replace(':accountId', accountId));
                res.sendStatus(HttpStatus.NO_CONTENT);
            }
        }
    }

    async create(req, res) {
        const accountId = req.params.accountId;
        const account = await this.accountManager.getById(accountId, req.userId);

        if(account === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            /*const data = req.body;

            const coin = {
                id: uuid(),
                userId: req.userId,
                coinId: data.coinId,
                description: data.description,
                color: data.color,
                address: data.address,
                note: data.note,
                transactionType: data.transactionType
            };

            await models.Transaction.create(coin);

            res.location(`${this.routePrefix}/${ coin.id }`);*/
            res.sendStatus(HttpStatus.CREATED);
        }
    }

    async remove(req, res) {
        const accountId = req.params.accountId;
        const account = await this.accountManager.getById(accountId, req.userId);

        if(account === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            if(!req.isAdmin){
                res.sendStatus(HttpStatus.UNAUTHORIZED);
                return;
            }

            const id = req.params.id;

            await models.Transaction.destroy({
                where: {
                    id,
                },
            });

            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    exporter(record) {

        const result = {
            id: record.id,
            transactionId: record.transactionId,
            date: record.date,
            amount: record.amount,
            note: record.note,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            _links : {
                self: `${this.routePrefix}/${ record.id }`.replace(':accountId', record.accountId),
            },
        };

        return result;
    }
}

module.exports = TransactionController;
