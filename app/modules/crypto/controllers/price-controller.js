const logger = require('../../../framework/logger');
const models = require('../models');
const HttpStatus = require('http-status-codes');
const PriceManager = require('../managers/price-manager');
const JobApi = require('./job-api');

class PriceController{
    constructor(configuration){
        this.routePrefix = `/${configuration.routePrefix}/price`;
        this.priceManager = new PriceManager();
        this.jobManager = new JobApi(configuration);
    }

    buildAuthenticatedRoutes(app) {
        app.post(`${this.routePrefix }`, (req, res, next) => this.create(req, res).catch(next));
    }

    async create(req, res){
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        res.sendStatus(HttpStatus.ACCEPTED);
/*
        const date = new Date();
        date.setSeconds(0, 0);
        const unixTs = date.getTime();

        try{
            const currencies = await models.Currency.findAll();
            const coins = await models.Coin.findAll({
                where: {
                    isActive: true,
                },
            });

            await this.priceManager.getPricesForCurrencies([unixTs], coins, currencies);
            logger.verbose('done with price refresh');
        }catch(err){
            logger.error('Could not refresh prices', JSON.stringify(err));
        }

        const jobId = req.query.jobId;
        if(jobId !== undefined && jobId != null){
            logger.verbose(`calling done on job ${jobId}`);
            await this.jobManager.setDone(req.userId, jobId);
        }else{
            logger.verbose('no jobId passed in query params');
        }*/
    }
}

module.exports = PriceController;
