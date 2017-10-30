const models = require('../models');
const Logger = require('./logger');

class JobProgressManager{

    constructor(){
        this.logger = new Logger();    
    }

    async start(jobId, jobName, jobArgs){
        const job = {
            id: jobId,
            name: jobName,
            args: JSON.stringify(jobArgs),
            startTime: new Date(),
            progress: 0,
            state: 'running'
        }

        return await models.Job.create(job);
    }

    async updateProgress(jobId, progress){
        const rounded = Math.round(progress);

        await models.Job.update({
            progress: rounded
        }, {
            fields: ['progress'],
            where: {
                id: jobId
            }
        });

        await this.logVerbose(jobId, `Progress update: ${progress} %...`)
    }

    async setDone(jobId){       
        await models.Job.update({
            state: 'done',
            progress: 100,
            endTime: new Date(),
        }, {
            fields: ['state', 'progress', 'endTime'],
            where: {
                id: jobId
            }
        });
    }

    async setFailed(jobId){
        await models.Job.update({
            state: 'failed',
            endTime: new Date(),
        }, {
            fields: ['state', 'endTime'],
            where: {
                id: jobId
            }
        });
    }

    async logVerbose(jobId, message){
        await this.logger.verbose(message, null, { jobId: jobId });
    }

    async logInfo(jobId, message){
        await this.logger.info(message, null, { jobId: jobId });
    }

    async logWarning(jobId, message){
        await this.logger.warning(message, null, { jobId: jobId });
    }

    async logError(jobId, message, error){
        await this.logger.error(message, error, { jobId: jobId });
    }
}

module.exports = JobProgressManager;