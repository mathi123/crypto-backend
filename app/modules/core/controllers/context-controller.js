const models = require('../models');
const cryptoModels = require('../../crypto/models');

class ContextController{
    constructor(configuration){
        this.routePrefix = `/${configuration.routePrefix}/context`;
    }

    buildAuthenticatedRoutes(app) {
        app.get(this.routePrefix, (req, res, next) => this.getContext(req, res).catch(next));
    }

    async getContext(req, res) {
        const userId = req.userId;

        const user = await models.User.findOne({
            where: {
                id: userId,
            },
            include: [
                {
                    model: cryptoModels.Currency,
                },
            ],
        });
console.log(JSON.stringify(user));
        res.json(this.mapUser(user));
    }

    mapUser(user){
        const result = {
            id: user.id,
            name: user.name,
            email: user.email,
            currencyCode: user.Currency.code,
            currencyId: user.Currency.id,
            currencyDescription: user.Currency.description,
            currencySymbol: user.Currency.symbol,
        };

        if(user.isAdmin){
            result.isAdmin = true;
        }

        return result;
    }
}

module.exports = ContextController;
