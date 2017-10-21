const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcrypt');
const AccountManager = require("../managers/account-manager");

class TransactionTagController{
    constructor(routePrefix){
        this.routePrefix = `/${routePrefix}/account/:accountId/transaction/:transactionId/tag`;
        this.accountManager = new AccountManager();
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
        const transactionId = req.params.transactionId;
        const account = await this.accountManager.getById(accountId, req.userId);

        if(account === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{   
            const records = await models.TransactionTag.all({
                where: { 
                    transactionId: transactionId
                },
                include: [
                    {
                        model: models.Transaction,
                        where: { 
                            accountId: accountId
                         }
                    }
                ]
            });

            res.json(records.map(u => this.exporter(u, accountId)));
        }
    }

    async getById(req, res) {
        const accountId = req.params.accountId;
        const transactionId = req.params.transactionId;
        const account = await this.accountManager.getById(accountId, req.userId);

        if(account === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            const id = req.params.id;
            const record = await models.TransactionTag.findOne({
                where: { 
                    id: id,
                    transactionId: transactionId
                },
                include: [
                    {
                        model: models.Transaction,
                        where: { 
                            accountId: accountId
                         }
                    }
                ]
            });

            if(record === null){
                res.sendStatus(HttpStatus.NOT_FOUND);
            }else{
                res.json(this.exporter(record, accountId));
            }
        }
    }

    async update(req, res) {
        const accountId = req.params.accountId;
        const transactionId = req.params.transactionId;
        const account = await this.accountManager.getById(accountId, req.userId);

        if(account === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            const id = req.params.id;
            const data = req.body;
            const record = await models.TransactionTag.findOne({
                where: { 
                    id: id,
                    transactionId: transactionId
                },
                include: [
                    {
                        model: models.Transaction,
                        where: { 
                            accountId: accountId
                         }
                    }
                ]
            });

            if(record === null){
                res.sendStatus(HttpStatus.NOT_FOUND);
            }else{
                const values = {
                    note: data.note,
                    amount: data.amount
                };

                await models.TransactionTag.update(values, { where: { id: id }, fields: ['note', 'amount'] });

                res.location(`/${this.routePrefix}/${ id }`.replace(':accountId', accountId).replace(':transactionId', transactionId));
                res.sendStatus(HttpStatus.NO_CONTENT);
            }
        }
    }

    async create(req, res) {
        const accountId = req.params.accountId;
        const transactionId = req.params.transactionId;
        const account = await this.accountManager.getById(accountId, req.userId);

        if(account === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            const data = req.body;

            const record = {
                id: uuid(),
                transactionId: transactionId,
                tagId: data.tagId,
                note: data.note,
                amount: data.amount
            };

            await models.TransactionTag.create(record);
        
            res.location(`${this.routePrefix}/${ record.id }`.replace(':accountId', accountId).replace(':transactionId', transactionId));
            res.sendStatus(HttpStatus.CREATED);
        }
    }

    async remove(req, res) {
        const accountId = req.params.accountId;
        const transactionId = req.params.transactionId;
        const account = await this.accountManager.getById(accountId, req.userId);

        if(account === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            const id = req.params.id;
            const data = req.body;
            const record = await models.TransactionTag.findOne({
                where: { 
                    id: id,
                    transactionId: transactionId
                },
                include: [
                    {
                        model: models.Transaction,
                        where: { 
                            accountId: accountId
                         }
                    }
                ]
            });

            if(record === null){
                res.sendStatus(HttpStatus.NOT_FOUND);
            }else{
                await models.TransactionTag.destroy({
                    where: { 
                        id: id 
                    }
                });

                res.sendStatus(HttpStatus.NO_CONTENT);
            }
        }
    }

    exporter(record, accountId) {
        let result = {
            ts: record.ts,
            amount: record.amount,
            note: record.note,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            _links : {
                self: `${this.routePrefix}/${ record.id }`.replace(':accountId', accountId).replace(':transactionId', record.transactionId),
            }
        };

        return result;
    }
}

module.exports = TransactionTagController;