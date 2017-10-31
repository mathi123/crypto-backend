const models = require('../models');
const coreModels = require('../../core/models');

class AdminManager{

    async getStatistics(){
        let result = {};
        let now = new Date();
        let lastWeek = new Date(now.getTime() - 1000*60*60*24*7);
        let yesterday = new Date(now.getTime() - 1000*60*60*24);

        result.user = {
            count: await this.getUserCount(),
            week: await this.getNewUsersCount(lastWeek),
            day: await this.getNewUsersCount(yesterday)
        };

        result.log = {
            count: await this.getLogs(),
            week: await this.getNewLogs(lastWeek),
            day: await this.getNewLogs(yesterday) 
        };

        result.job = {
            done: {
                count: await this.getJobs(null, 'done'),
                week: await this.getJobs(lastWeek, 'done'),
                day: await this.getJobs(yesterday, 'done')
            },
            failed:{
                count: await this.getJobs(null, 'failed'),
                week: await this.getJobs(lastWeek, 'failed'),
                day: await this.getJobs(yesterday, 'failed')
            } 
        };

        result.ethereum = {
            last: await this.getLastEthereumBlock(),
            week: await this.getNewEthereumBlockCount(lastWeek),
            day: await this.getNewEthereumBlockCount(yesterday)
        };

        return result;
    }

    async getUserCount(){
        return await coreModels.User.count();
    }

    async getNewUsersCount(date){
        return await coreModels.User.count({
            where: {
                createdAt: {
                    ['gt']: date
                }
            }
        });
    }
    
    async getLastEthereumBlock(){
        return await models.EthereumBlock.max('id');
    }

    async getNewEthereumBlockCount(date){
        return await models.EthereumBlock.count({
            where: {
                createdAt: {
                    ['gt']: date
                }
            }
        });
    }

    async getLogs(){
        return await models.Log.count();
    }

    async getNewLogs(date){
        return await models.Log.count({
            where: {
                createdAt: {
                    ['gt']: date
                }
            }
        });
    }

    async getJobs(date, state){
        let where = {
            state: state
        };

        if(date !== null){
            where.createdAt = {
                ['gt']: date
            };
        }

        return await models.Job.count({
            where: where    
        });
    }
}

module.exports = AdminManager;