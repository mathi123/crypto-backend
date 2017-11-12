const logger = require('../../../framework/logger');
const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const erc20 = require('../ethereum/erc20-abi');
const models = require('../models');
const uuid = require('uuid/v4');
const JobProgressManager = require('../managers/job-progress-manager');
const Logger = require('../managers/logger');

class ImportEthereumBlocksJob{

    constructor(configuration){
        this.jobName = 'ImportEthereumBlocksJob';
        this.apiUrl = configuration.ethereumApi;
        this.batchSize = 1000;
        this.jobProgressManager = new JobProgressManager();
        this.logger = new Logger();
    }

    enqueue(jobManager){
        jobManager.publish('ImportEthereumBlocksJob', {}, { startIn: 10 })
            .then((id) => logger.info(`${this.jobName} job published:${id}`))
            .error((err) => logger.error('could not publish job of type ' + this.jobName, err));
    }

    subscribe(jobManager){
        this.jobManager = jobManager;

        jobManager.subscribe(this.jobName, (data) => this.import(data))
            .then(() => logger.verbose('Subscribed to Job', this.jobName))
            .error((err) => logger.error(`Subscribing to job failed: ${this.jobName}.`, err));
    }

    async import(data){
        this.jobManager.unsubscribe(this.jobName);
        await this.jobProgressManager.start(data.id, this.jobName, data.data);
        logger.verbose(`starting ${this.jobName}`);
        try{
            logger.verbose('getting web3 connection');
            const web3 = this.getWeb3();
            logger.verbose('getting last block');
            const blockNumber = await this.getLastBlock(web3);
            logger.verbose(`last block: ${blockNumber}`);
            let lastBlock = await models.EthereumBlock.max('id');
            logger.verbose(`last block in database: ${lastBlock}`);

            if(blockNumber === lastBlock){
                await this.jobManager.logVerbose(data.id, `Last block is synced: ${blockNumber}`);
            }else{
                if(!lastBlock){
                    lastBlock = -1;
                }

                lastBlock = lastBlock + 1;
                await this.jobProgressManager.logVerbose(data.id, `Syncing ${lastBlock} -> ${blockNumber}`);
                await this.parseAllBlocks(web3, data.id, lastBlock, blockNumber);
            }

            await this.jobProgressManager.setDone(data.id);
        }catch(err){
            logger.warn(`failed ${this.jobName}`);
            logger.error(err.toString());
            await this.jobProgressManager.setFailed(data.id);
            await this.jobProgressManager.logError(data.id, 'Job execution failed', err);
        }

        this.enqueue(this.jobManager);
    }

    getWeb3(){
        logger.verbose(`getting web3 js connection from ${this.apiUrl}`);
        return new Web3(new Web3.providers.HttpProvider(this.apiUrl));
    }

    async getLastBlock(web3){
        const result = await web3.eth.isSyncing();

        if(result.currentBlock === NaN){
            throw new Exception('could not get last block number.');
        }

        return result.currentBlock;
    }

    async parseAllBlocks(web3, jobId, from, to){
        for(let i = from; i<to;i++){
            const block = await web3.eth.getBlock(i);

            const dbBlock = {
                id: block.number,
                ts: block.timestamp,
            };

            models.EthereumBlock.create(dbBlock);
        }
    }
}

module.exports = ImportEthereumBlocksJob;
