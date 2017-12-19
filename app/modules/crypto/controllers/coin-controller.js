const logger = require('../../../framework/logger');
const uuid = require('uuid/v4');
const models = require('../models');
const HttpStatus = require('http-status-codes');
const JobRunner = require('../../../framework/job-runner');
const Logger = require('../managers/logger');
const sequelize = require('sequelize');
const CoinManager = require('../managers/coin-manager');
const JobApi = require('./job-api');

class CoinController{
    constructor(configuration){
        this.apiPrefix = configuration.routePrefix;
        this.routePrefix = `/${this.apiPrefix}/coin`;
        this.logger = new Logger();
        this.coinManager = new CoinManager(configuration);
        this.jobManager = new JobApi(configuration);
    }

    buildAuthenticatedRoutes(app) {
        app.get(this.routePrefix, (req, res, next) => this.getAll(req, res).catch(next));
        app.get(`${this.routePrefix }/:id`, (req, res, next) => this.getById(req, res).catch(next));
        app.delete(`${this.routePrefix }/:id`, (req, res, next) => this.remove(req, res).catch(next));
        app.post(`${this.routePrefix }/:id/import-erc20`, (req, res, next) => this.importErc20Coin(req, res).catch(next));
        app.post(`${this.routePrefix }/blockchain/synchronize`, (req, res, next) => this.syncAllChains(req, res).catch(next));
        app.post(`${this.routePrefix }`, (req, res, next) => this.create(req, res).catch(next));
        app.post(`${this.routePrefix }/import-erc20`, (req, res, next) => this.importErc20(req, res).catch(next));
        app.put(`${this.routePrefix }/:id`, (req, res, next) => this.update(req, res).catch(next));
        app.put(`${this.routePrefix }/:id/image`, (req, res, next) => this.updateImage(req, res).catch(next));
    }

    async syncAllChains(req, res){
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        res.sendStatus(HttpStatus.ACCEPTED);

        try{
            await this.coinManager.synchronizeCoins();
        }catch(err){
            logger.error('could sync chains', err);
        }

        const jobId = req.query.jobId;
        if(jobId !== undefined && jobId != null){
            logger.verbose(`calling done on job ${jobId}`);
            await this.jobManager.setDone(req.userId, jobId);
        }else{
            logger.verbose('no jobId passed in query params');
        }
    }

    async importErc20Coin(req, res){
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const id = req.params.id;
        const record = await models.Coin.findOne({
            where: {
                id: id,
            },
        });

        if(record === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            try{
                let jobId = await JobRunner.Current.jobManager.publish('ImportErc20CoinJob', { coinId: id});
                await this.logger.verbose("ImportErc20CoinJob job published", jobId);
                res.sendStatus(HttpStatus.OK);
            }catch(err){
                await this.logger.error("could not publish job of type ImportErc20CoinJob", err);
                res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }

    async importErc20(req, res){
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        try{
            let id = await JobRunner.Current.jobManager.publish('SynchronizeErc20CoinsJob', {});
            await this.logger.verbose("SynchronizeErc20CoinsJob job published", id);
            res.sendStatus(HttpStatus.OK);
        }catch(err){
            await this.logger.error("could not publish job of type SynchronizeErc20CoinsJob", err);
            res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAll(req, res) {
        const records = await models.Coin.findAll({
            attributes: ['id',
                'code',
                'description',
                'isActive',
                'coinType',
                'baseAddress',
                'decimals',
                'state',
                'firstBlockSynchronized',
                'lastBlockSynchronized',
                'createdAt',
                'updatedAt',
                'fileId',
                [sequelize.fn('COUNT', sequelize.col('Erc20Transactions.coinId')), 'transactionCount'],
            ],
            include: [{
                model:models.Erc20Transaction,
                attributes: [],
                duplicating: false,
                required: false,
            },
            ],
            group: ['Coin.id'],
        });

        res.json(records.map(u => this.exporter(u, req.isAdmin)));
    }

    async getById(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const id = req.params.id;
        const record = await models.Coin.findOne({
            where: {
                id,
            },
        });

        if(record === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            res.json(this.exporter(record, req.isAdmin));
        }
    }

    async update(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const id = req.params.id;
        const data = req.body;
        const record = await models.Coin.findOne({
            where: {
                id,
            },
        });

        if(record === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            const values = {
                code: data.code,
                description: data.description,
                isActive: data.isActive,
                coinType: data.coinType,
                baseAddress: data.baseAddress,
                decimals: data.decimals,
            };

            const options = {
                where: { id },
                fields: ['code', 'description', 'isActive', 'coinType', 'baseAddress', 'decimals'],
            };

            await models.Coin.update(values, options);

            res.location(`/${this.routePrefix}/${ id }`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    async updateImage(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const id = req.params.id;
        const data = req.body.data;
        const coin = await models.Coin.findOne({
            where: {
                id: id,
            },
        });

        if(coin === null){
            res.sendStatus(HttpStatus.NOT_FOUND);
        }else{
            if(coin.fileId === null || coin.fileId === undefined){
                coin.fileId = uuid();
                await models.File.create({
                    id: coin.fileId,
                    data: data,
                });
                await coin.update({
                    fileId: coin.fileId,
                }, {
                    where: {
                        id: coin.id,
                    },
                });
            }else{
                await models.File.update({
                    data: data,
                }, {
                    where: {
                        id: coin.fileId,
                    },
                });
            }

            res.location(`/${this.routePrefix}/${ id }`);
            res.sendStatus(HttpStatus.NO_CONTENT);
        }
    }

    async create(req, res) {
        const data = req.body;

        const coin = {
            id: uuid(),
            code: data.code,
            description: data.description,
            isActive: data.isActive,
            coinType: data.coinType,
            baseAddress: data.baseAddress,
            decimals: data.decimals,
        };

        await models.Coin.create(coin);

        res.location(`${this.routePrefix}/${ coin.id }`);
        res.sendStatus(HttpStatus.CREATED);
    }

    async remove(req, res) {
        if(!req.isAdmin){
            res.sendStatus(HttpStatus.UNAUTHORIZED);
            return;
        }

        const id = req.params.id;

        await models.Coin.destroy({
            where: {
                id: id,
            },
        });

        res.sendStatus(HttpStatus.NO_CONTENT);
    }

    exporter(record, isAdmin) {
        let result = {
            id: record.id,
            code: record.code,
            description: record.description,
            fileId: record.fileId,
            _links: {},
        };

        if(record.fileId !== null){
            result._links.image = `/${this.apiPrefix}/file/${record.fileId}`;
        }

        if(isAdmin){
            result.isActive = record.isActive;
            result.coinType = record.coinType;
            result.baseAddress = record.baseAddress;
            result.decimals = record.decimals;
            result.state = record.state;
            result.firstBlockSynchronized = record.firstBlockSynchronized;
            result.lastBlockSynchronized = record.lastBlockSynchronized;
            result.transactionCount = record.transactionCount;
            result.createdAt = record.createdAt;
            result.updatedAt = record.updatedAt;
            result._links.self = `${this.routePrefix}/${ record.id }`;
        }

        return result;
    }
}

module.exports = CoinController;