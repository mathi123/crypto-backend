const request = require('supertest');
const ContextController = require('../../controllers/context-controller');
const AuthenticationController = require('../../controllers/authentication-controller');
const expect = require('chai').expect;
const Server = require('../../../../framework/server');
const Bootstrapper = require('../../../../framework/bootstrapper');
const sinon = require('sinon');

describe('GET /api/context', () => {
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

    describe('/role', () => {
        it('calls context controllers getRoles', async () => {
            spy = sinon.spy(ContextController.prototype, 'getRoles');

            let result = await request(app)
                .get('/api/context/role')
                .send();

            expect(spy.calledOnce).to.equal(true);
        });
    });

    describe('/permission', () => {
        it('calls context controllers getPermissions', async () => {
            spy = sinon.spy(ContextController.prototype, 'getPermissions');

            await request(app)
                .get('/api/context/permission')
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
