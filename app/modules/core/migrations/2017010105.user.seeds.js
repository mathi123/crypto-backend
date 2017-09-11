const path = require('path');
const fs = require('fs');

module.exports = {
    up (queryInterface) {
        const users = JSON.parse(fs.readFileSync(path.join(__dirname, './seeds/users.json')));

        return queryInterface.bulkInsert('Users', users, { individualHooks: true });
    },

    down (queryInterface) {
        return queryInterface.bulkDelete('Users');
    },
};
