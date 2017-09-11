const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');

class DimensionTranslationController{
    constructor(routePrefix){
        this.routePrefix = routePrefix;
    }

    buildRoutes(app){
        app.get(`/${this.routePrefix}/dimension/:dimensionId/translation`, (req, res, next) => this.getAllDimensionTranslation(req, res).catch(next));
        app.get(`/${this.routePrefix}/dimension/:dimensionId/translation/:id`, (req, res, next) => this.getDimensionTranslationById(req, res).catch(next));
        app.post(`/${this.routePrefix}/dimension/:dimensionId/translation`, (req, res, next) => this.createDimensionTranslation(req, res).catch(next));
        app.put(`/${this.routePrefix}/dimension/:dimensionId/translation/:id`, (req, res, next) => this.updateDimensionTranslation(req, res).catch(next));
        app.delete(`/${this.routePrefix}/dimension/:dimensionId/translation/:id`, (req, res, next) => this.deleteDimensionTranslation(req, res).catch(next));
    }

    async getAllDimensionTranslation(req, res){
        req.checkParams('dimensionId', 'Invalid dimensionId').notEmpty().isUUID();
        const filter = { where: {
            dimensionId: req.params.dimensionId,
        }, include: [{ model: models.Language }],
        };

        const translations = await models.DimensionTranslation.findAll(filter);
        const result = translations.map(this.mapToDimensionTranslationDto);

        res.json(result);
    }

    async getDimensionTranslationById(req, res){
        req.checkParams('id', 'Invalid id').notEmpty().isUUID();
        const id = req.params.id;

        const translation = await models.DimensionTranslation.findById(id);

        if (translation === null) {
            res.sendStatus(HttpStatus.NOT_FOUND);
        } else {
            res.json(this.mapToDimensionTranslationDto(translation));
        }
    }

    async createDimensionTranslation(req, res){
        req.checkParams('dimensionId', 'Invalid dimensionId').notEmpty().isUUID();
        req.checkBody('languageId', 'Invalid languageId').notEmpty().isUUID();
        req.checkBody('translation', 'Invalid translation').notEmpty().isLength({ min:1, max:32 });

        const dimensionId = req.params.dimensionId;
        const data = {
            id: uuid(),
            dimensionId,
            languageId: req.body.languageId,
            translation: req.body.translation,
        };

        await models.DimensionTranslation.create(data);

        res.location(`/${this.routePrefix}/dimension/${ dimensionId }/translation/${data.id}`);
        res.sendStatus(HttpStatus.CREATED);
    }

    async updateDimensionTranslation(req, res){
        req.checkParams('dimensionId', 'Invalid dimensionId').notEmpty().isUUID();
        req.checkParams('id', 'Invalid id').notEmpty().isUUID();
        req.checkParams('languageId', 'Invalid languageId').notEmpty().isUUID();
        req.checkBody('translation', 'Invalid translation').notEmpty().isLength({ max: 32 });

        const id = req.params.id;
        const translation = await models.DimensionTranslation.findById(id);

        if (translation === null) {
            res.sendStatus(HttpStatus.NOT_FOUND);
        } else {
            const data = {
                languageId: req.body.languageId,
                translation: req.body.translation,
            };

            await models.DimensionTranslation.update(data, {
                where: {
                    id,
                }, fields: ['translation', 'languageId'],
            });

            res.location(`/${this.routePrefix}/dimension/${ req.params.dimensionId }/translation/${id}`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    async deleteDimensionTranslation(req, res){
        req.checkParams('id', 'Invalid id').notEmpty().isUUID();

        const id = req.params.id;

        const translation = models.DimensionTranslation.findById(id);

        if (translation !== null) {
            await models.DimensionTranslation.destroy({ where: { id } });
        }

        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    mapToDimensionTranslationDto(translation) {
        const result = {};

        result.id = translation.id;
        result.translation = translation.translation;
        result.languageId = translation.languageId;

        result._links = {
            self: `/${this.routePrefix}/dimension/${ result.dimensionId }/translation/${ result.id }`,
            parent: `/${this.routePrefix}/dimension`,
        };

        return result;
    }
}

module.exports = DimensionTranslationController;
