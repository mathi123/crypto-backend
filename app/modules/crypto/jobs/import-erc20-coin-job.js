const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const erc20 = require('../ethereum/erc20-abi');
const models = require('../models');
const uuid = require('uuid/v4');
const JobProgressManager = require('../managers/job-progress-manager');
const Logger = require('../managers/logger');


class ImportErc20CoinJob{
    
    constructor(configuration){
        this.jobName = 'ImportErc20CoinJob';
        this.apiUrl = configuration.ethereumApi;
        this.batchSize = 1000;
        this.jobProgressManager = new JobProgressManager();
        this.logger = new Logger();
    }

    enqueue(jobManager){
        /*jobManager.publish('ImportErc20CoinJob', {coinId: 'ed357dcd-b0b2-43ce-9d24-cb1650f3f1f8'}, {startIn: 5})
            .then((id) => console.log("job published:"+id))
            .error((err) => console.error(err));*/
    }

    subscribe(jobManager){
        this.jobManager = jobManager;
        jobManager.subscribe(this.jobName, (data) => this.importErc20Coin(data))
            .then(() => this.logger.verbose("Subscribed to Job", this.jobName))
            .error((err) => this.logger.error(`Subscribing to job failed: ${this.jobName}.`, err));
    }

    async importErc20Coin(data){
        this.jobManager.unsubscribe(this.jobName);
        await this.jobProgressManager.start(data.id, this.jobName, data.data);

        try{
            let web3 = this.getWeb3();
            let coin = await this.getCoin(data.data.coinId);
            await this.jobProgressManager.logVerbose(data.id, `Base address of ${coin.description} is ${coin.baseAddress}`);
    
            let contract = this.getContract(web3, coin.baseAddress);
    
            if(coin.firstBlockSynchronized !== null && coin.firstBlockSynchronized !== undefined){
                if(coin.firstBlockSynchronized === 0){
                    let blockNumber = (await this.getLastBlock(web3)).currentBlock;
                    await this.parseAllBlocks(data.id, contract, coin.lastBlockSynchronized, blockNumber, coin)
                }else{
                    await this.parseAllBlocks(data.id, contract, 0, coin.firstBlockSynchronized, coin);
                }
            }else{
                let blockNumber = (await this.getLastBlock(web3)).currentBlock;
                await this.parseAllBlocks(data.id, contract, 0, blockNumber, coin);          
            }
            
            await this.jobProgressManager.setDone(data.id);
        }catch(err){
            await this.jobProgressManager.setFailed(data.id);
            await this.jobProgressManager.logError(data.id, "Job execution failed", err);
        }
    }

    async parseAllBlocks(jobId, contract, from, to, coin){
        let batchFrom = Math.max(to - this.batchSize, from);
        await this.parseBlocksRecursivly(jobId, contract, batchFrom, to, from, to, coin);
    }

    async parseBlocksRecursivly(jobId, contract, fromBlockNumber, toBlockNumber, minBlockNumber, maxBlockNumber, coin){
        await this.jobProgressManager.logVerbose(jobId, `Getting ${fromBlockNumber} -> ${toBlockNumber}`);

        try{
            let transferEvents = await contract.getPastEvents("Transfer", {
                fromBlock: fromBlockNumber,
                toBlock: toBlockNumber
            });
            await this.process(jobId, transferEvents, contract, minBlockNumber, fromBlockNumber, maxBlockNumber, coin)
        }catch(err){
            console.log(err);
            throw new Error("Could not load Events");
        }
    }

    async process(jobId, transferEvents, contract, fromMin, from, toMax, coin){
        await this.jobProgressManager.logVerbose(jobId, `${transferEvents.length} events found.`);
        await this.processEvents(transferEvents, coin);
        await this.jobProgressManager.updateProgress(jobId, Math.round(100*(toMax - from)/(toMax - fromMin)));

        if(from > fromMin){
            coin.lastBlockSynchronized = toMax;
            coin.firstBlockSynchronized = from;
            coin.save();

            let to = from - 1;
            let nextFrom = Math.max(from - this.batchSize, fromMin);
            
            await this.parseBlocksRecursivly(jobId, contract, nextFrom, to, fromMin, toMax, coin);
        }
    }

    async processEvents(transferEvents, coin){
        for(let txn of transferEvents){
            let record = {
                id: uuid(),
                coinId: coin.id,
                blockNumber: txn.blockNumber,
                transactionHash: txn.transactionHash,
                logIndex: txn.logIndex,
                address: txn.address,
                isRemoved: txn.removed,
                from: txn.returnValues._from,
                to: txn.returnValues._to,
                value: txn.returnValues._value / Math.pow(10, coin.decimals)
            };
            
            let existing = await models.Erc20Transaction.findOne({
                where: {
                    coinId: coin.id,
                    blockNumber: txn.blockNumber,
                    transactionHash: txn.transactionHash,
                    logIndex: txn.logIndex
                }
            });

            if(existing === null){
                await models.Erc20Transaction.create(record);
            }else{
                existing.isRemoved = record.isRemoved;
                existing.save();
            }
        }
    }

    async getCoin(coinId){
        let coin = await models.Coin.findOne({
            where: {
                id: coinId
            }
        });
        return coin;
    }

    getWeb3(){
        return new Web3(new Web3.providers.HttpProvider(this.apiUrl));
    }

    getContract(web3, contractAddress, callback){
        return new web3.eth.Contract(erc20, contractAddress);
    }

    async getLastBlock(web3){
        return await web3.eth.isSyncing();
    }
}

module.exports = ImportErc20CoinJob;