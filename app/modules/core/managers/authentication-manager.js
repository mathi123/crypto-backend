const jwt = require('jsonwebtoken');

class AuthenticationManager{
    constructor(configuration){
        this.secret = configuration.secret;
    }
    async getBearerHeader(user) {
        const payload = this.buildTokenPayload(user);
        const token = await jwt.sign(payload, this.secret);
        return this.buildBearerHeaderContent(token);
    }

    buildTokenPayload(user) {
        return {
            sub: user.id,
            adm: user.isAdmin,
        };
    }

    buildBearerHeaderContent(token) {
        return `Bearer ${token}`;
    }

    verifyToken(token) {
        return jwt.verify(token, this.secret);
    }

    getTokenPayload(token) {
        return jwt.decode(token, this.secret);
    }
}

module.exports = AuthenticationManager;
