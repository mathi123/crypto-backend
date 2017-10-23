
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const Log = seq.define('Log', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        type: {
            type: Sequelize.ENUM('verbose', 'info', 'warning', 'error'),
            defaultValue: 'verbose',
            allowNull: false
        },
        log: {
            allowNull: true,
            type: Sequelize.STRING(1000)
        },  
        data: {
            allowNull: true,
            type: Sequelize.TEXT
        },
        jobId: {
            allowNull: true,
            type: Sequelize.UUID,
            references: {
                model: 'Job',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        userId: {
            allowNull: true,
            type: Sequelize.UUID,
            references: {
                model: 'Users',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
    }, {
        tableName: 'Log',
    });
    
    return Log;
};
