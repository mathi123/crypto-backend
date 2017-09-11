const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcrypt');

class UserController{
    constructor(routePrefix){
        this.routePrefix = routePrefix;
    }

    buildRoutes(app) {
        app.get(`/${this.prefix}/user`, (req, res, next) => this.getAllUsers.catch(next));
        app.get(`/${this.prefix}/user/:id`, (req, res, next) => this.getUserById.catch(next));
        app.delete(`/${this.prefix}/user/:id`, (req, res, next) => this.deleteUser.catch(next));
        app.post(`/${this.prefix}/user`, (req, res, next) => this.createUser.catch(next));
        app.put(`/${this.prefix}/user/:id`, (req, res, next) => this.updateUser.catch(next));
    }

    async getAllUsers(req, res) {
        const users = await models.User.all();

        res.json(users.map(this.userExporter));
    }

    async getUserById(req, res) {
        const id = req.params.id;

        const user = await models.User.findOne({ id });

        if(user === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            res.json(this.userExporter(user));
        }
    }

    async updateUser(req, res) {
        const id = req.params.id;
        const userData = req.body;
        const user = await models.User.findOne({ id });

        if(user === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            // update user
            const values = {
                fullName : userData.fullName,
                email: userData.email,
            };

            await models.User.update(values, { where: { id }, fields: ['fullName', 'email'] });

            res.location(`/${this.routePrefix}/user/${ id }`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    async createUser(req, res) {
        const userData = req.body;

        const user = {
            id: uuid(),
            fullName: userData.fullName,
            email: userData.email,
            password: await bcrypt.hash(userData.password, 10),
        };

        await models.User.create(user);

        res.location(`/${this.routePrefix}/user/${ user.id }`);
        res.sendStatus(HttpStatus.CREATED);
    }

    async deleteUser(req, res) {
        const id = req.params.id;

        await models.User.destroy({ id });

        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    userExporter(user) {
        user._links = {
            self: `/${this.routePrefix}/user/${ user.id }`,
        };

        return user;
    }
}

module.exports = UserController;
