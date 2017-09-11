
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Unit', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
            },
            code: {
                allowNull: false,
                type: Sequelize.STRING(8),
                unique: true,
            },
            description: {
                allowNull: false,
                type: Sequelize.STRING(32),
            },
            dimensionId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Dimension',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            isBaseUnit: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
            },
            conversionToBaseUnit: {
                type: Sequelize.DECIMAL,
                allowNull: false,
            },
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('Unit');
    },
};
