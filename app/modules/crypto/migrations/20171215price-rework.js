module.exports = {
    up (queryInterface, Sequelize) {
        return [
            queryInterface.sequelize.query('ALTER TABLE Price DROP CONSTRAINT uniquePerTimestamp;'),
            queryInterface.removeColumn('Price', 'ts')];
    },
    down (queryInterface) {
        return [];
    },
};
