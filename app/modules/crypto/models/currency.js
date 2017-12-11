
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const Currency = seq.define('Currency', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        code: {
            type: Sequelize.STRING(16),
            allowNull: false,
            unique: true,
        },
        symbol: {
            type: Sequelize.STRING(1),
            allowNull: false,
            unique: true,
        },
        description: {
            type: Sequelize.STRING(512),
            allowNull: false,
        },
        isActive: {
            type: Sequelize.BOOLEAN(),
            defaultValue: true,
            allowNull: false,
        },
    }, {
        tableName: 'Currency',
    });


    Currency.associate = function(models){
        const User = models['core']['User'];

        Currency.hasMany(User, {
            foreignKey: 'currencyId',
        });

        User.belongsTo(Currency, {
            foreignKey: 'currencyId',
        });
    };

    Currency.addHook('beforeCreate', record => {
        if (record.id === null) {
            record.id = uuid();
        }
    });

    return Currency;
};
