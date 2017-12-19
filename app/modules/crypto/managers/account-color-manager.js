const logger = require('../../../framework/logger');
const models = require('../models');

class AccountColorManager{
    getAllColors(){
        return [
            { name: 'Purple', code: '#ab47bc' },
            { name: 'Green', code: '#0e7530' },
            { name: 'Red', code: '#ef5350' },
            { name: 'Indigo', code: '#5c6bc0' },
            { name: 'Blue', code: '#29b6f6' },
            { name: 'Jungle Green', code: '#26a69a' },
            { name: 'Yellow', code: '#ffee58' },
            { name: 'Orange', code: '#ff7043' },
        ];
    }

    async getNextColor(userId){
        logger.verbose(`getting a new color for user ${userId}`);
        const accountsCount = await models.Account.count({
            where: {
                userId,
            },
        });
        const colors = this.getAllColors();
        const index = accountsCount % colors.length;
        return colors[index];
    }
}

module.exports = AccountColorManager;
