module.exports = {
    up (queryInterface, Sequelize) {
        return [queryInterface.addColumn('EthereumBlock', 'difficulty', {
            allowNull: false,
            type: Sequelize.STRING(100),
        }), queryInterface.addColumn('EthereumBlock', 'gasLimit', {
            allowNull: false,
            type: Sequelize.INTEGER,
        }), queryInterface.addColumn('EthereumBlock', 'gasUsed', {
            allowNull: false,
            type: Sequelize.INTEGER,
        }), queryInterface.addColumn('EthereumBlock', 'hash', {
            allowNull: false,
            type: Sequelize.STRING(66),
        }), queryInterface.addColumn('EthereumBlock', 'miner', {
            allowNull: false,
            type: Sequelize.STRING(42),
        }), queryInterface.addColumn('EthereumBlock', 'mixHash', {
            allowNull: false,
            type: Sequelize.STRING(66),
        }), queryInterface.addColumn('EthereumBlock', 'nonce', {
            allowNull: false,
            type: Sequelize.STRING(18),
        }), queryInterface.addColumn('EthereumBlock', 'parentHash', {
            allowNull: false,
            type: Sequelize.STRING(66),
        }), queryInterface.addColumn('EthereumBlock', 'receiptsRoot', {
            allowNull: false,
            type: Sequelize.STRING(66),
        }), queryInterface.addColumn('EthereumBlock', 'sha3Uncles', {
            allowNull: false,
            type: Sequelize.STRING(66),
        }), queryInterface.addColumn('EthereumBlock', 'size', {
            allowNull: false,
            type: Sequelize.INTEGER,
        }), queryInterface.addColumn('EthereumBlock', 'stateRoot', {
            allowNull: false,
            type: Sequelize.STRING(66),
        })];
    },
    down (queryInterface) {
        return [];
    },
};
