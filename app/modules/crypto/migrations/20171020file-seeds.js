const path = require('path');
const fs = require('fs');

module.exports = {
    up (queryInterface) {
        const date = new Date();
        const records = JSON.parse(fs.readFileSync(path.join(__dirname, './seeds/file.json')));
        let files = [];

        records.forEach(function(element) {
            files.push({
                id: element.id,
                data: element.data,
                createdAt: date,
                updatedAt: date,
            });
        }, this);

        return queryInterface.bulkInsert('File', files, { individualHooks: true });
    },

    down (queryInterface) {
        return queryInterface.bulkDelete('File');
    },
};