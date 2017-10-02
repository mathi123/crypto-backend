
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const Coin = seq.define('Coin', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        code: {
            type: Sequelize.STRING(16),
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING(512),
            allowNull: false,
        },
        isActive: {
            type: Sequelize.BOOLEAN(),
            defaultValue: false,
            allowNull: false,
        },
        coinType: {
            type: Sequelize.ENUM('other', 'erc20contract'),
            defaultValue: 'other',
            allowNull: false,
        },
        baseAddress: {
            type: Sequelize.STRING(512)
        },
        decimals: {
            type: Sequelize.INTEGER,
            defaultValue: 18
        },
    }, {
        tableName: 'Coin',
    });

    Coin.addHook('beforeCreate', record => {
        if (record.id === null) {
            record.id = uuid();
        }
    });

    return Coin;
};
