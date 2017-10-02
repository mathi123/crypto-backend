
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Currency', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            code: {
                type: Sequelize.STRING(16),
                allowNull: false,
                unique: true,
            },
            symbol: {
                type: Sequelize.STRING(1),
                allowNull: false,
                unique: true,
            },
            description: {
                type: Sequelize.STRING(512),
                allowNull: false,
            },
            isActive: {
                type: Sequelize.BOOLEAN(),
                defaultValue: true,
                allowNull: false,
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
        return queryInterface.dropTable('Currency');
    },
};
