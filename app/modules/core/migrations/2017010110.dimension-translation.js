
module.exports = {
    up (queryInterface, Sequelize) {
        return queryInterface.createTable('DimensionTranslation', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
            },
            dimensionId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Dimension',
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
                    fields: ['dimensionId', 'languageId'],
                },
            },
        });
    },
    down (queryInterface) {
        return queryInterface.dropTable('DimensionTranslation');
    },
};
