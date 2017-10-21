
const uuid = require('uuid/v4');

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
    }, {
        tableName: 'EthereumBlock',
    });

    return EthereumBlock;
};
