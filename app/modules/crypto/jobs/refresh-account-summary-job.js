const models = require('../models');
const uuid = require('uuid/v4');
const AccountSummaryManager = require('../managers/account-summary-manager');
const JobProgressManager = require('../managers/job-progress-manager');
const Logger = require('../managers/logger');


class RefreshAccountSummaryJob{
    
    constructor(configuration){
        this.jobName = 'RefreshAccountSummaryJob';
        this.accountSummaryManager = new AccountSummaryManager(configuration);
        this.jobProgressManager = new JobProgressManager();
        this.logger = new Logger();
    }

    enqueue(jobManager){
    }

    subscribe(jobManager){
        this.jobManager = jobManager;

        jobManager.subscribe(this.jobName, (data) => this.refreshAccountSummary(data))
            .then(() => this.logger.verbose("Subscribed to job", this.jobName))
            .error((err) => this.logger.error("Could not subscribe to " + this.jobName + " job", err));
    }

    async refreshAccountSummary(data){
        this.jobManager.unsubscribe(this.jobName);
        await this.jobProgressManager.start(data.id, this.jobName, data.data);

        try{
            let timestamp = data.data.timestamp;
            await this.accountSummaryManager.refreshAllAccounts(timestamp);
            await this.jobProgressManager.setDone(data.id);
        }
        catch(err){
            await this.jobProgressManager.logError(data.id, "Job failed", err);
            await this.jobProgressManager.setFailed(data.id);
        }
    }
}

module.exports = RefreshAccountSummaryJob;