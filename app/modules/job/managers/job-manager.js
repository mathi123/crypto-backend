const logger = require('../../../framework/logger');
const UserManager = require('../../core/managers/user-manager');
const AuthenticationManager = require('../../core/managers/authentication-manager');
var kue = require('kue');

class JobManager{
    constructor(configuration){
        this.configuration = configuration;
        this.jobManagerEmail = configuration.jobManagerEmail;
        this.userManager = new UserManager();
        this.authenticationManager = new AuthenticationManager(configuration);
    }

    async start(){
        logger.info('starting job manager');

        JobManager.queue = kue.createQueue({
            redis: this.configuration.redis,
        });

        await this.queueRecurrentJobs();
    }

    async queueRecurrentJobs(){
        logger.info('queing recurrent jobs');
    }

    async getToken(){
        const user = await this.userManager.getByEmailOrCreate(this.jobManagerEmail);
        const token = await this.authenticationManager.getBearerHeader(user);
        return token;
    }
}

module.exports = JobManager;
