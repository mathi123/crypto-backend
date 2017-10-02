const OrmInitializer = require('./orm-initializer');
const ConfigurationLoader = require('./configuration-loader');
const Server = require('./server');
const RouteInitializer = require('./route-intializer');
const path = require('path');
const DatabaseMigrator = require('./database-migrator');

// Jobs (temp)
const synchronizeCoins = require('../modules/ethereum/apis/bittrex');
const synchroniseBlocks = require('../modules/ethereum/apis/ethereum');

class Bootstrapper{

    constructor(){
        this.ormInitializer = new OrmInitializer();
    }

    async run(configurationOverrides){
        this.loadConfigurationFile(configurationOverrides);
        this.initializeOrm();
        await this.runMigrations();
        this.loadModules();
        this.createServer();
        this.buildRoutes();

        //await this.startJobs();

        return this.server;
    }

    loadConfigurationFile(configurationOverrides){
        const configurationLoader = new ConfigurationLoader();
        const configFilePath = path.join(__dirname, '../configuration.json');

        this.configuration = configurationLoader.load(configFilePath, configurationOverrides);
    }

    async runMigrations(){
        if(this.configuration.runMigrationsOnStartUp) {
            this.migrationRunner = new DatabaseMigrator(this.configuration.orm, this.ormInitializer.sequelize);

            for (let module of this.configuration.modules) {
                await this.migrationRunner.executeModuleMigrations(module);
            }
        }
    }

    initializeOrm(){
        this.ormInitializer.initialize(this.configuration.orm);
    }

    loadModules(){
        const modules = this.configuration.modules;
        modules.forEach((module) => this.loadModule(module));
    }

    loadModule(module) {
        this.ormInitializer.loadModule(module);
    }

    createServer() {
        this.server = new Server(this.configuration);
        this.server.build();
    }

    buildRoutes(){
        const app = this.server.getApp();
        const routPrefix = this.configuration.routePrefix;
        const routeInitializer = new RouteInitializer(app, routPrefix);
        const modules = this.configuration.modules;
        modules.forEach((module) => routeInitializer.loadModule(module));
        routeInitializer.bootstrap(app);
    }

    async startJobs(){
        await synchronizeCoins();
        synchroniseBlocks(this.configuration.ethereumApi);
    }
}

module.exports = Bootstrapper;
