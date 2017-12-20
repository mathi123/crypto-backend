module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.removeColumn('Transaction', 'ts');
    },
    down (queryInterface) {
        return [];
    },
};
