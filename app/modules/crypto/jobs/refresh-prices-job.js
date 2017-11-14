const models = require('../models');
const uuid = require('uuid/v4');
const PriceManager = require('../managers/price-manager');
const JobProgressManager = require('../managers/job-progress-manager');
const Logger = require('../managers/logger');

class RefreshPricesJob{  
    constructor(configuration){
        this.jobName = 'RefreshPricesJob';
        this.priceCheckInSeconds = configuration.priceCheckInSeconds;
        this.priceManager = new PriceManager();
        this.jobProgressManager = new JobProgressManager();
        this.logger = new Logger();
    }

    enqueue(jobManager){
        this.requeue();
    }

    requeue(){
        this.jobManager.publish(this.jobName, {}, {startIn: this.priceCheckInSeconds })
            .then((id) => this.logger.verbose("RefreshPricesJob job published", id))
            .error((err) => this.logger.error("Could not publish RefreshPricesJob", err));
    }

    requeueAccountSummary(unixTs){
        this.jobManager.publish('RefreshAccountSummaryJob', { timestamp: unixTs})
            .then((id) => this.logger.verbose("RefreshAccountSummaryJob job published:", id))
            .error((err) => this.logger.error("Could not publish RefreshAccountSummaryJob job", err));
    }

    subscribe(jobManager){
        this.jobManager = jobManager;

        jobManager.subscribe(this.jobName, (data) => this.refreshPrices(data))
            .then(() => this.logger.verbose("Subscribed to RefreshPricesJob"))
            .error((err) => this.logger.error("Could not subscribe to RefreshPricesJob", err));
    }

    async refreshPrices(data){
        this.jobManager.unsubscribe(this.jobName);

        let date = new Date();
        date.setSeconds(0, 0);
        let arg = date.getTime();

        await this.jobProgressManager.start(data.id, this.jobName, JSON.stringify(arg));
        
        try{
            await this.refreshPricesAsync(arg);
            await this.jobProgressManager.setDone(data.id);
        }
        catch(err){
            await this.jobProgressManager.logError(data.id, "Job failed", err);
            await this.jobProgressManager.setFailed(data.id);
        }
    }

    async refreshPricesAsync(unixTs){
        let currencies = await models.Currency.findAll();
        let coins = await models.Coin.findAll({
            where: {
                isActive: true
            }
        });

        let prices = await this.priceManager.getPricesForCurrencies([unixTs], coins, currencies);

        this.requeue();
        this.requeueAccountSummary(unixTs);
    }
}

module.exports = RefreshPricesJob;