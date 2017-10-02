
const uuid = require('uuid/v4');

module.exports = function (sequelize, DataTypes) {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        coin: {
            type: DataTypes.STRING,
        },
        index: {
            type: DataTypes.INTEGER,
        },
        hash: {
            type: DataTypes.STRING,
        },
        from: {
            type: DataTypes.STRING,
        },
        to: {
            type: DataTypes.STRING,
        },
        amount: {
            type: DataTypes.DECIMAL(100, 50),
        },
        ts: {
            type: DataTypes.BIGINT
        }
    }, {
        tableName: 'Transaction',
        timestamps: false,
    });

    Transaction.addHook('beforeCreate', async record => {
        if (record.id === null) {
            record.id = uuid();
        }
    });

    return Transaction;
};
