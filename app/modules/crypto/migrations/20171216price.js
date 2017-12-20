module.exports = {
    up (queryInterface, Sequelize) {
        return [
            queryInterface.addColumn('Price', 'date', {
                type: Sequelize.DATE,
                allowNull: false,
            }),
            queryInterface.addColumn('Price', 'isDayPrice', {
                type: Sequelize.BOOLEAN(),
                defaultValue: false,
                allowNull: false,
            }),
            queryInterface.sequelize.query('ALTER TABLE "Price" ADD CONSTRAINT uniquePerTimestamp UNIQUE (date, coinId, currencyId);'),
        ];
    },
    down (queryInterface) {
        return [];
    },
};
