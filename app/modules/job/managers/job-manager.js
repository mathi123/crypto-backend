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

        JobManager.queue.process('refreshPrices', 1, (job, done) => this.refreshPrices(job, done));
        JobManager.queue.process('createChainSyncJob', 1, (job, done) => this.syncChains(job, done));
    }

    queueRecurrentJobs(){
        logger.info('queue recurrent jobs');

        this.createRefreshPricesJob();
        this.createChainSyncJob();
    }

    createRefreshPricesJob(){
        JobManager.queue.create('refreshPrices', {})
            .delay(60000)
            .attempts(5)
            .save();
    }

    createChainSyncJob(){
        JobManager.queue.create('createChainSyncJob', {})
            .delay(60000)
            .attempts(5)
            .save();
    }

    async refreshPrices(job, done){
        logger.verbose('executing refresh prices', job.id);
        JobManager.runningJobs[job.id] = {
            setDone: () => done(),
            requeue: () => this.createRefreshPricesJob(),
        };


        const url = `${this.configuration.restApi}/api/price?jobId=${job.id}`;
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

        const url = `${this.configuration.restApi}/api/coin/blockchain/synchronize?jobId=${job.id}`;
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
