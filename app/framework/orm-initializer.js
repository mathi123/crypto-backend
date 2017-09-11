const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');

class OrmInitializer{
    initialize(configuration){
        this.configuration = configuration;

        this.startSequelize();
    }

    startSequelize(){
        const database = process.env.POSTGRES_DB || this.configuration.database;
        const username = process.env.POSTGRES_USER || this.configuration.username;
        const password = process.env.POSTGRES_PASSWORD || this.configuration.password;
        const config = this.configuration;

        this.sequelize = new Sequelize(database, username, password, config);
    }

    loadModule(moduleName) {
        this.initializeModuleModels(moduleName);
        this.createModels(moduleName);
        this.createModelAssociations(moduleName);
        this.updateModule(moduleName);
    }

    createModels(moduleName){
        const modulePath = path.join(__dirname, '../modules', moduleName);
        const modelsDirPath = path.join(modulePath, 'models');

        fs.readdirSync(modelsDirPath)
            .filter((file) => this.fileFilter(modelsDirPath, file))
            .forEach((file) => this.importSequelizeModel(moduleName, modelsDirPath, file));
    }

    fileFilter(basename, file) {
        return (file !== 'index.js') && (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    }

    importSequelizeModel(moduleName, basename, file){
        const modelFilePath = path.join(basename, file);
        const model = this.sequelize.import(modelFilePath);

        this.sequelize.models[moduleName][model.name] = model;
    }

    createModelAssociations(moduleName){
        Object.keys(this.sequelize.models[moduleName]).forEach((modelName) => {
            const model = this.sequelize.models[moduleName][modelName];
            if (model.associate) {
                model.associate(this.sequelize.models);
            }
        });
    }

    updateModule(moduleName){
        const modelsPath = path.join(__dirname, '../modules', moduleName, 'models');
        const jsModule =  require(modelsPath);

        Object.keys(this.sequelize.models[moduleName]).forEach((modelName) => {
            jsModule[modelName] = this.sequelize.models[moduleName][modelName];
            //console.info(`setting ${modelName} in ${modelsPath} package`);
        });
    }

    initializeModuleModels(moduleName) {
        if(this.sequelize.models === undefined){
            this.sequelize.models = {};
        }
        if(this.sequelize.models[moduleName] === undefined){
            this.sequelize.models[moduleName] = {};
        }
    }
}

module.exports = OrmInitializer;
