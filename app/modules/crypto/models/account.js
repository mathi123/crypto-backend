
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const Account = seq.define('Account', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
                model: 'User',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        coinId: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
                model: 'Coin',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        state: {
            type: Sequelize.ENUM('new', 'importing', 'error', 'done'),
            defaultValue: 'new',
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        color: {
            type: Sequelize.STRING(7),
            allowNull: false,
        },
        address: {
            type: Sequelize.STRING(512),
            allowNull: false,
        },
        note: {
            type: Sequelize.STRING,
        },
        transactionType: {
            type: Sequelize.ENUM('auto', 'manual', 'bittrex'),
            defaultValue: 'auto',
            allowNull: false,
        },
    }, {
        tableName: 'Account',
    });

    Account.associate = function(models){
        const Coin = models['crypto']['Coin'];

        Coin.hasMany(Account, {
            foreignKey: 'coinId',
        });

        Account.belongsTo(Coin, {
            foreignKey: 'coinId',
        });
    };


    Account.addHook('beforeCreate', record => {
        if (record.id === null) {
            record.id = uuid();
        }
    });

    return Account;
};
