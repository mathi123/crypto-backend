const JobManager = require('pg-boss');
const SynchronizeErc20CoinsJob = require('../modules/crypto/jobs/synchronize-erc20-coin-jobs');
const ImportErc20CoinJob = require('../modules/crypto/jobs/import-erc20-coin-job');
const RefreshPricesJob = require('../modules/crypto/jobs/refresh-prices-job');
const RefreshAccountSummaryJob = require('../modules/crypto/jobs/refresh-account-summary-job');
const ImportEthereumBlocksJob = require('../modules/crypto/jobs/import-ethereum-blocks-job');

class JobRunner {
    initialize(configuration) {
        this.configuration = configuration;

        const options = {
            host: configuration.orm.host,
            database: configuration.orm.database,
            user: configuration.orm.username,
            password: configuration.orm.password,
        };

        try {
            this.jobManager = new JobManager(options);
        }
        catch (error) {
            console.error('could not create job runner');
            console.error(error);
        }

    }

    start() {
        if (this.jobManager === null || this.jobManager == undefined) return;

        this.jobManager.start()
            .then((runner) => this.queueJobs())
            .error((err) => console.error('could not start job runner'));
    }

    queueJobs() {
        const syncCoin = new SynchronizeErc20CoinsJob();
        const importJob = new ImportErc20CoinJob(this.configuration);
        const refreshPricesJob = new RefreshPricesJob(this.configuration);
        const refreshAcccountSummaryJog = new RefreshAccountSummaryJob(this.configuration);
        const importEthereumBlocksJob = new ImportEthereumBlocksJob(this.configuration);

        syncCoin.subscribe(this.jobManager);
        importJob.subscribe(this.jobManager);
        refreshPricesJob.subscribe(this.jobManager);
        refreshAcccountSummaryJog.subscribe(this.jobManager);
        importEthereumBlocksJob.subscribe(this.jobManager);

        syncCoin.enqueue(this.jobManager);
        importJob.enqueue(this.jobManager);
        refreshPricesJob.enqueue(this.jobManager);
        importEthereumBlocksJob.enqueue(this.jobManager);
    }

}

module.exports = JobRunner;
