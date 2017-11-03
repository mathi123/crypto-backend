const logger = require('./logger');
const path = require('path');
const fs = require('fs');

class RouteInitializer{

    constructor(application, configuration){
        this.application = application;
        this.configuration = configuration;
        this.controllers = [];
    }

    loadModule(moduleName){
        logger.info(`initializing routes for ${moduleName} module.`);
        const modulePath = path.join(__dirname, '../modules', moduleName);
        const controllersDirPath = path.join(modulePath, 'controllers');

        fs.readdirSync(controllersDirPath)
            .filter((file) => this.fileFilter(controllersDirPath, file))
            .forEach((file) => this.buildRoutes(this.controllers, controllersDirPath, file));
    }

    fileFilter(basename, file) {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-14) === '-controller.js');
    }

    buildRoutes(controllers, controllersDirPath, file) {
        const routeBuilderPath = path.join(controllersDirPath, file);
        const RouteBuilder = require(routeBuilderPath);

        const controller = new RouteBuilder(this.configuration);
        controllers.push(controller);
    }

    bootstrap(app){
        const publicRoutes = [];
        for(const controller of this.controllers){
            if(controller.buildRoutes){
                const publicControllerRoutes = controller.buildRoutes(app);
                for(const route in publicControllerRoutes){
                    publicRoutes.push(route);
                }
            }
        }

        for(const controller of this.controllers){
            if(controller.buildAuthenticationRoutes){
                controller.buildAuthenticationRoutes(app, publicRoutes);
            }
        }

        for(const controller of this.controllers){
            if(controller.buildAuthenticatedRoutes){
                controller.buildAuthenticatedRoutes(app);
            }
        }
    }
}

module.exports = RouteInitializer;
