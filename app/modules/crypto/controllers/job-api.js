const logger = require('../../../framework/logger');
const theInternet = require('request-promise-native');
const UserManager = require('../../core/managers/user-manager');
const AuthenticationManager = require('../../core/managers/authentication-manager');

class JobApi{
    constructor(configuration){
        this.configuration = configuration;
        this.userManager = new UserManager();
        this.authenticationManager = new AuthenticationManager(configuration);
    }

    async setDone(userId, jobId){
        const url = `${this.configuration.jobApi}/api/job/${jobId}`;
        logger.verbose(url);

        const options = {
            uri: url,
            json: true,
            method: 'DELETE',
            headers: {
                'Authorization': await this.getToken(userId),
            },
        };

        try{
            await theInternet(options);
        }catch(err){
            logger.warn(`Could not perform DELETE ${url}`, err);
            throw err;
        }
    }

    async getToken(userId){
        const user = await this.userManager.getById(userId);
        const token = await this.authenticationManager.getBearerHeader(user);
        return token;
    }
}

module.exports = JobApi;
