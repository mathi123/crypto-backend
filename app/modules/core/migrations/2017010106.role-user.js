
module.exports = {
    up(queryInterface, Sequelize) {
        return queryInterface.createTable('RoleUser', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
            },
            roleId: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'Role',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            userId: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },
    down(queryInterface) {
        return queryInterface.dropTable('RoleUser');
    },
};
