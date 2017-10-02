const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcrypt');

class UserController{
    constructor(routePrefix){
        this.routePrefix = routePrefix;
    }

    buildRoutes(app){
        var createUserRoute = `/${this.routePrefix}/user`;
        console.info("building user route:" + createUserRoute);
        app.post(createUserRoute, (req, res, next) => this.createUser(req, res).catch(next));
        return [createUserRoute];
    }

    buildAuthenticatedRoutes(app) {
        app.get(`/${this.routePrefix}/user`, (req, res, next) => this.getAllUsers(req, res).catch(next));
        app.get(`/${this.routePrefix}/user/:id`, (req, res, next) => this.getUserById(req, res).catch(next));
        app.delete(`/${this.routePrefix}/user/:id`, (req, res, next) => this.deleteUser(req, res).catch(next));
        app.put(`/${this.routePrefix}/user/:id`, (req, res, next) => this.updateUser(req, res).catch(next));
    }

    async getAllUsers(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const users = await models.User.all();

        res.json(users.map(u => this.userExporter(u)));
    }

    async getUserById(req, res) {
        const id = req.params.id;

        if(!req.isAdmin && req.userId !== id){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const user = await models.User.findOne({ id });

        if(user === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            res.json(this.userExporter(user));
        }
    }

    async updateUser(req, res) {
        const id = req.params.id;
        if(req.userId !== id){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const userData = req.body;
        const user = await models.User.findOne({ id });

        if(user === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            // update user
            const values = {
                name : userData.name,
                email: userData.email,
            };

            await models.User.update(values, { where: { id }, fields: ['name', 'email'] });

            res.location(`/${this.routePrefix}/user/${ id }`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    async createUser(req, res) {
        console.info("creating a user.");
        const userData = req.body;

        const user = {
            id: uuid(),
            name: userData.name,
            email: userData.email,
            password: await bcrypt.hash(userData.password, 10),
        };

        await models.User.create(user);
      
        res.location(`/${this.routePrefix}/user/${ user.id }`);
        res.sendStatus(HttpStatus.CREATED);
    }

    async deleteUser(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return; 
        }

        const id = req.params.id;

        await models.User.destroy({ id });

        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    userExporter(user) {
        return {
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            _links : {
                self: `/${this.routePrefix}/user/${ user.id }`,
            }
        };
    }
}

module.exports = UserController;