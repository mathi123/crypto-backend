
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const User = seq.define('User', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING(512),
            allowNull: false,
            unique: true,
        },
        name: {
            type: Sequelize.STRING(512),
            allowNull: false,
        },
        facebookUserId: {
            type: Sequelize.STRING(512),
            unique: true,
        },
        isAdmin: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        password: {
            type: Sequelize.STRING,
        },
        currencyId: {
            allowNull: true,
            type: Sequelize.UUID,
            references: {
                model: 'Currency',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
    }, {
        tableName: 'Users',
    });

    User.addHook('beforeCreate', record => {
        if (record.id === null) {
            record.id = uuid();
        }
    });

    return User;
};
