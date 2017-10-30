
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const File = seq.define('File', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        data: {
            allowNull: true,
            type: Sequelize.TEXT
        }
    }, {
        tableName: 'File',
    });

    return File;
};
