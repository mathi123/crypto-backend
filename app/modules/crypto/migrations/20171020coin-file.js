const path = require('path');
const fs = require('fs');

module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.addColumn('Coin', 'fileId', {
            allowNull: true,
            type: Sequelize.UUID,
            references: {
                model: 'File',
                key: 'id',
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE',
        });
    },

    down (queryInterface) {
        return queryInterface.dropColumn('Coin',  'fileId');
    },
};