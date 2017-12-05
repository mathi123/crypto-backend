module.exports = function (seq, Sequelize) {
    const EthereumBlock = seq.define('EthereumBlock', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        ts: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        difficulty: {
            type: Sequelize.STRING(100),
            allowNull: false,
        },
        gasLimit: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        gasUsed: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        hash: {
            type: Sequelize.STRING(66),
            allowNull: false,
        },
        miner: {
            type: Sequelize.STRING(42),
            allowNull: false,
        },
        mixHash: {
            type: Sequelize.STRING(66),
            allowNull: false,
        },
        nonce: {
            type: Sequelize.STRING(18),
            allowNull: false,
        },
        parentHash: {
            type: Sequelize.STRING(66),
            allowNull: false,
        },
        receiptsRoot: {
            type: Sequelize.STRING(66),
            allowNull: false,
        },
        sha3Uncles: {
            type: Sequelize.STRING(66),
            allowNull: false,
        },
        size: {
            type: Sequelize.INTEGER,
            allowNull: false,
        },
        stateRoot: {
            type: Sequelize.STRING(66),
            allowNull: false,
        },
    }, {
        tableName: 'EthereumBlock',
    });

    return EthereumBlock;
};
