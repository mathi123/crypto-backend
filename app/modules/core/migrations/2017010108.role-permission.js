
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('RolePermission', {
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
            permissionId: {
                allowNull: false,
                type: Sequelize.UUID,
                references: {
                    model: 'Permission',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
        }, {
            uniqueKeys: {
                occurs_once: {
                    fields: ['roleId', 'permissionId'],
                },
            },
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('RolePermission');
    },
};
