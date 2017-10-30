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
        jobManager.publish('ImportEthereumBlocksJob', {}, {startIn: 10})
            .then((id) => this.logger.info("job published:"+id))
            .error((err) => this.logger.error("could not publish job of type " + this.jobName, err));
    }

    subscribe(jobManager){
        this.jobManager = jobManager;

        jobManager.subscribe(this.jobName, (data) => this.import(data))
            .then(() => this.logger.verbose("Subscribed to Job", this.jobName))
            .error((err) => this.logger.error(`Subscribing to job failed: ${this.jobName}.`, err));
    }

    async import(data){
        await this.jobProgressManager.start(data.id, this.jobName, data.data);

        try{
            let web3 = this.getWeb3();
            let blockNumber = await this.getLastBlock(web3);
            let lastBlock = await models.EthereumBlock.max('id');

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
            await this.jobProgressManager.setFailed(data.id);
            await this.jobProgressManager.logError(data.id, "Job execution failed", err);
        }

        this.enqueue(this.jobManager);
    }

    getWeb3(){
        return new Web3(new Web3.providers.HttpProvider(this.apiUrl));
    }

    async getLastBlock(web3){
        let result = await web3.eth.isSyncing();

        if(result.currentBlock === NaN){
            throw new Exception("could not get last block number.");
        }

        return result.currentBlock;
    }

    async parseAllBlocks(web3, jobId, from, to){
        for(let i = from; i<to;i++){
            let block = await web3.eth.getBlock(i);

            let dbBlock = {
                id: block.number,
                ts: block.timestamp
            };

            models.EthereumBlock.create(dbBlock);
        }
    }
}

module.exports = ImportEthereumBlocksJob;