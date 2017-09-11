const models = require('../models');

class ContextController{
    constructor(routePrefix){
        this.routePrefix = routePrefix;
    }

    buildRoutes(app) {
        app.get(`/${this.routePrefix}/context/role`, (req, res, next) => this.getRoles(req, res).catch(next));
        app.get(`/${this.routePrefix}/context/permission`, (req, res, next) => this.getPermissions(req, res).catch(next));
    }

    async getRoles(req, res) {
        const userId = req.userId;
        const options = {
            include: [{
                model: models.UserRole,
                where: { userId },
            }],
        };

        const roles = await models.Role.findAll(options);

        res.json(roles.map((role) => {
            return {
                id: role.id,
                code: role.code,
                description: role.description,
            };
        }));
    }

    async getPermissions(req, res) {
        const userId = req.userId;

        const roleIds = await models.Role.findAll({
            include: [{
                model: models.UserRole,
                where: { userId },
            }],
            attributes: ['id'],
        });

        const options = {
            include: [{
                model: models.RolePermission,
                where: {
                    roleId: {
                        $in: roleIds.map(id => id.id),
                    },
                },
            }],
        };

        const permissions = await models.Permission.findAll(options);

        res.json(permissions.map((permission) => {
            return {
                id: permission.id,
                code: permission.code,
                description: permission.description,
            };
        }));

    }
}

module.exports = ContextController;
