
const uuid = require('uuid/v4');

module.exports = function (sequelize, DataTypes) {
    const Permission = sequelize.define('Permission', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        code: {
            allowNull: false,
            unique: true,
            type: DataTypes.STRING(64),
        },
        description: {
            allowNull: false,
            type: DataTypes.STRING(512),
        },
    }, {
        tableName: 'Permission',
        timestamps: false,
    });

    Permission.addHook('beforeCreate', async permission => {
        if (permission.id === null) {
            permission.id = uuid();
        }
    });

    return Permission;
};
