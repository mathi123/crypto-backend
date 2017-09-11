
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Dimension', {
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
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('Dimension');
    },
};
