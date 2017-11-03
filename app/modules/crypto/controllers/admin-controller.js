const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');
const AdminManager = require('../managers/admin-manager');

class AdminController{
    constructor(configuration){
        this.routePrefix = `/${configuration.routePrefix}/admin`;
        this.manager = new AdminManager();
    }

    buildAuthenticatedRoutes(app) {
        app.get(`${this.routePrefix }/statistics`, (req, res, next) => this.getStatistics(req, res).catch(next));
    }

    async getStatistics(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const statistics = await this.manager.getStatistics();

        res.json(statistics);
    }
}

module.exports = AdminController;