
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('Users', {
            id: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING(512),
                allowNull: false,
                unique: true,
            },
            facebookUserId: {
                type: Sequelize.STRING(512),
                unique: true
            },
            name: {
                type: Sequelize.STRING(512),
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING,
            },
            isAdmin: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
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
        return queryInterface.dropTable('Users');
    },
};
