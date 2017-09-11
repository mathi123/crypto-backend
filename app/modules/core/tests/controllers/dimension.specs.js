const request = require('supertest');
const DimensionController = require('../../controllers/dimension-controller');
const AuthenticationController = require('../../controllers/authentication-controller');
const expect = require('chai').expect;
const Server = require('../../../../framework/server');
const Bootstrapper = require('../../../../framework/bootstrapper');
const sinon = require('sinon');
const uuid = require('uuid/v4');

describe('GET /api/dimension', () => {
    let app, server, spy, authStub;

    beforeEach('setup app', async () => {
        authStub = sinon.stub(AuthenticationController.prototype, 'checkAuthenticationToken');
        authStub.callsFake(async (req, res, next) => {
            req.userId = 1;
            next();
        });

        server = await (new Bootstrapper({ runMigrationsOnStartUp: false })).run();
        server.start();
        app = server.getApp();
    });

    describe('/GET', () => {
        it('calls dimension controllers getAllDimension', async () => {
            spy = sinon.spy(DimensionController.prototype, 'getAllDimension');

            let result = await request(app)
                .get('/api/dimension')
                .send();

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/GET/:id', () => {
        it('calls dimension controllers getDimensionById', async () => {
            spy = sinon.spy(DimensionController.prototype, 'getDimensionById');

            let result = await request(app)
                .get(`/api/dimension/${ uuid() }`)
                .send();

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/POST', () => {
        it('calls dimension controllers createDimension', async () => {
            spy = sinon.spy(DimensionController.prototype, 'createDimension');

            // TODO create some relevant test data
            let data = {};

            let result = await request(app)
                .post('/api/dimension')
                .send(data);

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/PUT/:id', () => {
        it('calls dimension controllers updateDimension', async () => {
            spy = sinon.spy(DimensionController.prototype, 'updateDimension');

            // TODO create some relevant test data
            let data = {};

            let result = await request(app)
                .put(`/api/dimension/${ uuid() }`)
                .send(data);

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/DELETE/:id', () => {
        it('calls dimension controllers deleteDimension', async () => {
            spy = sinon.spy(DimensionController.prototype, 'deleteDimension');

            // TODO create some relevant test data
            let data = {};

            let result = await request(app)
                .delete(`/api/dimension/${ uuid() }`)
                .send();

            expect(spy.calledOnce).to.equal(true);
        });
    });

    afterEach(()=>{
        server.stop();
        authStub.restore();

        if(spy){
            spy.restore();
        }
    })
});
