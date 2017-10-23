
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const Job = seq.define('Job', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            allowNull: false,
            type: Sequelize.STRING(150),
        },
        args: {
            allowNull: false,
            type: Sequelize.STRING(1000)
        },   
        startTime: { 
            type: Sequelize.DATE,
            allowNull: true,
        },         
        endTime: { 
            type: Sequelize.DATE,
            allowNull: true,
        },  
        progress: {
            allowNull: false,
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        state: {
            type: Sequelize.ENUM('running', 'failed', 'done'),
            defaultValue: 'running',
            allowNull: false
        },
    }, {
        tableName: 'Job',
    });
    
    return Job;
};
