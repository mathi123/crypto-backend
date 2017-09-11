
const uuid = require('uuid/v4');

module.exports = function (sequelize, DataTypes) {
    const Dimension = sequelize.define('Dimension', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        code: {
            allowNull: false,
            unique: true,
            type: DataTypes.STRING(8),
        },
        description: {
            allowNull: false,
            type: DataTypes.STRING(32),
        },
    }, {
        tableName: 'Dimension',
        timestamps: false,
    });

    Dimension.addHook('beforeCreate', async dimension => {
        if (dimension.id === null) {
            dimension.id = uuid();
        }
    });

    return Dimension;
};
