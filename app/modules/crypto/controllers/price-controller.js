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

        // const coinId = req.query.coinId;
        // const currencyId = req.query.currencyId;
        //const from = req.query.from;
        //const to = req.query.to;
        const jobId = req.query.jobId;

        const fromDate = new Date(2016, 1, 1);
        const toDate = new Date();
        // const coin = await models.Coin.findOne({
        //     where: {
        //         id: coinId,
        //     },
        // });

        // const currency = await models.Currency.findOne({
        //     where: {
        //         id: currencyId,
        //     },
        // });

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

        await this.priceManager.getPricesForCurrencies(dates, coins, currencies);

        if(jobId !== undefined && jobId != null){
            logger.verbose(`calling done on job ${jobId}`);
            await this.jobManager.setDone(req.userId, jobId);
        }else{
            logger.verbose('no jobId passed in query params');
        }
    }

    /*async create(req, res){
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
        }
    }*/
}

module.exports = PriceController;
