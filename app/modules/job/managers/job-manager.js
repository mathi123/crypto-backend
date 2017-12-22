const logger = require('../../../framework/logger');
const UserManager = require('../../core/managers/user-manager');
const AuthenticationManager = require('../../core/managers/authentication-manager');
const kue = require('kue');
const theInternet = require('request-promise-native');

class JobManager{

    constructor(configuration){
        this.configuration = configuration;
        this.jobManagerEmail = configuration.jobManagerEmail;
        this.userManager = new UserManager();
        this.authenticationManager = new AuthenticationManager(configuration);
    }

    async start(){
        logger.info('starting job manager');

        JobManager.queue = kue.createQueue({
            redis: this.configuration.redis,
        });
        JobManager.runningJobs = {};

        this.cancelAllExisting();

        this.queueRecurrentJobs();
        this.subscribeProcessors();
    }

    cancelAllExisting(){
        const states = ['active', 'inactive', 'delayed', 'failed'];
        for(const state of states) {
            kue.Job.rangeByState(state, 0, 1000, 'asc', (err, jobs) => {
                for(const job of jobs) {
                    job.remove(() => logger.warn(`removed lingering job ${job.id}`));
                }
            });
        }
    }
    subscribeProcessors(){
        logger.verbose('subscribe processors');

        JobManager.queue.process('refreshHistoricPrices', 1, (job, done) => this.refreshHistoricPrices(job, done));
        JobManager.queue.process('refreshCurrentPrices', 1, (job, done) => this.refreshCurrentPrices(job, done));
        JobManager.queue.process('createChainSyncJob', 1, (job, done) => this.syncChains(job, done));
        JobManager.queue.process('importAccounts', 1, (job, done) => this.importAccounts(job, done));
    }

    queueRecurrentJobs(){
        logger.info('queue recurrent jobs');

        if(this.configuration.jobs.refreshHistoricPrices.isActive){
            this.createrefreshHistoricPricesJob();
        }
        if(this.configuration.jobs.refreshCurrentPrices.isActive){
            this.createrefreshCurrentPricesJob();
        }
        if(this.configuration.jobs.createChainSyncJob.isActive){
            this.createChainSyncJob();
        }
        if(this.configuration.jobs.importAccounts.isActive){
            this.checkImportingAccountsJob();
        }
    }

    createrefreshHistoricPricesJob(){
        JobManager.queue.create('refreshHistoricPrices', {})
            .delay(this.configuration.jobs.refreshHistoricPrices.timeout)
            .attempts(5)
            .save();
    }

    createrefreshCurrentPricesJob(){
        JobManager.queue.create('refreshCurrentPrices', {})
            .delay(this.configuration.jobs.refreshCurrentPrices.timeout)
            .attempts(5)
            .save();

    }

    createChainSyncJob(){
        JobManager.queue.create('createChainSyncJob', {})
            .delay(this.configuration.jobs.createChainSyncJob.timeout)
            .attempts(5)
            .save();
    }

    checkImportingAccountsJob(){
        JobManager.queue.create('importAccounts', {})
            .delay(this.configuration.jobs.importAccounts.timeout)
            .attempts(5)
            .save();
    }

    async refreshHistoricPrices(job, done){
        logger.verbose('executing refresh prices', job.id);
        JobManager.runningJobs[job.id] = {
            setDone: () => done(),
            requeue: () => this.createrefreshHistoricPricesJob(),
        };


        const url = `${this.getRestApiUrl()}/api/price/historic?jobId=${job.id}`;
        const options = {
            uri: url,
            json: true,
            method: 'POST',
            headers: {
                'Authorization': await this.getToken(),
            },
        };

        try{
            await theInternet(options);
        }catch(err){
            logger.warn(`Could not perform webrequest to ${url}`, err);
            job.state('failed').save();
        }
    }

    async refreshCurrentPrices(job, done){
        logger.verbose('executing refresh current prices', job.id);
        JobManager.runningJobs[job.id] = {
            setDone: () => done(),
            requeue: () => this.createrefreshCurrentPricesJob(),
        };


        const url = `${this.getRestApiUrl()}/api/price/current?jobId=${job.id}`;
        const options = {
            uri: url,
            json: true,
            method: 'POST',
            headers: {
                'Authorization': await this.getToken(),
            },
        };

        try{
            await theInternet(options);
        }catch(err){
            logger.warn(`Could not perform webrequest to ${url}`, err);
            job.state('failed').save();
        }
    }

    async syncChains(job, done){
        logger.verbose('executing chain sync job', job.id);
        JobManager.runningJobs[job.id] = {
            setDone: () => done(),
            requeue: () => this.createChainSyncJob(),
        };

        const url = `${this.getRestApiUrl()}/api/coin/blockchain/synchronize?jobId=${job.id}`;
        const options = {
            uri: url,
            json: true,
            method: 'POST',
            headers: {
                'Authorization': await this.getToken(),
            },
        };

        try{
            await theInternet(options);
        }catch(err){
            logger.warn(`Could not perform webrequest to ${url}`, err);
            job.state('failed').save();
        }
    }

    async importAccounts(job, done){
        logger.verbose('checking jobs with lingering imports', job.id);

        const url = `${this.getRestApiUrl()}/api/account?state=importing`;
        const options = {
            uri: url,
            json: true,
            method: 'GET',
            headers: {
                'Authorization': await this.getToken(),
            },
        };

        try{
            const accounts = await theInternet(options);
            const tenMinutesAgo = new Date(new Date().getTime() - 1000 * 60);

            for(const account of accounts){
                const updatedAt = new Date(account.updatedAt);

                if(updatedAt < tenMinutesAgo){
                    logger.verbose(`found the import of account with id ${account.id} to be hanging. Last update: ${account.updatedAt}.`);

                    await this.importAccount(account.id);
                }
            }
        }catch(err){
            logger.warn(`Could not perform webrequest to ${url}`, err);
            logger.warn('job failed');
        }

        done();
        this.checkImportingAccountsJob();
    }

    async importAccount(id){
        const url = `${this.getRestApiUrl()}/api/account/${id}/import`;
        const options = {
            uri: url,
            json: true,
            method: 'POST',
            headers: {
                'Authorization': await this.getToken(),
            },
        };

        try{
            await theInternet(options);
        }catch(err){
            logger.warn(`Could not perform webrequest to ${url}`, err);
        }
    }

    getRestApiUrl(){
        return process.env.REST_API || this.configuration.restApi;
    }

    setDone(jobId){
        if(JobManager.runningJobs[jobId] !== undefined){
            JobManager.runningJobs[jobId].setDone();
            JobManager.runningJobs[jobId].requeue();
            delete JobManager.runningJobs[jobId];
        }
    }

    async getToken(){
        const user = await this.userManager.getByEmailOrCreate(this.jobManagerEmail, true);
        const token = await this.authenticationManager.getBearerHeader(user);
        return token;
    }
}

module.exports = JobManager;
