module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.addColumn('Transaction', 'date', {
            type: Sequelize.DATE,
            allowNull: false,
        });
    },
    down (queryInterface) {
        return [];
    },
};
