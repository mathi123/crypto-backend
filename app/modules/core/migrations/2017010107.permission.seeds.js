const path = require('path');
const fs = require('fs');

module.exports = {
    up (queryInterface) {
        const permissions = JSON.parse(fs.readFileSync(path.join(__dirname, './seeds/permissions.json')));

        return queryInterface.bulkInsert('Permission', permissions, { individualHooks: true });
    },

    down (queryInterface) {
        return queryInterface.bulkDelete('Permission');
    },
};
