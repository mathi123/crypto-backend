
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Transaction', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            coin: {
                type: Sequelize.STRING,
            },
            index: {
                type: Sequelize.INTEGER,
            },
            hash: {
                type: Sequelize.STRING,
            },
            from: {
                type: Sequelize.STRING,
            },
            to: {
                type: Sequelize.STRING,
            },
            amount: {
                type: Sequelize.DECIMAL(100,50),
            },
            ts: {
                type: Sequelize.BIGINT
            }
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('Transaction');
    },
};
