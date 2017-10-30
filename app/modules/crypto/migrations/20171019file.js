const path = require('path');
const fs = require('fs');

module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('File', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            createdAt: { 
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            data: {
                allowNull: true,
                type: Sequelize.TEXT
            },
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('File');
    },
};