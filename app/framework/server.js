const initializeExpressApplication = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const HttpStatus = require('http-status-codes');
const cors = require('cors');

class Server{
    constructor(configuration){
        this.port = configuration.port || 3000;
        this.routePrefix = configuration.routePrefix || 'api';
        this.debug = configuration.debug || false;
    }

    stop(){
        this.server.close();
    }

    start(){
        this.buildFallbackRoute();

        this.server = this.app.listen(this.port, () => {
            if(this.debug){
                console.info('listening on port ' + this.port);
            }
        });
    }

    build() {
        this.initializeExpress();

        this.initializeMiddleWares();


    }

    buildFallbackRoute(){
        this.app.use((err, req, res, next) => this.exceptionHandler(err, req, res));
    }

    exceptionHandler(err, req, res) {
        if(this.debug){
            console.error(err);
        }
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    initializeExpress(){
        this.app = initializeExpressApplication();
    }

    initializeMiddleWares(){
        this.enableCorsMiddleWare();
        this.enableJsonParserMiddleWare();
        this.enableValidationMiddleware();
    }

    enableCorsMiddleWare(){
        const corsOptions = {
            allowedHeaders: ['Content-Type', 'Authorization'],
            exposedHeaders: ['Content-Type', 'Authorization'],
        };
        const corsMiddleWare = cors(corsOptions);
        this.app.use(corsMiddleWare);
    }

    enableValidationMiddleware(){
        this.app.use(expressValidator());
    }

    enableJsonParserMiddleWare(){
        const bodyParserMiddleWare = bodyParser.json();
        this.app.use(bodyParserMiddleWare);
    }

    getApp(){
        return this.app;
    }
}

module.exports = Server;
