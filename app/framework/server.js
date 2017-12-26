const logger = require('./logger');
const initializeExpressApplication = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const HttpStatus = require('http-status-codes');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

class Server {
    constructor(configuration) {
        this.configuration = configuration;
        this.port = configuration.port || 3000;
        this.routePrefix = configuration.routePrefix || 'api';
        this.debug = configuration.debug || false;
    }

    stop() {
        logger.info('stopping server');
        this.server.close();
    }

    start() {
        logger.info('starting server');
        this.buildFallbackRoute();
        const privateKey = fs.readFileSync(this.configuration.https.keyPath).toString();
        const certificate = fs.readFileSync(this.configuration.https.certPath).toString();

        // this.server = this.app.listen(this.port, () => logger.info('listening on port ' + this.port));
        const options = {
            key: privateKey,
            cert: certificate,
            passphrase: this.configuration.https.passphrase,
        };

        this.server = https.createServer(options, this.app)
            .listen(this.port, () => logger.info('listening on port ' + this.port));

        if(this.configuration.runIoOnStartUp){
            logger.info('attaching IO socket to server');
            this.io.attach(this.server);
        }

        logger.info('server started');
    }

    build() {
        logger.info('building server instance');
        this.initializeExpress();
        this.initializeMiddleWares();
        this.logRequests();
    }

    buildFallbackRoute() {
        this.app.use((err, req, res) => this.exceptionHandler(err, req, res));
    }

    exceptionHandler(err, req, res) {
        logger.error(err);
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    initializeExpress() {
        this.app = initializeExpressApplication();
    }

    initializeMiddleWares() {
        this.enableCorsMiddleWare();
        this.enableJsonParserMiddleWare();
        this.enableValidationMiddleware();
    }

    enableCorsMiddleWare() {
        logger.info('enable CORS middleware');
        const corsOptions = {
            allowedHeaders: ['Content-Type', 'Authorization', 'Location', 'X-Total-Count'],
            exposedHeaders: ['Content-Type', 'Authorization', 'Location', 'X-Total-Count'],
        };
        const corsMiddleWare = cors(corsOptions);
        this.app.use(corsMiddleWare);
    }

    enableValidationMiddleware() {
        logger.info('enable express validator middleware');
        this.app.use(expressValidator());
    }

    enableJsonParserMiddleWare() {
        logger.info('enable JSON parser middleware');
        const bodyParserMiddleWare = bodyParser.json();
        this.app.use(bodyParserMiddleWare);
    }

    logRequests(){
        logger.info('configuring route logging');
        this.app.use((req, res, next) => this.logRequest(req, res, next));
    }

    logRequest(req, res, next){
        logger.verbose(`${req.url}`);
        next();
    }

    getApp() {
        return this.app;
    }
}

module.exports = Server;
