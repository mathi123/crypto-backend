
const jwt = require('jsonwebtoken');
const secretKey = 'KJ2kjJK32LKJA\'/.SD[]';

class SocketManager{
    constructor(){
        this.sockets = [];
    }

    initialize(io){
        io.on('connection', (socket) => this.socketConnected(socket));
    }

    socketConnected(socket){
        let token = socket.handshake.query.token;

        if(!this.verifyToken(token)){
            console.log(`Invalid token, disconnecting socket.`);
            socket.disconnect(true);
        }else{
            let payload = this.getTokenPayload(token);
            this.addSocket(socket, payload.sub);
        }
        // socket.emit('news', { hello: 'world' });
        // socket.on('my other event', function (data) {
        //   console.log(data);
        // });
    }

    emitForUserId(userId, event, payload){
        console.log(`emitting for user ${userId} users: ${event}: ${JSON.stringify(payload)}.`)
        for(let socket of this.sockets){
            if(socket.userId === userId){
                this.emit(socket.socket, event, payload);
            }
        }
    }

    emitForAll(event, payload){
        console.log(`emitting for all users: ${event}: ${JSON.stringify(payload)}.`)
        for(let socket of this.sockets){
            this.emit(socket.socket, event, payload);
        }
    }

    emit(socket, event, payload){
        console.log(`emitting event ${event}`);
        socket.emit(event, payload);
    }
    
    addSocket(socket, userId){
        console.log("user connected: " +  userId);
        this.sockets.push({
            userId: userId,
            socket: socket
        });
    }

    verifyToken(token) {
        return jwt.verify(token, secretKey);
    }

    getTokenPayload(token) {
        return jwt.decode(token, secretKey);
    }

}

module.exports = SocketManager;