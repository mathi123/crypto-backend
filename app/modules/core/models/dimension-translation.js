const uuid = require('uuid/v4');

module.exports = (sequelize, DataTypes) => {
    const DimensionTranslation = sequelize.define('DimensionTranslation', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        dimensionId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        languageId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        translation: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
    }, {
        tableName: 'DimensionTranslation',
        timestamps: false,
        classMethods: {
            associate (models) {
                const Dimension = models['core']['Dimension'];
                const Language = models['core']['Language'];

                Dimension.hasMany(DimensionTranslation, { foreignKey: 'dimensionId' });
                Language.hasMany(DimensionTranslation, { foreignKey: 'languageId' });

                DimensionTranslation.belongsTo(Dimension,
                    {
                        foreignKey: {
                            name: 'dimensionId',
                            allowNull: false,
                            onDelete: 'CASCADE',
                        },
                    });

                DimensionTranslation.belongsTo(Language,
                    {
                        foreignKey: {
                            name: 'languageId',
                            allowNull: false,
                            onDelete: 'CASCADE',
                        },
                    });
            },
        },
    });

    DimensionTranslation.addHook('beforeCreate', async dimensionTranslation => {
        if (dimensionTranslation.id === null) {
            dimensionTranslation.id = uuid();
        }
    });

    return DimensionTranslation;
};
