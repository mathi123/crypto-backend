const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');

class LanguageController{
    constructor(routePrefix){
        this.routePrefix = routePrefix;
    }

    buildRoutes(app) {
        app.get(`/${this.routePrefix}/language`, (req, res, next) => this.getAllLanguages.catch(next));
        app.get(`/${this.routePrefix}/language/:id`, (req, res, next) => this.getLanguageById.catch(next));
        app.put(`/${this.routePrefix}/language`, (req, res, next) => this.updateLanguage.catch(next));
        app.post(`/${this.routePrefix}/language`, (req, res, next) => this.createLanguage.catch(next));
        app.delete(`/${this.routePrefix}/language/:id`, (req, res, next) => this.deleteLanguage.catch(next));
    }

    async getAllLanguages(req, res) {
        const languages = await models.Language.all();

        res.json(languages.map(this.mapLanguage));
    }

    async getLanguageById(req, res) {
        const id = req.params.id;

        const language = await models.Language.findOne({ where: { id } });

        if (language === null) {
            res.sendStatus(HttpStatus.NOT_FOUND);
        } else {
            res.json(this.mapLanguage(language));
        }
    }

    async createLanguage(req, res) {
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
        };

        await models.Language.create(data);

        res.location(`/${this.routePrefix}/language/${data.id}`);
        res.sendStatus(HttpStatus.CREATED);
    }

    async updateLanguage(req, res) {
        if (req.body.description === null || req.body.description === undefined) {
            throw new Error('description missing');
        }

        if (req.params.id === null || req.params.id === undefined) {
            throw new Error('id missing');
        }

        const id = req.params.id;

        const language = await models.Language.findOne({ where: { id } });

        if (language === null) {
            res.sendStatus(HttpStatus.NOT_FOUND);
        } else {
            const data = {
                description: req.body.description,
            };

            await models.Language.update(data, {
                where: {
                    id,
                }, fields: ['description'],
            });

            res.location(`/${this.routePrefix}/language/${id}`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    async deleteLanguage(req, res) {
        const id = req.params.id;

        const language = models.Language.findOne({ where: { id } });

        if (language !== null) {
            await models.Language.destroy({ where: { id } });
        }

        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    mapLanguage(language) {
        const result = {};
        result.id = language.id;
        result.code = language.code;
        result.description = language.description;
        result._links = {
            self: `/${this.routePrefix}/language/${ result.id }`,
        };

        return result;
    }
}

module.exports = LanguageController;
