const OrmInitializer = require('./orm-initializer');
const ConfigurationLoader = require('./configuration-loader');
const Server = require('./server');
const RouteInitializer = require('./route-intializer');
const path = require('path');
const DatabaseMigrator = require('./database-migrator');
const JobRunner = require('./job-runner');
const logger = require('./logger');

class Bootstrapper {

    constructor() {
        this.ormInitializer = new OrmInitializer();
    }

    async run(configurationOverrides) {
        logger.info('Starting bootstrapper');
        this.loadConfigurationFile(configurationOverrides);
        this.initializeOrm();
        await this.runMigrations();
        this.loadModules();
        this.createServer();
        this.buildRoutes();
        await this.startJobRunner();

        return this.server;
    }

    loadConfigurationFile(configurationOverrides) {
        let configFile = 'configuration.json';
        const configFileFlag = process.argv.indexOf('-c');
        if(configFileFlag >= 0){
            configFile = process.argv[configFileFlag + 1];
        }
        const configurationLoader = new ConfigurationLoader();
        const configFilePath = path.join(__dirname, `../${configFile}`);
        logger.info('Loading config file', configFilePath);

        this.configuration = configurationLoader.load(configFilePath, configurationOverrides);
    }

    async runMigrations() {
        if (this.configuration.runMigrationsOnStartUp) {
            const migrationRunner = new DatabaseMigrator(this.configuration.orm, this.ormInitializer.sequelize);

            for (const module of this.configuration.modules) {
                await migrationRunner.executeModuleMigrations(module);
            }
        }
    }

    initializeOrm() {
        this.ormInitializer.initialize(this.configuration.orm);
    }

    loadModules() {
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

    buildRoutes() {
        const app = this.server.getApp();
        const routeInitializer = new RouteInitializer(app, this.configuration);
        const modules = this.configuration.modules;
        modules.forEach((module) => routeInitializer.loadModule(module));
        routeInitializer.bootstrap(app);
    }

    async startJobRunner() {
        if (this.configuration.runJobrunnerOnStartup) {
            const jobRunner = new JobRunner(this.configuration);
            await jobRunner.start();
            JobRunner.Current = jobRunner;
        }
    }
}

module.exports = Bootstrapper;
