const logger = require('../../../framework/logger');
const models = require('../models');

class EthereumBlockHandler{
    async handleBlocks(coin, blocks){
        logger.info(`handling ${blocks.length} ${coin.description} blocks.`);

        for(const block of blocks){
            const dbBlock = {
                id: block.number,
                ts: block.timestamp,
            };

            const existing = models.EthereumBlock.findOne({
                where:{
                    id: dbBlock.id,
                },
            });
            if(existing === null){
                models.EthereumBlock.create(dbBlock);
            }else{
                models.EthereumBlock.update({
                    ts: dbBlock.ts,
                }, {
                    fields: ['ts']
                    , where: {
                        id: dbBlock.id,
                    },
                });
            }
        }

        if(blocks.length > 0){
            const lastBlock = blocks[blocks.length - 1].number;
            await this.updateLastImportedBlock(coin, lastBlock);
        }
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
}

module.exports = EthereumBlockHandler;
