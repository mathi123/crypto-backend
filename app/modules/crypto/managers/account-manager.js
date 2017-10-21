const models = require('../models');

class AccountManager{
    async getUserAccounts(userId){
        return await models.Account.all({
            where: { 
                userId: userId
            }
        });
    }

    async getById(id, userId){
        return await models.Account.findOne({
            where: { 
                id: id,
                userId: userId
            }
        });
    }

    validate(coinId, address){
        return true;
    }
}

module.exports = AccountManager;