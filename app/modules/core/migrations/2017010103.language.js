
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Language', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
            },
            code: {
                allowNull: false,
                type: Sequelize.STRING(2),
                unique: true,
            },
            description: {
                allowNull: false,
                type: Sequelize.STRING,
            },
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('Language');
    },
};
