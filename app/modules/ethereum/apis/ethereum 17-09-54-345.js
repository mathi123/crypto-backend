const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const erc20 = require('./erc20-abi.js');
const uuid = require('uuid/v4');

const conversion  = new BigNumber('10e18');
const transactions = [];
var eth20Coins = {};

const models = require("../models");

function getBalance(web3, address, callback){
    web3.eth.getBalance(address, (err, result) => {
        if(err){
            console.error(`Could not get balance for ${address}.`);
        }else{
            console.info(`Balance for ${address}: ${result}`);
            
            callback(result);
        }
    });
}
function getBlocks(web3, maximum, i, callback){
    getTransactionsForBlock(web3, i, (block) => {
        handleTransactions(web3, block, 0, block.transactions.length);
        insertBlockInDb(block);
        i++;
        if(i <= maximum){
            getBlocks(web3, maximum, i, callback)
        }else{
            callback();
        }
    });
}

function insertBlockInDb(block){
    //console.log(block.number);
    //console.log(block.hash);
    
    models.Block.create({
        number: block.number,
        hash: block.hash
    });
}

function getTransactionsForBlock(web3, block, callback){
    web3.eth.getBlock(block, true, (err, result) => {
        if(err){
            console.error(`Could not get block ${block}.`);
        }else{
            callback(result);
        }
    });
}

function handleTransactions(web3, block, i, to){
    if(i == to) return;

    //console.log("\t" + block.transactions.length + " transactions found in block "+ block.number);
    handleTransaction(web3, block.transactions[i] , block, () => {
        i++;
        handleTransactions(web3, block, i, to);
    });
}

function handleLogs(web3, transaction, block){
    //console.log("\t" + transaction.logs.length + " logs found");

    for(let log of transaction.logs){
        handleLog(web3, log, transaction, block);
    }
}

function handleLog(web3, log, transaction, block){
    if(Object.keys(eth20Coins).indexOf(log.address) >= 0){
        let amount =  new BigNumber(log.data).dividedBy(conversion);
        let from = "0x" + log.topics[1].substr(26);
        let to = "0x" + log.topics[2].substr(26);
        
        //console.log(`\t\t${eth20Coins[log.address].description} transfer: from ${from} to ${to}: ${amount} ${eth20Coins[log.address].code}`);
        
        var tr = {
            id: uuid(),
            hash: transaction.transactionHash,
            index: transaction.transactionIndex,
            coin: log.address,
            from: from,
            to: to,
            amount: amount.toString(),
            ts: block.timestamp
        };
        //console.log(JSON.stringify(tr));
        
        models.Transaction.create(tr);
    }
}

function handleTransaction(web3, transaction, block, done){
    const amount = new BigNumber(transaction.value).dividedBy(conversion).toString();

    //console.log(`\t\tfrom: ${transaction.from} to ${transaction.to}: ${amount} `);

    const t = {
        from: transaction.from,
        to: transaction.to,
        amount: amount
    };

    web3.eth.getTransactionReceipt(transaction.hash, (err, receipt) =>{
        if(err){
            console.error(`Could not get transaction receipt for ${transaction.hash}.`)
        }else{
            handleLogs(web3, receipt, block);
        }

        done();
    });
}

function getContract(web3, contractAddress, callback){
    web3.eth.contract(erc20, (err, contract) => {
        if(err){
            console.error(`Could not get erc20 contract.`);
        }else{
            contract.at(contractAddress, (err, result) => {
                if(err){
                    console.error(`Could not get contract base address ${contractAddress}.`);
                }else{
                    callback(result);
                }
            });
        }
    });
}

function getLastBlockNumber(web3, callback){
    let targetBlock = -1;
    let syncing = web3.eth.syncing;

    if(syncing){
        callback(syncing.currentBlock);
    }else{
        web3.eth.getBlockNumber((err, result) => {
            if(err){
                console.error(`Could not get block number.`);
            }else{
                console.info(`Last block number: ${result}.`);
                callback(result);
            }
        });
    }
}

function printErc20Balance(Contract, address, callback){
    console.log("getting balance of "+ address);
    Contract.balanceOf(address, (err, balance) => {
        if(err){
            console.error(`Could not get balance for ${address}`);
        }else{
            var b = balance.dividedBy(conversion);
            console.info(`Balance for ${address}: ${b}`);
            callback(b);
        }
    });
}

// async function printErc20EventLogs(Contract){
//     let res = await Contract.Transfer({}, {fromBlock: 4319000, toBlock: 'latest'});
//     console.log(res);

//     res.get((error, logs) => {
//       // we have the logs, now print them
//         logs.forEach(log => console.log(log))
//     });

//     //console.log(events);
// }

//getBlock(web3);
async function synchroniseBlocks(apiUrl){
    console.log("loading blocks from ethereum blockchain");

    const lastBlock = await models.Block.max('number') || -1;

    console.log("last synchronised block: "+lastBlock);

    console.log("Loading erc20 coins");

    coins = await models.Coin.findAll({
        where: {
            coinType: "ETH_CONTRACT",
            baseAddress: {
                ne: ''
            }
        }
    });

    for(let coin of coins){
        eth20Coins[coin.baseAddress] = coin;
    }

    //console.info(`Working with coins: ${JSON.stringify(eth20Coins)}`)

    const nextBlock = lastBlock + 1;
    
    console.log(`starting provider ${apiUrl}`);
    
    const web3 = new Web3(new Web3.providers.HttpProvider(apiUrl));

    console.log("provider started");

    getLastBlockNumber(web3, (targetBlock) => {
        console.log(`synchronising from ${nextBlock} to ${targetBlock}`);
    
        getBlocks(web3, targetBlock, nextBlock, () => {
            console.log("In sync");
        });
    });
    
    
}

module.exports = synchroniseBlocks;
