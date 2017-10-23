
const uuid = require('uuid/v4');

module.exports = function (seq, Sequelize) {
    const Coin = seq.define('Coin', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        code: {
            type: Sequelize.STRING(16),
            allowNull: false,
        },
        description: {
            type: Sequelize.STRING(512),
            allowNull: false,
        },
        isActive: {
            type: Sequelize.BOOLEAN(),
            defaultValue: false,
            allowNull: false,
        },
        coinType: {
            type: Sequelize.ENUM('other', 'erc20contract'),
            defaultValue: 'other',
            allowNull: false,
        },
        state: {
            type: Sequelize.ENUM('new', 'importing', 'error', 'done'),
            defaultValue: 'new',
            allowNull: false
        },
        jobId: {
            allowNull: true,
            type: Sequelize.UUID,
            references: {
                model: 'Job',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        baseAddress: {
            type: Sequelize.STRING(512)
        },
        decimals: {
            type: Sequelize.INTEGER,
            defaultValue: 18
        },
        firstBlockSynchronized: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
        lastBlockSynchronized: {
            type: Sequelize.INTEGER,
            allowNull: true,
        },
    }, {
        tableName: 'Coin',
    });

    Coin.associate = function(models){
        const Erc20Transaction = models['crypto']['Erc20Transaction'];

        Coin.hasMany(Erc20Transaction, {
            foreignKey: 'coinId'
        });

        Erc20Transaction.belongsTo(Coin, {
            foreignKey: 'coinId',
            constraints: false
          });
    }

    Coin.addHook('beforeCreate', record => {
        if (record.id === null) {
            record.id = uuid();
        }
    });

    return Coin;
};
