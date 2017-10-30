const path = require('path');
const fs = require('fs');

module.exports = {
    up (queryInterface) {
        const records = JSON.parse(fs.readFileSync(path.join(__dirname, './seeds/file.json')));
        var updatePromises = [];

        for(let element of records) {
            var query = `UPDATE "public"."Coin" SET "fileId" = '${element.id}' WHERE id = '${element.coinId}'`;
            var updatePromise = queryInterface.sequelize.query(query);
            
            updatePromises.push(updatePromise);
        }

        return Promise.all(updatePromises);
    },

    down (queryInterface) {
        //return queryInterface.bulkDelete('File');
    },
};