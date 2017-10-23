const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcrypt');

class TagController{
    constructor(routePrefix){
        this.routePrefix = `/${routePrefix}/log`;
    }

    buildAuthenticatedRoutes(app) {
        app.get(this.routePrefix, (req, res, next) => this.getAll(req, res).catch(next));
        app.get(`${this.routePrefix}/:id`, (req, res, next) => this.getById(req, res).catch(next));
    }

    async getAll(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const type = req.query['type'];
        const offset = req.query['offset'] || 0;
        const limit = req.query['limit'] || 50;
        let filter = {};
        
        if(type === 'info'){
            filter = {
                type: {
                    ['in'] : ['info', 'warning', 'error']
                }
            };
        }else if(type === 'warning'){
            filter = {
                type: {
                    ['in'] : [ 'warning', 'error']
                }
            };
        }else if(type === 'error'){
            filter = {
                type: 'error'
            };
        }

        const records = await models.Log.findAndCountAll({
            where: filter,
            order: [['createdAt', 'DESC']],
            offset: offset, limit: limit
        });
        res.append('X-Total-Count', records.count);
        res.json(records.rows.map(u => this.exporter(u)));
    }

    async getById(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const id = req.params.id;
        const record = await models.Log.findOne({
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

    exporter(record) {
        return {
            id: record.id,
            type: record.type,
            log: record.log,
            data: record.data,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            _links : {
                self: `${this.routePrefix}/${ record.id }`,
            }
        };
    }
}

module.exports = TagController;