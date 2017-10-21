
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('AccountSummary', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            accountId: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'Account',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
                unique: 'oneSummaryPerTs'
            },
            ts: {
                type: Sequelize.BIGINT,
                allowNull: false,
                unique: 'oneSummaryPerTs'
            },
            total:{
                type: Sequelize.DECIMAL(50,20),
                allowNull: false
            },
            unitPrice:{
                type: Sequelize.DECIMAL(50,20),
                allowNull: false
            },
            increase:{
                type: Sequelize.DECIMAL(20,4),
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
        }, {
            uniqueKeys: {
                oneSummaryPerTs: {
                    fields: ['ts', 'accountId']
                }
            }
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('AccountSummary');
    },
};
