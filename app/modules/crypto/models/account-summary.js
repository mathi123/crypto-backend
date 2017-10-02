
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const AccountSummary = seq.define('AccountSummary', {
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
        ts: {
            type: Sequelize.BIGINT,
            allowNull: false,
        },
        total:{
            type: Sequelize.DECIMAL(50,20),
            allowNull: false
        },
        unitPrice:{
            type: Sequelize.DECIMAL(50,20),
            allowNull: false
        },
        increase:{
            type: Sequelize.DECIMAL(20,4),
            allowNull: false
        },
        createdAt: { 
            type: Sequelize.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
        }
    }, {
        tableName: 'AccountSummary',
    });

    AccountSummary.addHook('beforeCreate', record => {
        if (record.id === null) {
            record.id = uuid();
        }
    });

    return AccountSummary;
};
