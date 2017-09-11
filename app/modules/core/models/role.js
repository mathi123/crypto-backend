const uuid = require('uuid/v4');

module.exports = (sequelize, DataTypes) => {
    const Role = sequelize.define('Role', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        code: {
            allowNull: false,
            unique: true,
            type: DataTypes.STRING,
        },
        description: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        isRemovable: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
        },
    }, {
        tableName: 'Role',
        timestamps: false,
    });

    Role.addHook('beforeCreate', async role => {
        if (role.id === null) {
            role.id = uuid();
        }
    });

    return Role;
};
