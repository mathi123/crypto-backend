const path = require('path');
const fs = require('fs');

module.exports = {
    up (queryInterface) {
        const date = new Date();
        const records = fs.readFileSync(path.join(__dirname, './seeds/ethereum-block.csv'), "utf8").split(/\r?\n/);

        let inserts = [];
        for(let record of records){
            let data = record.split(',');
            let element = {
                id: data[0],
                ts: data[1],
                createdAt: date,
                updatedAt: date
            };

            if(element.id !== null && element.id !== undefined && element.id != ''){
                inserts.push(element);
            }
        }

        return queryInterface.bulkInsert('EthereumBlock', inserts, { individualHooks: true });
    },

    down (queryInterface) {
    },
};
