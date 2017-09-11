
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('UnitTranslation', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
            },
            unitId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Unit',
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
                allowNull: false,
                type: Sequelize.STRING(32),
            },
        }, {
            uniqueKeys: {
                unique_translation: {
                    fields: ['unitId', 'languageId'],
                },
            },
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('UnitTranslation');
    },
};
