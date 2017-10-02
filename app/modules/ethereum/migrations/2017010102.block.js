
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Block', {
            number: {
                type: Sequelize.INTEGER,
                unique: true,
                primaryKey: true,
                allowNull: false,
            },
            hash: {
                type: Sequelize.STRING,
                allowNull: false,
            },
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('Block');
    },
};
