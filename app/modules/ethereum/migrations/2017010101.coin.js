
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Coin', {
            code: {
                type: Sequelize.STRING(16),
                allowNull: false,
                primaryKey: true,
                unique: true,
            },
            description: {
                type: Sequelize.STRING(512),
                allowNull: false,
            },
            isActive: {
                type: Sequelize.BOOLEAN(),
                allowNull: false,
            },
            coinType: {
                type: Sequelize.STRING(512),
                allowNull: false,
            },
            baseAddress: {
                type: Sequelize.STRING(512),
                allowNull: false,
            },
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('Coin');
    },
};
