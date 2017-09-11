const uuid = require('uuid/v4');

module.exports = (sequelize, DataTypes) => {
    const UnitTranslation = sequelize.define('UnitTranslation', {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
        },
        unitId: {
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
        tableName: 'UnitTranslation',
        timestamps: false,
        classMethods: {
            associate (models) {
                const Unit = models['core']['Unit'];
                Unit.hasMany(UnitTranslation, { foreignKey: 'unitId' });

                UnitTranslation.belongsTo(Unit,
                    {
                        foreignKey: {
                            name: 'unitId',
                            allowNull: false,
                            onDelete: 'CASCADE',
                        },
                    });
            },
        },
    });

    UnitTranslation.addHook('beforeCreate', async unitTranslation => {
        if (unitTranslation.id === null) {
            unitTranslation.id = uuid();
        }
    });

    return UnitTranslation;
};
