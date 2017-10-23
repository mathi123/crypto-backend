const path = require('path');
const fs = require('fs');

module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.addColumn('Coin', 'jobId', {
            allowNull: true,
            type: Sequelize.UUID,
            references: {
                model: 'Job',
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