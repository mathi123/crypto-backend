const uuid = require('uuid/v4');

module.exports = function (sequelize, DataTypes) {
    const Language = sequelize.define('Language', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        code: {
            allowNull: false,
            unique: true,
            type: DataTypes.STRING,
        },
        description: {
            allowNull: false,
            type: DataTypes.STRING,
        },
    }, {
        tableName: 'Language',
        timestamps: false,
    });

    Language.addHook('beforeCreate', async language => {
        if (language.id === null) {
            language.id = uuid();
        }
    });

    return Language;
};
