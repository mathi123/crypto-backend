const logger = require('../../../framework/logger');
const HttpStatus = require('http-status-codes');
const JobManager = require('../managers/job-manager');

class JobController{
    constructor(configuration){
        this.routePrefix = `/${configuration.routePrefix}/job`;
        this.jobManager = new JobManager(configuration);
    }

    buildAuthenticatedRoutes(app) {
        app.delete(`${this.routePrefix }/:id`, (req, res, next) => this.delete(req, res).catch(next));
    }

    async delete(req, res){
        logger.verbose(`finishing up job ${req.params.id}`);
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        this.jobManager.setDone(req.params.id);

        res.sendStatus(HttpStatus.OK);
    }
}

module.exports = JobController;
