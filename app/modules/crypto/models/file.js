
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const File = seq.define('File', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        coinId: {
            allowNull: true,
            type: Sequelize.UUID,
            references: {
                model: 'Coin',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
    }, {
        tableName: 'File',
    });

    return File;
};
