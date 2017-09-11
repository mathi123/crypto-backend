const models = require('../models');
const secretKey = 'KJ2kjJK32LKJA\'/.SD[]';
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthenticationController{
    constructor(routePrefix){
        this.routePrefix = routePrefix;
    }

    buildRoutes(app) {
        app.use((req, res, next) => this.checkAuthenticationToken(req, res, next).catch(next));
        app.post(`/${this.routePrefix}/token`, (req, res, next) => this.authenticate(req, res).catch(next));
    }

    async checkAuthenticationToken(req, res, next) {
        next();
        return;

        /*if (this.trimRoute(req.url) !== `/${this.routePrefix}/token`) {
            const tokenHeader = req.get('authorization');
            if (tokenHeader === null || tokenHeader === undefined) {
                res.sendStatus(HttpStatus.UNAUTHORIZED);
            } else {
                const token = tokenHeader.substr(tokenHeader.indexOf(' ') + 1);

                const valid = await this.verifyToken(token);

                if (valid) {
                    req.userId = this.getUserIdFromToken(token);

                    next();
                } else {
                    res.sendStatus(HttpStatus.UNAUTHORIZED);
                }
            }
        } else {
            next();
        }*/
    }

    async authenticate(req, res) {
        const credentials = req.body;

        if (credentials === null || credentials === undefined ||
            credentials.password === null || credentials.password === undefined) {
            throw new Error('Invalid credentials');
        }

        const user = await models.User.findOne({ where: { email: credentials.email } });

        if (user === null) {
            res.sendStatus(HttpStatus.UNAUTHORIZED);
        } else {
            const isValid = await bcrypt.compare(credentials.password, user.password);

            if (!isValid) {
                res.sendStatus(HttpStatus.UNAUTHORIZED);
            } else {
                const bearerHeader = await this.getBearerHeader(user.id);

                res.header('Authorization', bearerHeader);
                res.sendStatus(HttpStatus.NO_CONTENT);
            }
        }
    }

    async getBearerHeader(userId){
        const payload = this.buildTokenPayload(userId);
        const token = await jwt.sign(payload, secretKey);
        return this.buildBearerHeaderContent(token);
    }

    buildTokenPayload(userId){
        return {
            sub: userId,
        };
    }

    buildBearerHeaderContent(token){
        return `Bearer ${token}`;
    }

    verifyToken(token) {
        return jwt.verify(token, secretKey);
    }

    getUserIdFromToken(token) {
        return jwt.decode(token, secretKey).sub;
    }

    trimRoute(route){
        return this.trimEnd(route, '/');
    }

    trimEnd(text, character) {
        while (text.endsWith(character)) {
            text = text.slice(0, -1);
        }
        return text;
    }
}

module.exports = AuthenticationController;
