const path = require('path');
const fs = require('fs');

module.exports = {
    up (queryInterface) {
        const date = new Date();
        const records = JSON.parse(fs.readFileSync(path.join(__dirname, './seeds/tags.json')));

        records.forEach(function(element) {
            element.createdAt = date;
            element.updatedAt = date;
        }, this);
        return queryInterface.bulkInsert('Tag', records, { individualHooks: true });
    },

    down (queryInterface) {
        return queryInterface.bulkDelete('Tag');
    },
};