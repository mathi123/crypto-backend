
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Coin', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            code: {
                type: Sequelize.STRING(16),
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING(512),
                allowNull: false,
            },
            isActive: {
                type: Sequelize.BOOLEAN(),
                defaultValue: false,
                allowNull: false,
            },
            coinType: {
                type: Sequelize.ENUM('other', 'erc20contract'),
                defaultValue: 'other',
                allowNull: false,
            },
            baseAddress: {
                type: Sequelize.STRING(512)
            },
            decimals: {
                type: Sequelize.INTEGER,
                defaultValue: 18
            },
            createdAt: { 
                type: Sequelize.DATE 
            },
            updatedAt: {
                type: Sequelize.DATE,
            }
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('Coin');
    },
};
