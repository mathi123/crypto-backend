const uuid = require('uuid/v4');
const HttpStatus = require('http-status-codes');
const request = require('request');

class PricesController{
    constructor(routePrefix){
        this.routePrefix = routePrefix;
    }

    buildRoutes(app){
        app.get(`/${this.routePrefix}/coins/:currency/transactions/:address`, (req, res, next) => this.getTransactions(req, res).catch(next));
        app.get(`/${this.routePrefix}/coins/:currency/price`, (req, res, next) => this.getPrices(req, res).catch(next));
        
        /*app.get(`/${this.routePrefix}/unit/:id`, (req, res, next) => this.getUnitById(req, res).catch(next));
        app.post(`/${this.routePrefix}/unit`, (req, res, next) => this.createUnit(req, res).catch(next));
        app.put(`/${this.routePrefix}/unit/:id`, (req, res, next) => this.updateUnit(req, res).catch(next));
        app.delete(`/${this.routePrefix}/unit/:id`, (req, res, next) => this.deleteUnit(req, res).catch(next));*/
    }

    async getPrices(req, res){    
        req.checkParams('currency', 'Currency').notEmpty();
        
        //req.checkQueryParams('fromDate', 'fromDate').notEmpty();
        const maxReq = 50;
        const currency = req.params['currency'].toUpperCase();
        const fromDate = new Date(parseInt(req.query['fromDate']));
        const toDate = new Date(parseInt(req.query['toDate']));

        if(toDate < fromDate){
            throw new Error('toDate < fromDate');
        }

        let totalDiffMs = toDate - fromDate;
        let daysInDiff = totalDiffMs / (24 * 60 * 60 * 1000);
        let requests = Math.min(maxReq, daysInDiff);
        let step = Math.ceil(totalDiffMs / requests);

        var results = [];

        for(var i = 0;i<requests;i++)
        {
            let d = new Date(fromDate.getTime() + i * step);
            let ts = d.getTime();        
            let url = `https://min-api.cryptocompare.com/data/pricehistorical?fsym=${currency}&tsyms=EUR&ts=${ts}&extraParams=tstapp`;
            console.log(url);
        
            request(url, (error, response, body) => {
                const data = JSON.parse(body);

                    var rec = {};
                    rec.ts = ts;
                    rec.price = data[currency]['EUR'];
                    results.push(rec);

                    if(results.length === requests){
                        res.json(results);
                    }
                });
        }
    
        /*request(url, (error, response, body) => {
            const data = JSON.parse(body);
            const transactions = data.txs.map(t => {return {
                id: t.tx_index,
                time: t.time,
            }});
            res.json(transactions);
            });*/
    }

    async getTransactions(req, res){    
        req.checkParams('currency', 'Currency').notEmpty();
        req.checkParams('address', 'address').notEmpty();

        const currency = req.params['currency'].toLowerCase();
        const address = req.params['address'];

        if(currency === "btc"){
            const url = `https://blockchain.info/rawaddr/${address}`;
                    
            request(url, (error, response, body) => {
                const data = JSON.parse(body);
                const transactions = data.txs.map(t => {return {
                    id: t.tx_index,
                    time: t.time,
                }});
                res.json(transactions);
                });
        }
        else if(currency === "eth"){
            const apiKey = "1GDDAY45D73RIY89C3EAY9QDVT7MSKB21E";
            const url = `http://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${apiKey}`;
            
            request(url, (error, response, body) => {
                const data = JSON.parse(body);
                console.log(data.result);
                console.log(address);

                const transactions = data.result.map(t => {return {
                    id: t.transactionIndex,
                    time: t.timeStamp,
                    from: t.from,
                    to: t.to,
                    value: (t.to === address.toLowerCase() ? 1 : -1) * t.value / Math.pow(10, 18),
                }});
                console.log(transactions);
                res.json(transactions);
            });
        }else{
            res.json([]);
        }
    }
/*
    async getUnitById(req, res){
        const id = req.params.id;

        const unit = await models.Unit.findOne({ where: { id } });

        if (unit === null) {
            res.sendStatus(HttpStatus.NOT_FOUND);
        } else {
            res.json(this.mapToUnitDto(unit));
        }
    }

    async createUnit(req, res){
        req.checkBody('code', 'Invalid code').notEmpty();
        req.checkBody('description', 'Invalid description').notEmpty();
        req.checkBody('isBaseUnit', 'Invalid isBaseUnit').notEmpty().isBoolean();
        req.checkBody('conversionToBaseUnit', 'Invalid conversionToBaseUnit').notEmpty().isNumeric();

        const data = {
            id: uuid(),
            code: req.body.code,
            description: req.body.description,
            isBaseUnit: req.body.isBaseUnit,
            conversionToBaseUnit: req.body.conversionToBaseUnit,
        };

        await models.Unit.create(data);

        res.location(`/${this.routePrefix}/unit/${data.id}`);
        res.sendStatus(HttpStatus.CREATED);
    }

    async updateUnit(req, res){
        req.checkParams('id', 'Inalid id').notEmpty().isUUID();
        req.checkBody('code', 'Invalid code').notEmpty();
        req.checkBody('description', 'Invalid description').notEmpty();
        req.checkBody('isBaseUnit', 'Invalid isBaseUnit').notEmpty().isBoolean();
        req.checkBody('conversionToBaseUnit', 'Invalid conversionToBaseUnit').notEmpty().isNumeric();

        const id = req.params.id;
        const unit = await models.Unit.findById(id);

        if (unit === null) {
            res.sendStatus(HttpStatus.NOT_FOUND);
        } else {
            const data = {
                code: req.body.code,
                description: req.body.description,
                isBaseUnit: req.body.isBaseUnit,
                conversionToBaseUnit: req.body.conversionToBaseUnit,
            };

            await models.Unit.update(data, {
                where: {
                    id,
                }, fields: ['description', 'isBaseUnit', 'conversionToBaseUnit', 'code'],
            });

            res.location(`/${this.routePrefix}/unit/${id}`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    async deleteUnit(req, res){
        req.checkParams('id', 'Inalid id').notEmpty().isUUID();
        const id = req.params.id;

        const unit = models.Unit.findById(id);

        if (unit !== null) {
            await models.Unit.destroy({ where: { id } });
        }

        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    mapToUnitDto(unit) {
        const result = {};

        result.id = unit.id;
        result.code = unit.code;
        result.description = unit.description;
        result.isBaseUnit = unit.isBaseUnit;
        result.conversionToBaseUnit = unit.conversionToBaseUnit;

        result._links = {
            self: `/${this.routePrefix}/unit/${ result.id }`,
        };

        return result;
    }*/
}

module.exports = PricesController;
