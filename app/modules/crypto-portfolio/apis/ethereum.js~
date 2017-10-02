const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const erc20 = require('./erc20-abi.js');

const conversion  = new BigNumber('10e18');
const transactions = [];
const eth20Coins = {
    '0x0d8775f648430679a709e98d2b0cb6250d2887ef': {
        address: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
        name: 'Basic Attention Token',
        code: 'BAT'
    },
    '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07': {
        address: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
        name: "OmiseGo",
        code: 'OMG'
    },
    '0x9a642d6b3368ddc662CA244bAdf32cDA716005BC': {
        address: '0x9a642d6b3368ddc662CA244bAdf32cDA716005BC',
        name: 'QTum',
        code: 'QTUM'
    }
};

const models = require("../models");

async function getBalance(web3, address){
    var balance = await web3.eth.getBalance(address);
    console.log("balance for " + address + ": " + balance);
}

async function getTransactionsForBlock(web3, block){
    const result = await web3.eth.getBlock(block, true);
    
    await handleTransactions(web3, result);
}

async function handleTransactions(web3, block){
    console.log("\t" + block.transactions.length + " transactions found in block "+ block.number);

    for(let transaction of block.transactions){
        handleTransaction(transaction);

        var receipt = await web3.eth.getTransactionReceipt(transaction.hash);

        if(receipt !== undefined){
            handleLogs(web3, receipt);
        }
    }
}


function handleLogs(web3, transaction){
    console.log("\t" + transaction.logs.length + " logs found in transaction "+ transaction.hash);

    for(let log of transaction.logs){
        handleLog(web3, log);
    }
}

function handleLog(web3, log){
    if(Object.keys(eth20Coins).indexOf(log.address) >= 0){
        let amount = web3.toBigNumber(log.data).dividedBy(conversion).toString();
        let from = "0x" + log.topics[1].substr(26);
        let to = "0x" + log.topics[2].substr(26);

        console.log(`\t\t${eth20Coins[log.address].name} transfer: from ${from} to ${to}: ${amount} ${eth20Coins[log.address].code}`);
    }

}

function handleTransaction(transaction){
    const amount = transaction.value.dividedBy(conversion).toString();

    console.log(`\t\tfrom: ${transaction.from} to ${transaction.to}: ${amount} `);

    const t = {
        from: transaction.from,
        to: transaction.to,
        amount: amount
    };

    transactions.push(t);
}

async function loadAllBlocks(web3, from, to, batchSize){
    console.log(`loading all blocks from ${from} to ${to} async with batch size ${batchSize}`);

    var promises = [];
    
    for(var i = from; i < to; i = i+batchSize){
        promises.push(loadBatch(web3, i, i+batchSize - 1));
    }

    await Promise.all(promises);
}

async function loadBatch(web3, from, to){
    console.log(`loading batch from ${from} to ${to}`);

    for(var i = from; i < to; i++){
        await getTransactionsForBlock(web3, i);
    }

    console.log(`batch loaded from ${from} to ${to}`);
}

async function getLastBlockNumber(web3){
    const nr = await web3.eth.getBlockNumber();
    console.log(web3.eth.blockNumber);
    console.log("last block number: " + nr);
    return nr;
}

async function printSyncStatus(web3){
    const res = await web3.eth.getSyncing();

    console.log(res);
}


function log(log){
    console.log(log);
}

async function getContract(web3, contractAddress){
    const contract = await web3.eth.contract(erc20);

    log(contract);

    const baseAddresss = await contract.at(contractAddress);
    
    log(baseAddresss);

    return baseAddresss;
}

async function printErc20Balance(Contract, address){
    console.log("getting balance of "+ address);
    const balance = await Contract.balanceOf(address);
    console.log(balance.dividedBy(conversion).toString());
}

async function printErc20EventLogs(Contract){
    let res = await Contract.Transfer({}, {fromBlock: 4319000, toBlock: 'latest'});
    console.log(res);

    res.get((error, logs) => {
      // we have the logs, now print them
        logs.forEach(log => console.log(log))
    });

    //console.log(events);
}

//getBlock(web3);
async function synchroniseBlocks(apiUrl){
    console.log("loading blocks from ethereum blockchain");

    const lastBlock = await models.Block.max('number') || -1;

    console.log("last synchronised block: "+lastBlock);

    const nextBlock = lastBlock + 1;
    
    console.log(`starting provider ${apiUrl}`);
    
    const web3 = new Web3(new Web3.providers.HttpProvider(apiUrl));

    console.log("provider started");

    let syncing =  web3.eth.syncing;
    console.log(syncing);
    let targetBlock = -1;
    if(syncing){
        targetBlock = syncing.currentBlock;
    }else{
        targetBlock = web3.eth.blockNumber;
    }
    
    console.log(`synchronising from ${nextBlock} to ${targetBlock}`);

    for(var i = nextBlock; i < targetBlock; i++){
        await getTransactionsForBlock(web3, i);
    }
}

module.exports = synchroniseBlocks;
