const CoinManager = require('../managers/coin-manager');
const logger = require('../../../framework/logger');

class SyncBlockChainsJob{
    constructor(configuration){
        this.jobName = 'SyncBlockChainJobs';
        this.coinManager = new CoinManager(configuration);
    }

    enqueue(jobManager){
        this.requeue();
    }

    requeue(){
        logger.verbose('requeue chain sync job');

        this.jobManager.publish(this.jobName, {}, { startIn: 30 })
            .then((id) => logger.verbose(`${this.jobName} job published`, id))
            .error((err) => logger.error(`Could not publish ${this.jobName}`, err));
    }

    subscribe(jobManager){
        this.jobManager = jobManager;

        /*jobManager.subscribe(this.jobName, (data) => this.executeJob(data))
            .then(() => logger.verbose(`Subscribed to ${this.jobName}`))
            .error((err) => logger.error(`Could not subscribe to ${this.jobName}`, err));*/
    }

    executeJob(data){
        return this.executeJobAsync(data)
            .then(() => logger.info(`${this.jobName} done`),
                        (err) => logger.error(`error in ${this.jobName} job`, err));
    }

    async executeJobAsync(data){
        logger.info('starting chain sync job', data.id);
        //this.jobManager.unsubscribe(this.jobName);

        try{
            await this.coinManager.synchronizeCoins();
        }catch(err){
            logger.error('error in chain sync job', err);
        }

        //this.subscribe(this.jobManager);
        this.requeue();
        //this.subscribe(this.jobManager);
    }
}

module.exports = SyncBlockChainsJob;
