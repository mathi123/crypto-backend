
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Tag', {
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
            },
            createdAt: { 
                type: Sequelize.DATE 
            },
            updatedAt: {
                type: Sequelize.DATE,
            }
        }
        );
    },
    down (queryInterface) {
        return queryInterface.dropTable('Tag');
    },
};
