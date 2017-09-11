
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('RoleTranslation', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
            },
            roleId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Role',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            languageId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Language',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },
            translation: {
                type: Sequelize.STRING(512),
                allowNull: false,
            },
        }, {
            uniqueKeys: {
                unique_translation: {
                    fields: ['roleId', 'languageId'],
                },
            },
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('RoleTranslation');
    },
};
