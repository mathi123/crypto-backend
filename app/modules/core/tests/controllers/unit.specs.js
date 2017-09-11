const request = require('supertest');
const UnitController = require('../../controllers/unit-controller');
const AuthenticationController = require('../../controllers/authentication-controller');
const expect = require('chai').expect;
const Server = require('../../../../framework/server');
const Bootstrapper = require('../../../../framework/bootstrapper');
const sinon = require('sinon');
const uuid = require('uuid/v4');

describe('GET /api/unit', () => {
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
        it('calls unit controllers getAllUnit', async () => {
            spy = sinon.spy(UnitController.prototype, 'getAllUnit');

            let result = await request(app)
                .get('/api/unit')
                .send();

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/GET/:id', () => {
        it('calls unit controllers getUnitById', async () => {
            spy = sinon.spy(UnitController.prototype, 'getUnitById');

            let result = await request(app)
                .get(`/api/unit/${ uuid() }`)
                .send();

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/POST', () => {
        it('calls unit controllers createUnit', async () => {
            spy = sinon.spy(UnitController.prototype, 'createUnit');

            // TODO create some relevant test data
            let data = {};

            let result = await request(app)
                .post('/api/unit')
                .send(data);

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/PUT/:id', () => {
        it('calls unit controllers updateUnit', async () => {
            spy = sinon.spy(UnitController.prototype, 'updateUnit');

            // TODO create some relevant test data
            let data = {};

            let result = await request(app)
                .put(`/api/unit/${ uuid() }`)
                .send(data);

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/DELETE/:id', () => {
        it('calls unit controllers deleteUnit', async () => {
            spy = sinon.spy(UnitController.prototype, 'deleteUnit');

            // TODO create some relevant test data
            let data = {};

            let result = await request(app)
                .delete(`/api/unit/${ uuid() }`)
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
