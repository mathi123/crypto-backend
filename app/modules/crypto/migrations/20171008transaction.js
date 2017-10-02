
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Transaction', {
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
            },
            ts: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            amount:{
                type: Sequelize.DECIMAL(50,20),
            },
            note: {
                type: Sequelize.STRING(512)
            },
            counterParty:{
                type: Sequelize.STRING
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
        return queryInterface.dropTable('Transaction');
    },
};
