const models = require('../models');
const uuid = require('uuid/v4');

class Logger{

    async verbose(message, data, options = {}){
        return await this.log('verbose', message, data, options.userId, options.jobId);
    }

    async info(message, data, options = {}){
        return await this.log('info', message, data, options.userId, options.jobId);
    }

    async warning(message, data, options = {}){
        return await this.log('warning', message, data, options.userId, options.jobId);
    }

    async error(message, data, options = {}){
        return await this.log('error', message, data, options.userId, options.jobId);
    }

    async log(type, message, data, userId, jobId){
        if(data instanceof Error){
            data = data.toString();
        }

        const log = {
            id: uuid(),
            type: type,
            log: message,
            data: JSON.stringify(data),
            userId: userId,
            jobId: jobId
        };

        return await models.Log.create(log);
    }
}

module.exports = Logger;