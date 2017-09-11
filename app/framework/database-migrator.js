const Umzug = require('umzug');
const fs = require('fs');
const path = require('path');

class DatabaseMigrator{
    constructor(configuration, sequelize){
        this.configuration = configuration;
        this.sequelize = sequelize;
    }

    async executeModuleMigrations(moduleName){
        const migrationsPath = path.join(__dirname, '../modules', moduleName, 'migrations');

        if(fs.existsSync(migrationsPath)){
            await this.runMigrationsInPath(migrationsPath);
        }
    }

    async runMigrationsInPath(migrationsPath) {
        const config = {
            storage: 'sequelize',
            storageOptions: {
                sequelize: this.sequelize,
            },
            migrations:{
                params: [this.sequelize.getQueryInterface(), // queryInterface
                    this.sequelize.constructor],
                path: migrationsPath,
                pattern: /\.js$/,
            },
        };

        const umzug = new Umzug(config);
        try{
            const migrations = await umzug.up();
            // ToDo console.log(`the following migrations where run: ${JSON.stringify(migrations)}`);
        }catch(err){
            // ToDo console.log(err);
        }
    }
}

module.exports = DatabaseMigrator;
