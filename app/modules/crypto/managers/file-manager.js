const models = require('../models');

class FileManager{

    async getById(id){
        return await models.File.findOne({
            where: { 
                id: id
            }
        });
    }

    
}

module.exports = FileManager;