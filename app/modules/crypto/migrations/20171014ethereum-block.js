
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('EthereumBlock', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                allowNull: false,
            },
            ts: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },        
            createdAt: { 
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            }
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('EthereumBlock');
    },
};
