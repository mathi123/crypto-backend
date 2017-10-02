
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const TransactionTag = seq.define('TransactionTag', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        transactionId: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
                model: 'Transaction',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        tagId: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
                model: 'Tag',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        amount:{
            type: Sequelize.DECIMAL(50,20),
        },
        note: {
            type: Sequelize.STRING(1024)
        },
    }, {
        tableName: 'TransactionTag',
    });

    TransactionTag.addHook('beforeCreate', record => {
        if (record.id === null) {
            record.id = uuid();
        }
    });

    return TransactionTag;
};
