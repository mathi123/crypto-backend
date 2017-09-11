const request = require('supertest');
const PermissionController = require('../../controllers/permission-controller');
const AuthenticationController = require('../../controllers/authentication-controller');
const expect = require('chai').expect;
const Server = require('../../../../framework/server');
const Bootstrapper = require('../../../../framework/bootstrapper');
const sinon = require('sinon');
const uuid = require('uuid/v4');

describe('GET /api/permission', () => {
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
        it('calls permission controllers getAllPermission', async () => {
            spy = sinon.spy(PermissionController.prototype, 'getAllPermission');

            let result = await request(app)
                .get('/api/permission')
                .send();

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/GET/:id', () => {
        it('calls permission controllers getPermissionById', async () => {
            spy = sinon.spy(PermissionController.prototype, 'getPermissionById');

            let result = await request(app)
                .get(`/api/permission/${ uuid() }`)
                .send();

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/POST', () => {
        it('calls permission controllers createPermission', async () => {
            spy = sinon.spy(PermissionController.prototype, 'createPermission');

            // TODO create some relevant test data
            let data = {};

            let result = await request(app)
                .post('/api/permission')
                .send(data);

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/PUT/:id', () => {
        it('calls permission controllers updatePermission', async () => {
            spy = sinon.spy(PermissionController.prototype, 'updatePermission');

            // TODO create some relevant test data
            let data = {};

            let result = await request(app)
                .put(`/api/permission/${ uuid() }`)
                .send(data);

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/DELETE/:id', () => {
        it('calls permission controllers deletePermission', async () => {
            spy = sinon.spy(PermissionController.prototype, 'deletePermission');

            // TODO create some relevant test data
            let data = {};

            let result = await request(app)
                .delete(`/api/permission/${ uuid() }`)
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
