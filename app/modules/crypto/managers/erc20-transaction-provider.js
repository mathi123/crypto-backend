const logger = require('../../../framework/logger');
const erc20 = require('../ethereum/erc20-abi');
const Web3 = require('web3');
const uuid = require('uuid/v4');
const models = require('../models');

class Erc20TransactionProvider {

    constructor(configuration) {
        this.apiUrl = configuration.ethereumApi;
    }

    async getTransactionsForBlocks(coin, from, to) {
        logger.verbose(`getting ${coin.description} transactions in blocks ${from} > ${to}`);
        const web3 = this.getWeb3();
        const contract = this.getContract(web3, coin.baseAddress);

        const transferEvents = await contract.getPastEvents('Transfer', {
            fromBlock: from,
            toBlock: to,
        });
        return transferEvents.map(txn => this.mapEventToTransaction(txn, coin));
    }

    async getTransactionsForAddress(coin, address) {
        logger.verbose(`getting transactions for ${coin.description}`);
        const results = [];
        const transactions = await models.Erc20Transaction.findAll({
            where: {
                $and : [
                    {
                        coinId: coin.id,
                    },
                    {
                        $or: [
                            {
                                from: address,
                            },
                            {
                                to: address,
                            },
                        ],
                    },
                ],
            },
            include: [
                {
                    model: models.EthereumBlock,
                },
            ],
        });

        for (const txn of transactions) {
            const result = {
                id: uuid(),
                transactionId: txn.transactionHash,
                amount: (txn.from === address ? -1 : 1) * txn.value,
                date: new Date(txn.EthereumBlock.ts * 1000),
                counterParty: txn.from == address ? txn.to : txn.from,
            };

            results.push(result);
        }

        return results;
    }

    mapEventToTransaction(eventData, coin) {
        return {
            id: uuid(),
            coinId: coin.id,
            blockNumber: eventData.blockNumber,
            transactionHash: eventData.transactionHash,
            logIndex: eventData.logIndex,
            address: eventData.address,
            isRemoved: eventData.removed,
            from: eventData.returnValues._from,
            to: eventData.returnValues._to,
            amount: eventData.returnValues._value / Math.pow(10, coin.decimals),
        };
    }

    getContract(web3, contractAddress) {
        return new web3.eth.Contract(erc20, contractAddress);
    }

    getWeb3() {
        if (this.web3 === undefined) {
            this.web3 = this.buildWeb3();
        }
        return this.web3;
    }

    buildWeb3() {
        logger.verbose(`getting web3 js connection from ${this.apiUrl}`);
        return new Web3(new Web3.providers.HttpProvider(this.apiUrl));
    }
}

module.exports = Erc20TransactionProvider;
