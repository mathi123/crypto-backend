
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const Erc20Transaction = seq.define('Erc20Transaction', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
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
        transactionHash: {
            allowNull: false,
            type: Sequelize.STRING(100),
        },
        blockNumber: {
            allowNull: false,
            type: Sequelize.INTEGER,
        },
        logIndex: {
            allowNull: false,
            type: Sequelize.INTEGER,
        },
        isRemoved: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
        },
        address: {
            allowNull: false,
            type: Sequelize.STRING(100),
        },
        from: {
            allowNull: false,
            type: Sequelize.STRING(100)
        },
        to: {
            allowNull: false,
            type: Sequelize.STRING(100)
        },
        value:
        {
            type: Sequelize.DECIMAL(50,20),
            allowNull: false,
        }
    }, {
        tableName: 'Erc20Transaction',
    });

    Erc20Transaction.addHook('beforeCreate', record => {
        if (record.id === null) {
            record.id = uuid();
        }
    });

    return Erc20Transaction;
};
