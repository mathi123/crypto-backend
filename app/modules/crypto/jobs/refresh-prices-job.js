const models = require('../models');
const uuid = require('uuid/v4');
const PriceManager = require('../managers/price-manager');

class RefreshPricesJob{
    
    constructor(configuration){
        this.priceCheckInSeconds = configuration.priceCheckInSeconds;
        this.priceManager = new PriceManager();
    }

    enqueue(jobManager){
        this.requeue();
    }

    requeue(){
        console.log("next price check in :" + this.priceCheckInSeconds);
        this.jobManager.publish('RefreshPricesJob', {}, {startIn: this.priceCheckInSeconds })
            .then((id) => console.log("RefreshPricesJob job published:"+id))
            .error((err) => console.error(err));
    }

    requeueAccountSummary(unixTs){
        this.jobManager.publish('RefreshAccountSummaryJob', { timestamp: unixTs})
            .then((id) => console.log("RefreshAccountSummaryJob job published:"+id))
            .error((err) => console.error(err));
    }

    subscribe(jobManager){
        this.jobManager = jobManager;

        jobManager.subscribe('RefreshPricesJob', (data) => this.refreshPrices(data))
            .then(() => console.log("subscribed to RefreshPricesJob"))
            .error((err) => console.error(err));
    }

    refreshPrices(data){
        this.jobManager.unsubscribe('RefreshPricesJob');
        console.log("executing "+data.id);
        
        return this.refreshPricesAsync(data)
            .then(() => {
                console.log("done refreshing prices");
            }, (err) => {
                console.error("error refreshing prices");
                console.error(err);
            });
    }

    async refreshPricesAsync(data){
        console.info("refreshing prices.");

        let date = new Date();
        date.setSeconds(0, 0);
        
        let unixTs = date.getTime();

        let currencies = await models.Currency.findAll();
        let coins = await models.Coin.findAll();

        let prices = await this.priceManager.getPricesForCurrencies([unixTs], coins, currencies);

        this.requeue();
        this.requeueAccountSummary(unixTs);
    }
}

module.exports = RefreshPricesJob;