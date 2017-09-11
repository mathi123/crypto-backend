const request = require('supertest');
const RoleController = require('../../controllers/role-controller');
const AuthenticationController = require('../../controllers/authentication-controller');
const expect = require('chai').expect;
const Server = require('../../../../framework/server');
const Bootstrapper = require('../../../../framework/bootstrapper');
const sinon = require('sinon');
const uuid = require('uuid/v4');

describe('GET /api/role', () => {
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
        it('calls role controllers getAllRole', async () => {
            spy = sinon.spy(RoleController.prototype, 'getAllRole');

            let result = await request(app)
                .get('/api/role')
                .send();

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/GET/:id', () => {
        it('calls role controllers getRoleById', async () => {
            spy = sinon.spy(RoleController.prototype, 'getRoleById');

            let result = await request(app)
                .get(`/api/role/${ uuid() }`)
                .send();

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/POST', () => {
        it('calls role controllers createRole', async () => {
            spy = sinon.spy(RoleController.prototype, 'createRole');

            // TODO create some relevant test data
            let data = {};

            let result = await request(app)
                .post('/api/role')
                .send(data);

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/PUT/:id', () => {
        it('calls role controllers updateRole', async () => {
            spy = sinon.spy(RoleController.prototype, 'updateRole');

            // TODO create some relevant test data
            let data = {};

            let result = await request(app)
                .put(`/api/role/${ uuid() }`)
                .send(data);

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/DELETE/:id', () => {
        it('calls role controllers deleteRole', async () => {
            spy = sinon.spy(RoleController.prototype, 'deleteRole');

            // TODO create some relevant test data
            let data = {};

            let result = await request(app)
                .delete(`/api/role/${ uuid() }`)
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
