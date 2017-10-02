
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Account', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            userId: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            coinId: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'Coin',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            description: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            color: {
                type: Sequelize.STRING(6),
                allowNull: false,
            },
            address: {
                type: Sequelize.STRING(512),
                allowNull: false,
            },
            note: {
                type: Sequelize.STRING(1024)
            },
            transactionType: {
                type: Sequelize.ENUM('auto', 'manual', 'bittrex'),
                defaultValue: 'auto',
                allowNull: false
            },
            createdAt: { 
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            }
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('Account');
    },
};
