const logger = require('../../../framework/logger');
const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');

class CurrencyController{
    constructor(configuration){
        this.routePrefix = `/${configuration.routePrefix}/currency`;
    }

    buildRoutes(app){
        logger.info(`building public routes for ${this.routePrefix}`);
        
        app.get(this.routePrefix, (req, res, next) => this.getAll(req, res).catch(next));
        return [this.routePrefix];
    }

    buildAuthenticatedRoutes(app) {
        app.get(`${this.routePrefix }/:id`, (req, res, next) => this.getById(req, res).catch(next));
        app.delete(`${this.routePrefix }/:id`, (req, res, next) => this.remove(req, res).catch(next));
        app.post(`${this.routePrefix }`, (req, res, next) => this.create(req, res).catch(next));
        app.put(`${this.routePrefix }/:id`, (req, res, next) => this.update(req, res).catch(next));
    }

    async getAll(req, res) {
        const records = await models.Currency.all();

        res.json(records.map(u => this.exporter(u)));
    }

    async getById(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const id = req.params.id;
        const record = await models.Currency.findOne({
            where: { 
                id: id 
            }
        });

        if(record === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            res.json(this.exporter(record));
        }
    }

    async update(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const id = req.params.id;
        const data = req.body;
        const record = await models.Currency.findOne({
            where: { 
                id: id 
            }
        });

        if(record === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            const values = {
                code: data.code,
                description: data.description,
                symbol: data.symbol,
                isActive: data.isActive
            };

            await models.Currency.update(values, { where: { id: id }, fields: ['code', 'description', 'symbol', 'isActive'] });

            res.location(`/${this.routePrefix}/${ id }`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    async create(req, res) {
        const data = req.body;

        const record = {
            id: uuid(),
            code: data.code,
            description: data.description,
            symbol: data.symbol,
            isActive: data.isActive
        };

        await models.Currency.create(record);
      
        res.location(`${this.routePrefix}/${ record.id }`);
        res.sendStatus(HttpStatus.CREATED);
    }

    async remove(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return; 
        }

        const id = req.params.id;

        await models.Currency.destroy({
            where: { 
                id: id 
            }
        });

        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    exporter(record) {
        let result = {
            id: record.id,
            code: record.code,
            description: record.description,
            isActive: record.isActive,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            _links : {
                self: `${this.routePrefix}/${ record.id }`,
            }
        };

        return result;
    }
}

module.exports = CurrencyController;