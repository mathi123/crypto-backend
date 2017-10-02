
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const Tag = seq.define('Currency', {
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

    Tag.addHook('beforeCreate', record => {
        if (record.id === null) {
            record.id = uuid();
        }
    });

    return Tag;
};
