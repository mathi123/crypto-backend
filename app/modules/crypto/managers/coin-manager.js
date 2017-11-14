const logger = require('../../../framework/logger');
const models = require('../models');
const BlockCypherChainObserver = require('./block-cypher-chain-observer');
const Erc20ChainObserver = require('./erc20-chain-observer');
const EthereumChainObserver = require('./ethereum-chain-observer');
const BlockCypherTransactionProvider = require('./block-cypher-transaction-provider');
const Erc20TransactionProvider = require('./erc20-transaction-provider');
const EthereumTransactionProvider = require('./ethereum-transaction-provider');
const Erc20TransactionHandler = require('./erc20-transaction-handler');
const EthereumBlockProvider = require('./ethereum-block-provider');
const EthereumBlockHandler = require('./ethereum-block-handler');

class CoinManager{
    constructor(configuration){
        this.configuration = configuration;
    }

    async synchronizeCoins(){
        const coins = await models.Coin.findAll({
            where: {
                isActive: true,
            },
        });

        for(const coin of coins){
            await this.synchronizeCoin(coin);
        }
    }

    async synchronizeCoin(coin){
        logger.verbose(`Synchronizing coin ${coin.description}`);
        const observer = this.getChainObserver(coin);
        const lastBlockInDatabase = coin.lastBlockSynchronized;
        const lastBlockOnChain = await observer.getLastBlock(coin);

        let from = 0;
        if(lastBlockInDatabase !== null){
            from = lastBlockInDatabase + 1;
        }

        const batchSize = 1000;

        await this.importBlocks(coin, from, lastBlockOnChain, batchSize);

        await this.updateLastImportedBlock(coin, lastBlockOnChain);
    }

    async updateLastImportedBlock(coin, blockNumber) {
        await models.Coin.update({
            lastBlockSynchronized: blockNumber,
        }, {
            where: {
                id: coin.id,
            },
            fields: ['lastBlockSynchronized'],
        });
    }

    async importBlocks(coin, from, lastBlockOnChain, batchSize) {
        const blockHandlers = this.getBlockHandlers(coin);
        const transactionHandlers = this.getTransactionHandlers(coin);
        const importBlocks = blockHandlers.length > 0;
        const importTransactions = transactionHandlers.length > 0;
        if (importBlocks || importTransactions)  {
            const blockProvider = importBlocks ? this.getBlockProvider(coin) : null;
            const transactionProvider = importTransactions ? this.getTransactionProvider(coin) : null;

            for (let i = from; i < lastBlockOnChain; i = i + batchSize) {
                const to = Math.min(lastBlockOnChain, i + batchSize - 1);

                if(importBlocks){
                    const blocks = await blockProvider.getBlocks(coin, i, to);

                    if(blocks.length > 0){
                        for (const handler of blockHandlers) {
                            handler.handleBlocks(coin, blocks);
                        }
                    }
                }

                if(importTransactions){
                    const transactions = await transactionProvider.getTransactionsForBlocks(coin, i, to);

                    if(transactions.length > 0){
                        for (const handler of transactionHandlers) {
                            handler.handleTransactions(coin, transactions);
                        }
                    }
                }

                await this.updateLastImportedBlock(coin, to);
            }
        }
    }

    getChainObserver(coin){
        if(coin.code === 'BTC' || coin.code === 'LTC' || coin.code === 'DOGE'){
            return new BlockCypherChainObserver();
        }else if(coin.code === 'ETH'){
            return new EthereumChainObserver(this.configuration);
        }else if(coin.coinType === 'erc20contract'){
            return new Erc20ChainObserver(this.configuration);
        }

        throw new Error('Unsupported coin type: no chain observer found.');
    }

    getTransactionProvider(coin){
        if(coin.code === 'BTC' || coin.code === 'LTC' || coin.code === 'DOGE'){
            return new BlockCypherTransactionProvider();
        }else if(coin.code === 'ETH'){
            return new EthereumTransactionProvider(this.configuration);
        }else if(coin.coinType === 'erc20contract'){
            return new Erc20TransactionProvider(this.configuration);
        }

        throw new Error('Unsupported coin type: no transaction provider found.');
    }

    getTransactionHandlers(coin){
        if(coin.coinType === 'erc20contract'){
            return [new Erc20TransactionHandler(this.configuration)];
        }
        return [];
    }

    getBlockProvider(coin){
        if(coin.code === 'ETH'){
            return new EthereumBlockProvider(this.configuration);
        }

        throw new Error('Unsupported coin type: no transaction provider found.');
    }

    getBlockHandlers(coin){
        if(coin.code === 'ETH'){
            return [new EthereumBlockHandler()];
        }
        return [];
    }
}

module.exports = CoinManager;
