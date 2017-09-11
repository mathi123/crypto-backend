const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');

class PermissionController{
    constructor(routePrefix){
        this.routePrefix = routePrefix;
    }

    buildRoutes(app){
        app.get(`/${this.routePrefix}/permission`, (req, res, next) => this.getAllPermission(req, res).catch(next));
        app.get(`/${this.routePrefix}/permission/:id`, (req, res, next) => this.getPermissionById(req, res).catch(next));
        app.post(`/${this.routePrefix}/permission`, (req, res, next) => this.createPermission(req, res).catch(next));
        app.put(`/${this.routePrefix}/permission/:id`, (req, res, next) => this.updatePermission(req, res).catch(next));
        app.delete(`/${this.routePrefix}/permission/:id`, (req, res, next) => this.deletePermission(req, res).catch(next));
    }

    async getAllPermission(req, res){
        const permissionList = await models.Permission.all();
        const result = permissionList.map(this.mapToPermissionDto);

        res.json(result);
    }

    async getPermissionById(req, res){
        const id = req.params.id;

        const permission = await models.Permission.findOne({ where: { id } });

        if (permission === null) {
            res.sendStatus(HttpStatus.NOT_FOUND);
        } else {
            res.json(this.mapToPermissionDto(permission));
        }
    }

    async createPermission(req, res){
        if (req.body.code === null || req.body.code === undefined) {
            throw new Error('code missing');
        }

        if (req.body.description === null || req.body.description === undefined) {
            throw new Error('description missing');
        }

        const data = {
            id: uuid(),
            code: req.body.code,
            description: req.body.description,
            // TODO add more fields
        };

        await models.Permission.create(data);

        res.location(`/${this.routePrefix}/permission/${data.id}`);
        res.sendStatus(HttpStatus.CREATED);
    }

    async updatePermission(req, res){
        // TODO add extra validation
        if (req.body.description === null || req.body.description === undefined) {
            throw new Error('description missing');
        }

        if (req.params.id === null || req.params.id === undefined) {
            throw new Error('id missing');
        }

        const id = req.params.id;
        const permission = await models.Permission.findOne({ where: { id } });

        if (permission === null) {
            res.sendStatus(HttpStatus.NOT_FOUND);
        } else {
            const data = {
                description: req.body.description,
            };

            await models.Permission.update(data, {
                where: {
                    id,
                }, fields: ['description'], // Todo check fields to update
            });

            res.location(`/${this.routePrefix}/permission/${id}`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    async deletePermission(req, res){
        const id = req.params.id;

        const permission = models.Permission.findOne({ where: { id } });

        if (permission !== null) {
            await models.Permission.destroy({ where: { id } });
        }

        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    mapToPermissionDto(permission) {
        const result = {};

        result.id = permission.id;
        result.code = permission.code;

        // TODO add more relevant fields

        result._links = {
            self: `/${this.routePrefix}/permission/${ result.id }`,
        };

        return result;
    }
}

module.exports = PermissionController;
