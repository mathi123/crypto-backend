
const uuid = require('uuid/v4');

module.exports = function (sequelize, DataTypes) {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: 'Users',
        timestamps: false,
    });

    User.addHook('beforeCreate', async user => {
        if (user.id === null) {
            user.id = uuid();
        }
    });

    return User;
};
