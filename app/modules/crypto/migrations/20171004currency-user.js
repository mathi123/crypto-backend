const path = require('path');
const fs = require('fs');

module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.addColumn('Users', 'currencyId', {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
                model: 'Currency',
                key: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });
    },

    down (queryInterface) {
        return queryInterface.dropColumn('Users',  'currencyId');
    },
};