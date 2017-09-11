
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Permission', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
            },
            code: {
                allowNull: false,
                type: Sequelize.STRING(64),
                unique: true,
            },
            description: {
                allowNull: false,
                type: Sequelize.STRING(512),
            },
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('Permission');
    },
};
