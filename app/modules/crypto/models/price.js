
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const Price = seq.define('Price', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        date: {
            type: Sequelize.DATE,
            allowNull: false,
            unique: 'uniquePerTimestamp',
        },
        isDayPrice: {
            type: Sequelize.BOOLEAN(),
            defaultValue: false,
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
            unique: 'uniquePerTimestamp',
        },
        currencyId: {
            allowNull: false,
            type: Sequelize.UUID,
            references: {
                model: 'Currency',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
            unique: 'uniquePerTimestamp',
        },
        price:{
            type: Sequelize.DECIMAL(50, 20),
        },
    }, {
        tableName: 'Price',
    });

    Price.addHook('beforeCreate', record => {
        if (record.id === null) {
            record.id = uuid();
        }
    });

    return Price;
};
