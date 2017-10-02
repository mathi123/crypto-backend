
const uuid = require('uuid/v4');

module.exports = function (sequelize, DataTypes) {
    const Coin = sequelize.define('Coin', {
        code: {
            type: DataTypes.STRING,
            unique: true,
            primaryKey: true,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        coinType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        baseAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'Coin',
        timestamps: false,
    });

    return Coin;
};
