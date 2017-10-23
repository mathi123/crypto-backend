const initializeExpressApplication = require('express');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const HttpStatus = require('http-status-codes');
const cors = require('cors');
const socketIo = require('socket.io');
const http = require('http');
const SocketManager = require('./socket-manager');

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

        this.io.attach(this.server);
    }

    build() {
        this.initializeExpress();
        this.initializeMiddleWares();
        this.initializeSockeIo();
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

    initializeSockeIo(){
        let socketManager = new SocketManager();

        this.io = socketIo.listen({
            path: '/socket',
            serveClient: false,
            // below are engine.IO options
            //pingInterval: 10000,
            //pingTimeout: 5000,
            //cookie: false
          });

        socketManager.initialize(this.io);

        SocketManager.Current = socketManager;
    }

    initializeMiddleWares(){
        this.enableCorsMiddleWare();
        this.enableJsonParserMiddleWare();
        this.enableValidationMiddleware();
    }

    enableCorsMiddleWare(){
        const corsOptions = {
            allowedHeaders: ['Content-Type', 'Authorization', 'Location', 'X-Total-Count'],
            exposedHeaders: ['Content-Type', 'Authorization', 'Location', 'X-Total-Count'],
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
