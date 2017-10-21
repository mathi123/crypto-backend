const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const erc20 = require('./app/modules/ethereum/apis/erc20-abi.js');
const apiUrl = 'http://127.0.0.1:8545';
let web3 = new Web3(new Web3.providers.HttpProvider(apiUrl));

function getContract(web3, contractAddress, callback){
    return new web3.eth.Contract(erc20, contractAddress);
}

let syncing =  web3.eth.isSyncing()
    .then((res) => console.log(res))
    .error(err => console.error(err));

let contract = getContract(web3, '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07');

contract.getPastEvents("Transfer", {
    fromBlock: 0,
    toBlock: 4339617
}, function(err, result){
    console.log(result);
});
