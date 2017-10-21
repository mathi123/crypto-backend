const models = require('../models');
const secretKey = 'KJ2kjJK32LKJA\'/.SD[]';
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthenticationController{
    constructor(routePrefix){
        this.routePrefix = routePrefix;
        this.tokenRoute = `/${this.routePrefix}/token`;
    }

    buildRoutes(app){
        app.post(this.tokenRoute, (req, res, next) => this.authenticate(req, res).catch(next));
        return [this.tokenRoute];
    }

    buildAuthenticationRoutes(app, publicRoutes) {
        console.info("building authentication route");
        this.publicRoutes = publicRoutes;
        app.use((req, res, next) => this.checkAuthenticationToken(req, res, next).catch(next));
    }

    async checkAuthenticationToken(req, res, next) {
        //console.info("checking authentication.");
        if(this.publicRoutes.indexOf(this.trimRoute(req.url)) === -1){
            let tokenHeader = req.get('authorization');

            /*if(tokenHeader === null || tokenHeader === undefined){
                tokenHeader = req.query.token;
            }*/

            if (tokenHeader === null || tokenHeader === undefined) {
                console.info("no token present");
                res.sendStatus(HttpStatus.UNAUTHORIZED);
            } else {
                //console.info("token present");
                const token = tokenHeader.substr(tokenHeader.indexOf(' ') + 1);
                const valid = await this.verifyToken(token);
    
                if (valid) {
                    let payload = this.getTokenPayload(token);
                    //console.info("token payload: "+JSON.stringify(payload));

                    req.userId = payload.sub;
                    req.isAdmin = payload.adm;
    
                    next();
                } else {
                    res.sendStatus(HttpStatus.UNAUTHORIZED);
                }
            }
        }else{
            next();
        }        
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
                const bearerHeader = await this.getBearerHeader(user);

                res.header('Authorization', bearerHeader);
                res.sendStatus(HttpStatus.NO_CONTENT);
            }
        }
    }

    async getBearerHeader(user){
        const payload = this.buildTokenPayload(user);
        const token = await jwt.sign(payload, secretKey);
        return this.buildBearerHeaderContent(token);
    }

    buildTokenPayload(user){
        return {
            sub: user.id,
            adm: user.isAdmin
        };
    }

    buildBearerHeaderContent(token){
        return `Bearer ${token}`;
    }

    verifyToken(token) {
        return jwt.verify(token, secretKey);
    }

    getTokenPayload(token) {
        return jwt.decode(token, secretKey);
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
