const models = require('../models');
const uuid = require('uuid/v4');
const AccountSummaryManager = require('../managers/account-summary-manager');

class RefreshAccountSummaryJob{
    
    constructor(configuration){
        this.accountSummaryManager = new AccountSummaryManager();
    }

    enqueue(jobManager){
    }

    subscribe(jobManager){
        this.jobManager = jobManager;

        jobManager.subscribe('RefreshAccountSummaryJob', (data) => this.refreshAccountSummary(data))
            .then(() => console.log("subscribed to RefreshAccountSummaryJob"))
            .error((err) => console.error(err));
    }

    refreshAccountSummary(data){
        this.jobManager.unsubscribe('RefreshAccountSummaryJob');

        this.refreshPricesAsync(data)
            .then(() => {
                console.log("done refreshing accountSummary");
            }, (err) => {
                console.error("error refreshing accountSummary");
                console.error(err);
            });
    }

    async refreshPricesAsync(data){
        let timestamp = data.data.timestamp;

        await this.accountSummaryManager.refreshAllAccounts(timestamp);
    }
}

module.exports = RefreshAccountSummaryJob;