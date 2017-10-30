
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Erc20Transaction', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
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
            transactionHash: {
                allowNull: false,
                type: Sequelize.STRING(100),
                unique: 'erc20_Unique'
            },
            blockNumber: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'EthereumBlock',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                unique: 'erc20_Unique'
            },
            logIndex: {
                allowNull: false,
                type: Sequelize.INTEGER,
                unique: 'erc20_Unique'
            },
            isRemoved: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            address: {
                allowNull: false,
                type: Sequelize.STRING(100),
            },
            from: {
                allowNull: false,
                type: Sequelize.STRING(100)
            },
            to: {
                allowNull: false,
                type: Sequelize.STRING(100)
            },
            value:
            {
                type: Sequelize.DECIMAL(50,20),
                allowNull: false,
            },            
            createdAt: { 
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            }
        }, {
            uniqueKeys: {
                erc20_Unique: {
                    fields: ['transactionHash', 'blockNumber', 'logIndex']
                }
            }
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('Erc20Transaction');
    },
};
