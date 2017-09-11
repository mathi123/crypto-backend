const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');

class RoleController{
    constructor(routePrefix){
        this.routePrefix = routePrefix;
    }

    buildRoutes(app){
        app.get(`/${this.routePrefix}/role`, (req, res, next) => this.getAllRole(req, res).catch(next));
        app.get(`/${this.routePrefix}/role/:id`, (req, res, next) => this.getRoleById(req, res).catch(next));
        app.post(`/${this.routePrefix}/role`, (req, res, next) => this.createRole(req, res).catch(next));
        app.put(`/${this.routePrefix}/role/:id`, (req, res, next) => this.updateRole(req, res).catch(next));
        app.delete(`/${this.routePrefix}/role/:id`, (req, res, next) => this.deleteRole(req, res).catch(next));
    }

    async getAllRole(req, res){
        const roleList = await models.Role.all();
        const result = roleList.map(this.mapToRoleDto);

        res.json(result);
    }

    async getRoleById(req, res){
        const id = req.params.id;

        const role = await models.Role.findOne({ where: { id } });

        if (role === null) {
            res.sendStatus(HttpStatus.NOT_FOUND);
        } else {
            res.json(this.mapToRoleDto(role));
        }
    }

    async createRole(req, res){
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

        await models.Role.create(data);

        res.location(`/${this.routePrefix}/role/${data.id}`);
        res.sendStatus(HttpStatus.CREATED);
    }

    async updateRole(req, res){
        // TODO add extra validation
        if (req.body.description === null || req.body.description === undefined) {
            throw new Error('description missing');
        }

        if (req.params.id === null || req.params.id === undefined) {
            throw new Error('id missing');
        }

        const id = req.params.id;
        const role = await models.Role.findOne({ where: { id } });

        if (role === null) {
            res.sendStatus(HttpStatus.NOT_FOUND);
        } else {
            const data = {
                description: req.body.description,
            };

            await models.Role.update(data, {
                where: {
                    id,
                }, fields: ['description'], // Todo check fields to update
            });

            res.location(`/${this.routePrefix}/role/${id}`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    async deleteRole(req, res){
        const id = req.params.id;

        const role = models.Role.findOne({ where: { id } });

        if (role !== null) {
            await models.Role.destroy({ where: { id } });
        }

        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    mapToRoleDto(role) {
        const result = {};

        result.id = role.id;
        result.code = role.code;

        // TODO add more relevant fields

        result._links = {
            self: `/${this.routePrefix}/role/${ result.id }`,
        };

        return result;
    }
}

module.exports = RoleController;
