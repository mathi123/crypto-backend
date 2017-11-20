const models = require('../models');
const uuid = require('uuid/v4');
const PriceManager = require('../managers/price-manager');
const JobProgressManager = require('../managers/job-progress-manager');
const logger = require('../../../framework/logger');

class RefreshPricesJob{
    constructor(configuration){
        this.jobName = 'RefreshPricesJob';
        this.priceCheckInSeconds = configuration.priceCheckInSeconds;
        this.priceManager = new PriceManager();
        this.jobProgressManager = new JobProgressManager();
    }

    enqueue(jobManager){
        this.requeue();
    }

    requeue(){
        this.jobManager.publish(this.jobName, {}, { startIn: this.priceCheckInSeconds })
            .then((id) => logger.verbose('RefreshPricesJob job published', id))
            .error((err) => logger.error('Could not publish RefreshPricesJob', err));
    }

    requeueAccountSummary(unixTs){
        this.jobManager.publish('RefreshAccountSummaryJob', { timestamp: unixTs })
            .then((id) => logger.verbose('RefreshAccountSummaryJob job published:', id))
            .error((err) => logger.error('Could not publish RefreshAccountSummaryJob job', err));
    }

    subscribe(jobManager){
        this.jobManager = jobManager;

        jobManager.subscribe(this.jobName, (data) => this.refreshPrices(data))
            .then(() => logger.verbose('Subscribed to RefreshPricesJob'))
            .error((err) => logger.error('Could not subscribe to RefreshPricesJob', err));
    }

    refreshPrices(data){
        return this.refreshPricesAsync(data)
            .then(() => logger.info('refresh prices done'),
                        (err) => logger.error('refresh prices error', err));
    }

    async refreshPricesAsync(data){
        logger.info(`executing ${this.jobName}`);

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
        }
        catch(err){
            logger.error('Job failed', err);
        }

        logger.info(`done executing ${this.jobName}`);
        this.requeue();
    }
}

module.exports = RefreshPricesJob;
