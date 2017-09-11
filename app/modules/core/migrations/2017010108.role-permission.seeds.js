const path = require('path');
const fs = require('fs');

module.exports = {
    up (queryInterface) {
        const rolePermissions = JSON.parse(fs.readFileSync(path.join(__dirname, './seeds/role-permissions.json')));

        return queryInterface.bulkInsert('RolePermission', rolePermissions, { individualHooks: true });
    },

    down () {
    },
};
