
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Price', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            ts: {
                type: Sequelize.BIGINT,
                allowNull: false,
                unique: 'uniquePerTimestamp'
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
                unique: 'uniquePerTimestamp'
            },
            currencyId: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'Currency',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                unique: 'uniquePerTimestamp'
            },
            price:{
                type: Sequelize.DECIMAL(50,20),
            },
            createdAt: { 
                type: Sequelize.DATE 
            },
            updatedAt: {
                type: Sequelize.DATE,
            }
        }, {
            uniqueKeys: {
                uniquePerTimestamp: {
                    fields: ['ts', 'coinId', 'currencyId']
                }
            }
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('Price');
    },
};
