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
        app.post(`${this.routePrefix }/historic`, (req, res, next) => this.createHistoricPrices(req, res).catch(next));
        app.post(`${this.routePrefix }/current`, (req, res, next) => this.createCurrentPrices(req, res).catch(next));
    }

    async createHistoricPrices(req, res){
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const jobId = req.query.jobId;

        const fromDate = new Date(2015, 1, 1);
        const toDate = new Date();

        logger.verbose(`completing prices from ${fromDate} untill ${toDate}`);
        logger.verbose(`job id = ${jobId}`);

        res.sendStatus(HttpStatus.ACCEPTED);

        let date = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDay(), 12, 0, 0);
        const dates = [];
        while(date < toDate) {
            dates.push(date);
            date = new Date(date.getTime() + 24*60*60*1000);
        }

        const currencies = await models.Currency.findAll();
        const coins = await models.Coin.findAll({
            where: {
                isActive: true,
            },
        });

        await this.priceManager.getHistoricalPricesForCurrencies(dates, coins, currencies);

        if(jobId !== undefined && jobId != null){
            logger.verbose(`calling done on job ${jobId}`);
            await this.jobManager.setDone(req.userId, jobId);
        }else{
            logger.verbose('no jobId passed in query params');
        }
    }

    async createCurrentPrices(req, res){
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        res.sendStatus(HttpStatus.ACCEPTED);

        try{
            const currencies = await models.Currency.findAll();
            const coins = await models.Coin.findAll({
                where: {
                    isActive: true,
                },
            });

            await this.priceManager.getCurrentPricesForCurrencies(coins, currencies);
            logger.verbose('done with current price refresh');
        }catch(err){
            logger.error('Could not refresh prices', JSON.stringify(err));
        }

        const jobId = req.query.jobId;
        if(jobId !== undefined && jobId != null){
            logger.verbose(`calling done on job ${jobId}`);
            await this.jobManager.setDone(req.userId, jobId);
        }else{
            logger.verbose('no jobId passed in query params');
        }
    }
}

module.exports = PriceController;
