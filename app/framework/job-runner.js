const logger = require('./logger');
const JobManager = require('../modules/job/managers/job-manager');

class JobRunner {
    constructor(configuration) {
        this.configuration = configuration;
        logger.info('Initializing job runner.');
        this.jobManager = new JobManager(configuration);
    }

    async start() {
        logger.info('Starting job runner.');
        if (this.jobManager === null || this.jobManager == undefined) return;

        await this.jobManager.start();
    }
}

module.exports = JobRunner;
