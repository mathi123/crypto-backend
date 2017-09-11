
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Role', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
            },
            code: {
                type: Sequelize.STRING(16),
                allowNull: false,
                unique: true,
            },
            description: {
                type: Sequelize.STRING(512),
                allowNull: false,
            },
            isRemovable: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
            },
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('Role');
    },
};
