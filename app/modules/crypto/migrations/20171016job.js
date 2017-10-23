
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Job', {
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
            createdAt: { 
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            }
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('Job');
    },
};
