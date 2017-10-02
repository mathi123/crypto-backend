const uuid = require('uuid/v4');
const HttpStatus = require('http-status-codes');
const request = require('request');
const CryptoCompareApi = require('../apis/cryptocompare');
const BlockCypherApi = require('../apis/blockcypher');
const EtherScanIoApi = require('../apis/etherscan.io');

class CoinController{
    constructor(routePrefix){
        this.routePrefix = routePrefix;
        this.cryptoCompareApi = new CryptoCompareApi();
        this.transactionProviders = {
            btc: new BlockCypherApi('btc'),
            ltc: new BlockCypherApi('ltc'),
            doge: new BlockCypherApi('doge'),
            eth: new EtherScanIoApi(),
        }
    }

    buildAuthenticatedRoutes(app){
        app.get(`/${this.routePrefix}/price`, (req, res, next) => this.getPrices(req, res).catch(next));
        app.get(`/${this.routePrefix}/coin/:currency/:address`, (req, res, next) => this.getTransactions(req, res).catch(next));
    }

    async getPrices(req, res){    
        const maxReq = 50;
        const currencies = req.query['currency'].toUpperCase().split(',');       
        const fromDate = new Date(parseInt(req.query['fromDate']));
        const toDate = new Date(parseInt(req.query['toDate']));
        const includes = req.query['include'].split(',').map(t => parseInt(t));

        if(toDate < fromDate){
            throw new Error('toDate < fromDate');
        }

        let prices = await this.cryptoCompareApi.getPrices(fromDate, toDate, currencies, maxReq, includes);
        res.json(prices);
    }

    async getTransactions(req, res){    
        req.checkParams('currency', 'Currency').notEmpty();
        req.checkParams('address', 'address').notEmpty();

        const currency = req.params['currency'].toLowerCase();
        const address = req.params['address'];

        let provider = this.transactionProviders[currency];

        if(provider === null || provider === undefined){
            throw new Error("No transaction provider found for " + currency);
        }

        let transactions = await provider.getTransactions(address);

        res.json(transactions);
    }

    
}

module.exports = CoinController;
