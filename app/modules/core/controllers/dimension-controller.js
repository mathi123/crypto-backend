const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');

class DimensionController{
    constructor(routePrefix){
        this.routePrefix = routePrefix;
    }

    buildRoutes(app){
        app.get(`/${this.routePrefix}/dimension`, (req, res, next) => this.getAllDimension(req, res).catch(next));
        app.get(`/${this.routePrefix}/dimension/:id`, (req, res, next) => this.getDimensionById(req, res).catch(next));
        app.post(`/${this.routePrefix}/dimension`, (req, res, next) => this.createDimension(req, res).catch(next));
        app.put(`/${this.routePrefix}/dimension/:id`, (req, res, next) => this.updateDimension(req, res).catch(next));
        app.delete(`/${this.routePrefix}/dimension/:id`, (req, res, next) => this.deleteDimension(req, res).catch(next));
    }

    async getAllDimension(req, res){
        const dimensionList = await models.Dimension.all();
        const result = dimensionList.map(this.mapToDimensionDto);

        res.json(result);
    }

    async getDimensionById(req, res){
        req.checkParams('id', 'Invalid id').notEmpty().isUUID();
        const id = req.params.id;

        const dimension = await models.Dimension.findById(id);

        if (dimension === null) {
            res.sendStatus(HttpStatus.NOT_FOUND);
        } else {
            res.json(this.mapToDimensionDto(dimension));
        }
    }

    async createDimension(req, res){
        req.checkBody('code', 'Invalid code').notEmpty();
        req.checkBody('description', 'Invalid description').notEmpty();

        const data = {
            id: uuid(),
            code: req.body.code,
            description: req.body.description,
        };

        await models.Dimension.create(data);

        res.location(`/${this.routePrefix}/dimension/${data.id}`);
        res.sendStatus(HttpStatus.CREATED);
    }

    async updateDimension(req, res){
        req.checkParams('id', 'Invalid id').notEmpty().isUUID();
        req.checkBody('code', 'Invalid code').notEmpty();
        req.checkBody('description', 'Invalid description').notEmpty();

        const id = req.params.id;
        const dimension = await models.Dimension.findById(id);

        if (dimension === null) {
            res.sendStatus(HttpStatus.NOT_FOUND);
        } else {
            const data = {
                description: req.body.description,
            };

            await models.Dimension.update(data, {
                where: {
                    id,
                }, fields: ['code', 'description'],
            });

            res.location(`/${this.routePrefix}/dimension/${id}`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    async deleteDimension(req, res){
        req.checkParams('id', 'Invalid id').notEmpty().isUUID();

        const id = req.params.id;

        const dimension = models.Dimension.findById(id);

        if (dimension !== null) {
            await models.Dimension.destroy({ where: { id } });
        }

        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    mapToDimensionDto(dimension) {
        const result = {};

        result.id = dimension.id;
        result.code = dimension.code;
        result.description = dimension.description;

        result._links = {
            self: `/${this.routePrefix}/dimension/${ result.id }`,
            translations: `/${this.routePrefix}/dimension/${ result.id }/translation`,
        };

        return result;
    }
}

module.exports = DimensionController;
