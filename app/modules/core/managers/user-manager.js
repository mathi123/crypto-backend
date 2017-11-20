const logger = require('../../../framework/logger');
const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');
const models = require('../models');

class UserManager{
    async getById(id){
        const user = await models.User.findOne({
            where: {
                id,
            },
        });
        return user;
    }

    async getByEmail(email){
        const user = await models.User.findOne({
            where: {
                email,
            },
        });
        return user;
    }

    async createUser(userData, isAdmin){
        logger.verbose(`creating user with email ${userData.email}`);

        const user = {
            id: uuid(),
            name: userData.name,
            email: userData.email,
            password: await this.hashPassword(userData.password),
            currencyId: userData.currencyId,
        };
        if(isAdmin === true){
            user.isAdmin = true;
        }

        await models.User.create(user);

        return user;
    }

    async getByEmailOrCreate(email, isAdmin){
        let user = await this.getByEmail(email);
        if(user === null){
            user = await this.createUser({
                name: email,
                email,
                password: uuid(),
                currencyId: '8e57e443-e8a0-42a9-a625-19ee90447130',
            }, isAdmin);
        }
        return user;
    }

    async hashPassword(password){
        return await bcrypt.hash(password, 10);
    }
}

module.exports = UserManager;
