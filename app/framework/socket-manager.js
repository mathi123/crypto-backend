const logger = require('./logger');
const jwt = require('jsonwebtoken');

class SocketManager{
    constructor(configuration){
        this.configuration = configuration;
        this.sockets = [];
    }

    initialize(io){
        io.on('connection', (socket) => this.socketConnected(socket));
    }

    socketConnected(socket){
        const token = socket.handshake.query.token;

        if(!this.verifyToken(token)){
            logger.info('Invalid token, disconnecting socket.');
            socket.disconnect(true);
        }else{
            const payload = this.getTokenPayload(token);
            this.addSocket(socket, payload.sub);
        }
        // socket.emit('news', { hello: 'world' });
        // socket.on('my other event', function (data) {
        //   console.log(data);
        // });
    }

    emitForUserId(userId, event, payload){
        logger.info(`emitting for user ${userId} users: ${event}: ${JSON.stringify(payload)}.`);
        for(const socket of this.sockets){
            if(socket.userId === userId){
                this.emit(socket.socket, event, payload);
            }
        }
    }

    emitForAll(event, payload){
        logger.info(`emitting for all users: ${event}: ${JSON.stringify(payload)}.`);
        for(const socket of this.sockets){
            this.emit(socket.socket, event, payload);
        }
    }

    emit(socket, event, payload){
        logger.info(`emitting event ${event}`);
        socket.emit(event, payload);
    }

    addSocket(socket, userId){
        logger.info(`user connected: ${userId}`);
        this.sockets.push({
            userId,
            socket,
        });
    }

    verifyToken(token) {
        return jwt.verify(token, this.configuration.secret);
    }

    getTokenPayload(token) {
        return jwt.decode(token, this.configuration.secret);
    }
}

module.exports = SocketManager;
