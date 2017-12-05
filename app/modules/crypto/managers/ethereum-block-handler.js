const logger = require('../../../framework/logger');
const models = require('../models');

class EthereumBlockHandler{
    async handleBlocks(coin, blocks){
        logger.info(`handling ${blocks.length} ${coin.description} blocks.`);

        for(const block of blocks){
            const dbBlock = {
                id: block.number,
                ts: block.timestamp,
                difficulty: block.difficulty,
                gasLimit: block.gasLimit,
                gasUsed: block.gasUsed,
                hash: block.hash,
                miner: block.miner,
                mixHash: block.mixHash,
                nonce: block.nonce,
                parentHash: block.parentHash,
                receiptsRoot: block.receiptsRoot,
                sha3Uncles: block.sha3Uncles,
                size: block.size,
                stateRoot: block.stateRoot,
            };

            const existing = await models.EthereumBlock.findOne({
                where:{
                    id: dbBlock.id,
                },
            });
            if(existing === null){
                await this.insertBlock(dbBlock);
            }else{
                await this.updateBlock(dbBlock);
            }
        }
    }

    async updateBlock(dbBlock) {
        const data = {
            ts: dbBlock.ts,
        };
        const options = {
            fields: ['ts'],
            where: {
                id: dbBlock.id,
            },
        };

        try{
            logger.verbose(`ethereum block already in system: ${dbBlock.id}, ts = ${dbBlock.ts}`);
            await models.EthereumBlock.update(data, options);
        }catch(err){
            logger.error('could not update ethereum block');
            logger.error(JSON.stringify(dbBlock));
            throw err;
        }
    }

    async insertBlock(dbBlock) {
        try{
            await models.EthereumBlock.create(dbBlock);
        }catch(err){
            logger.error(`could not insert new ethereum block ${dbBlock.id}, ts = ${dbBlock.ts}`);
            logger.error(JSON.stringify(dbBlock));
            throw err;
        }
    }
}

module.exports = EthereumBlockHandler;
