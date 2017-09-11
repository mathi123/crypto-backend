const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');

class UnitController{
    constructor(routePrefix){
        this.routePrefix = routePrefix;
    }

    buildRoutes(app){
        app.get(`/${this.routePrefix}/unit`, (req, res, next) => this.getAllUnit(req, res).catch(next));
        app.get(`/${this.routePrefix}/unit/:id`, (req, res, next) => this.getUnitById(req, res).catch(next));
        app.post(`/${this.routePrefix}/unit`, (req, res, next) => this.createUnit(req, res).catch(next));
        app.put(`/${this.routePrefix}/unit/:id`, (req, res, next) => this.updateUnit(req, res).catch(next));
        app.delete(`/${this.routePrefix}/unit/:id`, (req, res, next) => this.deleteUnit(req, res).catch(next));
    }

    async getAllUnit(req, res){
        const unitList = await models.Unit.all();
        const result = unitList.map(this.mapToUnitDto);

        res.json(result);
    }

    async getUnitById(req, res){
        const id = req.params.id;

        const unit = await models.Unit.findOne({ where: { id } });

        if (unit === null) {
            res.sendStatus(HttpStatus.NOT_FOUND);
        } else {
            res.json(this.mapToUnitDto(unit));
        }
    }

    async createUnit(req, res){
        req.checkBody('code', 'Invalid code').notEmpty();
        req.checkBody('description', 'Invalid description').notEmpty();
        req.checkBody('isBaseUnit', 'Invalid isBaseUnit').notEmpty().isBoolean();
        req.checkBody('conversionToBaseUnit', 'Invalid conversionToBaseUnit').notEmpty().isNumeric();

        const data = {
            id: uuid(),
            code: req.body.code,
            description: req.body.description,
            isBaseUnit: req.body.isBaseUnit,
            conversionToBaseUnit: req.body.conversionToBaseUnit,
        };

        await models.Unit.create(data);

        res.location(`/${this.routePrefix}/unit/${data.id}`);
        res.sendStatus(HttpStatus.CREATED);
    }

    async updateUnit(req, res){
        req.checkParams('id', 'Inalid id').notEmpty().isUUID();
        req.checkBody('code', 'Invalid code').notEmpty();
        req.checkBody('description', 'Invalid description').notEmpty();
        req.checkBody('isBaseUnit', 'Invalid isBaseUnit').notEmpty().isBoolean();
        req.checkBody('conversionToBaseUnit', 'Invalid conversionToBaseUnit').notEmpty().isNumeric();

        const id = req.params.id;
        const unit = await models.Unit.findById(id);

        if (unit === null) {
            res.sendStatus(HttpStatus.NOT_FOUND);
        } else {
            const data = {
                code: req.body.code,
                description: req.body.description,
                isBaseUnit: req.body.isBaseUnit,
                conversionToBaseUnit: req.body.conversionToBaseUnit,
            };

            await models.Unit.update(data, {
                where: {
                    id,
                }, fields: ['description', 'isBaseUnit', 'conversionToBaseUnit', 'code'],
            });

            res.location(`/${this.routePrefix}/unit/${id}`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    async deleteUnit(req, res){
        req.checkParams('id', 'Inalid id').notEmpty().isUUID();
        const id = req.params.id;

        const unit = models.Unit.findById(id);

        if (unit !== null) {
            await models.Unit.destroy({ where: { id } });
        }

        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    mapToUnitDto(unit) {
        const result = {};

        result.id = unit.id;
        result.code = unit.code;
        result.description = unit.description;
        result.isBaseUnit = unit.isBaseUnit;
        result.conversionToBaseUnit = unit.conversionToBaseUnit;

        result._links = {
            self: `/${this.routePrefix}/unit/${ result.id }`,
        };

        return result;
    }
}

module.exports = UnitController;
