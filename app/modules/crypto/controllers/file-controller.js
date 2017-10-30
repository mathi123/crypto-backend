const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');
const FileManager = require('../managers/file-manager');

class FileController{
    constructor(routePrefix){
        this.routePrefix = `/${routePrefix}/file`;
        this.manager = new FileManager();
    }

    buildAuthenticatedRoutes(app) {
        app.get(`${this.routePrefix }/:id`, (req, res, next) => this.getById(req, res).catch(next));
    }

    async getById(req, res) {
        const id = req.params.id;
        const record = await this.manager.getById(id);

        if(record === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            res.json(record.data);
        }
    }
}

module.exports = FileController;