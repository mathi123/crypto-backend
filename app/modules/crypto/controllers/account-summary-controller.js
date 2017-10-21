const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');

const AccountSummaryManager = require("../managers/account-summary-manager");
 
class AccountSummaryController{
    constructor(routePrefix){
        this.routePrefix = `/${routePrefix}/account-summary`;
        this.manager = new AccountSummaryManager();
    }

    buildAuthenticatedRoutes(app) {
        app.get(this.routePrefix, (req, res, next) => this.getAll(req, res).catch(next));
    }

    async getAll(req, res) {
        const records = await this.manager.getUserAccounts(req.userId);

        res.json(records.map(u => this.exporter(u)));
    }

    exporter(record) {
        let result = {
            id: record.id,
            coinId: record.coinId,
            description: record.description,
            color: record.color,
            address: record.address,
            note: record.note,
            transactionType: record.transactionType,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            _links : {
                self: `${this.routePrefix}/${ record.id }`,
            }
        };

        return result;
    }
}

module.exports = AccountSummaryController;