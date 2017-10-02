
const uuid = require('uuid/v4');

module.exports = function (sequelize, DataTypes) {
    const Block = sequelize.define('Block', {
        number: {
            type: DataTypes.INTEGER,
            unique: true,
            primaryKey: true,
            allowNull: false,
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'Block',
        timestamps: false,
    });

    return Block;
};
