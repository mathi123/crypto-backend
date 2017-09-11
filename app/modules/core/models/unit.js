
const uuid = require('uuid/v4');

module.exports = function (sequelize, DataTypes) {
    const Unit = sequelize.define('Unit', {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        code: {
            allowNull: false,
            unique: true,
            type: DataTypes.STRING(8),
        },
        description: {
            allowNull: false,
            type: DataTypes.STRING(32),
        },
        dimensionId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        isBaseUnit: {
            allowNull: false,
            type: DataTypes.BOOLEAN,
        },
        conversionToBaseUnit: {
            type: DataTypes.DECIMAL,
            allowNull: false,
        },
    }, {
        tableName: 'Unit',
        timestamps: false,
        classMethods: {
            associate (models) {
                const Dimension = models['core']['Dimension'];
                Dimension.hasMany(Unit, { foreignKey: 'dimensionId' });

                Unit.belongsTo(Dimension,
                    {
                        foreignKey: {
                            name: 'dimensionId',
                            allowNull: false,
                            onDelete: 'CASCADE',
                        },
                    });
            },
        },
    });

    Unit.addHook('beforeCreate', async unit => {
        if (unit.id === null) {
            unit.id = uuid();
        }
    });

    return Unit;
};
