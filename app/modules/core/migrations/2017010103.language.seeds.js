const path = require('path');
const fs = require('fs');

module.exports = {
    up (queryInterface) {
        const languages = JSON.parse(fs.readFileSync(path.join(__dirname, './seeds/languages.json')));

        return queryInterface.bulkInsert('Language', languages, { individualHooks: true });
    },

    down (queryInterface) {
        return queryInterface.bulkDelete('Language');
    },
};
