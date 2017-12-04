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
                logger.verbose(`inserting new ethereum block ${dbBlock.id}, ts = ${dbBlock.ts}`);
                await models.EthereumBlock.create(dbBlock);
            }else{
                logger.verbose(`ethereum block already in system: ${dbBlock.id}, ts = ${dbBlock.ts}`);
                await models.EthereumBlock.update({
                    ts: dbBlock.ts,
                }, {
                    fields: ['ts']
                    , where: {
                        id: dbBlock.id,
                    },
                });
            }
        }
    }
}

module.exports = EthereumBlockHandler;
