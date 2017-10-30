const models = require('../models');

class ContextController{
    constructor(routePrefix){
        this.routePrefix = `/${routePrefix}/context`;
    }

    buildAuthenticatedRoutes(app) {
        app.get(this.routePrefix, (req, res, next) => this.getContext(req, res).catch(next));
    }

    async getContext(req, res) {
        const userId = req.userId;

        const user = await models.User.findOne({
            where: {
                id: userId
            }
        });

        res.json(this.mapUser(user));
    }

    mapUser(user){
        let result = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        if(user.isAdmin){
            result.isAdmin = true;
        }

        return result;
    }
}

module.exports = ContextController;