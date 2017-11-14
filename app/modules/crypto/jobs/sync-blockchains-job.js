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

        this.jobManager.publish(this.jobName, {}, { startIn: 15 })
            .then((id) => logger.verbose(`${this.jobName} job published`, id))
            .error((err) => logger.error(`Could not publish ${this.jobName}`, err));
    }

    subscribe(jobManager){
        this.jobManager = jobManager;

        jobManager.subscribe(this.jobName, (data) => this.executeJob(data))
            .then(() => logger.verbose(`Subscribed to ${this.jobName}`))
            .error((err) => logger.error(`Could not subscribe to ${this.jobName}`, err));
    }

    async executeJob(data){
        logger.info('starting chain sync job');
        this.jobManager.unsubscribe(this.jobName);
        
        try{
            await this.coinManager.synchronizeCoins();
        }
        catch(err){
            logger.error('error in chain sync job', err);
        }

        this.requeue();
    }
}

module.exports = SyncBlockChainsJob;
