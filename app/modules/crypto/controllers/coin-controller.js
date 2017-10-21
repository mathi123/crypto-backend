const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcrypt');

class CoinController{
    constructor(routePrefix){
        this.routePrefix = `/${routePrefix}/coin`;
    }

    buildAuthenticatedRoutes(app) {
        app.get(this.routePrefix, (req, res, next) => this.getAll(req, res).catch(next));
        app.get(`${this.routePrefix }/:id`, (req, res, next) => this.getById(req, res).catch(next));
        app.delete(`${this.routePrefix }/:id`, (req, res, next) => this.remove(req, res).catch(next));
        app.post(`${this.routePrefix }`, (req, res, next) => this.create(req, res).catch(next));
        app.put(`${this.routePrefix }/:id`, (req, res, next) => this.update(req, res).catch(next));
    }

    async getAll(req, res) {
        const records = await models.Coin.all();

        res.json(records.map(u => this.exporter(u, req.isAdmin)));
    }

    async getById(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const id = req.params.id;
        const record = await models.Coin.findOne({
            where: { 
                id: id 
            }
        });

        if(record === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            res.json(this.exporter(record, req.isAdmin));
        }
    }

    async update(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const id = req.params.id;
        const data = req.body;
        const record = await models.Coin.findOne({
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
                isActive: data.isActive,
                coinType: data.coinType,
                baseAddress: data.baseAddress,
                decimals: data.decimals
            };

            await models.Coin.update(values, { where: { id: id }, fields: ['code', 'description', 'isActive', 'coinType', 'baseAddress', 'decimals'] });

            res.location(`/${this.routePrefix}/${ id }`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    async create(req, res) {
        const data = req.body;

        const coin = {
            id: uuid(),
            code: data.code,
            description: data.description,
            isActive: data.isActive,
            coinType: data.coinType,
            baseAddress: data.baseAddress,
            decimals: data.decimals
        };

        await models.Coin.create(coin);
      
        res.location(`${this.routePrefix}/${ coin.id }`);
        res.sendStatus(HttpStatus.CREATED);
    }

    async remove(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return; 
        }

        const id = req.params.id;

        await models.Coin.destroy({
            where: { 
                id: id 
            }
        });

        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    exporter(record, isAdmin) {
        let result = {
            id: record.id,
            code: record.code,
            description: record.description,
        };

        if(isAdmin){
            result.isActive = record.isActive;
            result.coinType = record.coinType;
            result.baseAddress = record.baseAddress;
            result.decimals = record.decimals;
            result.createdAt = record.createdAt;
            result.updatedAt = record.updatedAt;
            result._links = {
                self: `${this.routePrefix}/${ record.id }`,
            };
        }

        return result;
    }
}

module.exports = CoinController;