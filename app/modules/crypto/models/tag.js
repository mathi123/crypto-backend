
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const Tag = seq.define('Tag', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        code: {
            type: Sequelize.STRING(512),
            allowNull: false,
            unique: true,
        },
        description: {
            type: Sequelize.STRING(512)
        }
    }, {
        tableName: 'Tag',
    });

    Tag.addHook('beforeCreate', record => {
        if (record.id === null) {
            record.id = uuid();
        }
    });

    return Tag;
};
