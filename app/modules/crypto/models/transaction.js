
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const Transaction = seq.define('Transaction', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        accountId: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
                model: 'Account',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        transactionId: {
            allowNull: false,
            type: Sequelize.STRING(100)
        },
        date: {
            type: Sequelize.DATE,
            allowNull: false,
            unique: 'uniquePerTimestamp',
        },
        amount:{
            type: Sequelize.DECIMAL(50,20),
        },
        note: {
            type: Sequelize.STRING(512)
        },
        counterParty:{
            type: Sequelize.STRING
        },  
    }, {
        tableName: 'Transaction',
    });

    Transaction.addHook('beforeCreate', record => {
        if (record.id === null) {
            record.id = uuid();
        }
    });

    return Transaction;
};
