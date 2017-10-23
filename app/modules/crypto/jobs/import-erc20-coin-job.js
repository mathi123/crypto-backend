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
        jobManager.subscribe(this.jobName, (data) => this.importErc20Coin(data))
            .then(() => this.logger.verbose("Subscribed to Job", this.jobName))
            .error((err) => this.logger.error(`Subscribing to job failed: ${this.jobName}.`, err));
    }

    async importErc20Coin(data){
        await this.jobProgressManager.start(data.id, this.jobName, data.data);

        try{
            let web3 = this.getWeb3();
            let coin = await this.getCoin(data.data.coinId);
            await this.jobProgressManager.logVerbose(`Base address of ${coin.description} is ${coin.baseAddress}`);
    
            let contract = this.getContract(web3, coin.baseAddress);
    
            this.getLastBlock(web3, (blockNumber) => this.parseAllBlocks(data.id, contract, 0, blockNumber, coin));
    
            await this.jobProgressManager.setDone(data.id);
        }catch(err){
            await this.jobProgressManager.setFailed(data.id);
            await this.jobProgressManager.logError(data.id, "Job execution failed", err);
        }
    }

    parseAllBlocks(jobId, contract, from, to, coin){
        this.jobProgressManager.logVerbose(jobId, `Last block: ${to}`);

        let batchFrom = Math.max(to - this.batchSize, from);
        this.parseBlocksRecursivly(jobId, contract, batchFrom, to, from, to, coin);
    }

    parseBlocksRecursivly(jobId, contract, fromBlockNumber, toBlockNumber, minBlockNumber, maxBlockNumber, coin){
        this.jobProgressManager.logVerbose(jobId, `Getting ${fromBlockNumber} -> ${toBlockNumber}`);

        contract.getPastEvents("Transfer", {
            fromBlock: fromBlockNumber,
            toBlock: toBlockNumber
        }, (err, transferEvents) => this.process(jobId, err, transferEvents, contract, minBlockNumber, fromBlockNumber, maxBlockNumber, coin));    
    }

    process(jobId, error, transferEvents, contract, fromMin, from, toMax, coin){
        if(error){
            throw new Error("Could not load Events");
        }

        this.processEvents(error, transferEvents, coin);
        this.jobProgressManager.updateProgress(jobId, Math.round(100*(toMax - from)/(toMax - fromMin)));

        if(from <= fromMin) return;
        
        let to = from - 1;
        let nextFrom = Math.max(from - this.batchSize, fromMin);
        
        this.parseBlocksRecursivly(jobId, contract, nextFrom, to, fromMin, toMax, coin);
    }

    processEvents(error, transferEvents, coin){
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
            
            let existing = models.Erc20Transaction.findOne({
                where: {
                    coinId: coin.id,
                    blockNumber: txn.blockNumber,
                    transactionHash: txn.transactionHash,
                    logIndex: txn.logIndex
                }
            }).then((result) => {
                if(result === null){
                    models.Erc20Transaction.create(record).then(() => {}, (err) => {
                        console.log("could not insert");
                        console.error(err);
                    });
                }
            });
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

    getLastBlock(web3, callback){
        web3.eth.isSyncing()
            .then((res) => callback(res.currentBlock))
            .error(err => console.error(err));
    }
}

module.exports = ImportErc20CoinJob;