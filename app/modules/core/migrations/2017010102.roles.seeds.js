const path = require('path');
const fs = require('fs');

module.exports = {
    up (queryInterface) {
        const roles = JSON.parse(fs.readFileSync(path.join(__dirname, './seeds/roles.json')));

        return queryInterface.bulkInsert('Role', roles, { individualHooks: true });
    },

    down (queryInterface) {
        return queryInterface.bulkDelete('Role');
    },
};
