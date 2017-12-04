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
            throw err;
        }
    }

    async insertBlock(dbBlock) {
        try{
            await models.EthereumBlock.create(dbBlock);
        }catch(err){
            logger.verbose(`could not insert new ethereum block ${dbBlock.id}, ts = ${dbBlock.ts}`);
            throw err;
        }
    }
}

module.exports = EthereumBlockHandler;
