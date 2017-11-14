const AccountSummaryManager = require('../managers/account-summary-manager');

class AccountSummaryController{
    constructor(configuration){
        this.routePrefix = `/${configuration.routePrefix}/account-summary`;
        this.manager = new AccountSummaryManager(configuration);
    }

    buildAuthenticatedRoutes(app) {
        app.get(this.routePrefix, (req, res, next) => this.getAll(req, res).catch(next));
    }

    async getAll(req, res) {
        const records = await this.manager.getUserAccounts(req.userId);

        res.json(records.map(u => this.exporter(u)));
    }

    exporter(record) {
        const result = {
            id: record.id,
            coin: {
                id: record.coinId,
                description: record.Coin.description,
                code: record.Coin.code,
                fileId: record.Coin.fileId,
            },
            description: record.description,
            color: record.color,
            address: record.address,
            note: record.note,
            transactionType: record.transactionType,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            _links : {
                self: `${this.routePrefix}/${ record.id }`,
            },
        };

        return result;
    }
}

module.exports = AccountSummaryController;
