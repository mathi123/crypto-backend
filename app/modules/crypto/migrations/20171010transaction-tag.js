
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('TransactionTag', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            transactionId: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'Transaction',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            tagId: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'Tag',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            amount:{
                type: Sequelize.DECIMAL(50,20),
            },
            note: {
                type: Sequelize.STRING(1024)
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
        return queryInterface.dropTable('TransactionTag');
    },
};
