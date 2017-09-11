const bcrypt = require('bcrypt');
const AuthenticationController = require('../../controllers/authentication-controller');
const sinon = require('sinon');
const should = require('should')();
const expect = require('chai').expect;
const models = require('../../models/index');
const OrmInitializer = require('../../../../framework/orm-initializer');

describe('authentication controller', () => {
    let authController;
    let userFindOneStub;
    let bcryptCompareStub;
    let testData = {
        email: 'dummy',
        password: 'dummy'
    };

    beforeEach('stub User models and bcrypt', function () {
        authController = new AuthenticationController();
        userFindOneStub = sinon.stub();
        models.User = {
            findOne: userFindOneStub
        };

        bcryptCompareStub = sinon.stub(bcrypt, 'compare');
        bcrypt.compare = bcryptCompareStub;
    });

    describe('authentication process', () => {
        it('should return status codes 204 when credentials are valid', async () => {
            // Arrange
            const req = {
                body: testData
            };
            const res = {
                sendStatus: sinon.spy(),
                header: sinon.spy()
            };
            userFindOneStub.returns(Promise.resolve(testData));
            bcryptCompareStub.returns(Promise.resolve(true));

            // Act
            await authController.authenticate(req, res);

            // Assert
            res.sendStatus.calledOnce.should.be.true;
            res.sendStatus.firstCall.args[0].should.equal(204);
        });

        it('should return token in headers when credentials are valid', async () => {
            // Arrange
            const req = {
              body: {
                  email: 'dummy',
                  password: 'dummy'
              }
            };
            const res = {
                sendStatus: sinon.spy(),
                header: sinon.spy()
            };
            userFindOneStub.returns(Promise.resolve(testData));
            bcryptCompareStub.returns(Promise.resolve(true));

            // Act
            await authController.authenticate(req, res);

            // Assert
            res.header.calledOnce.should.be.true;
            res.header.firstCall.args[0].should.equal('Authorization');
            res.header.firstCall.args[1].should.not.be.empty;
        });

        it('should return authentication failed status code when credentials are unvalid', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'dummy',
                    password: 'dummy'
                }
            };
            const res = {
                sendStatus: sinon.spy(),
                header: sinon.spy()
            };
            userFindOneStub.returns(Promise.resolve(testData));
            bcryptCompareStub.returns(Promise.resolve(false));

            // Act
            await authController.authenticate(req, res);

            // Assert
            res.sendStatus.calledOnce.should.be.true;
            res.sendStatus.firstCall.args[0].should.equal(401);
        });

        it('should return authentication failed when user does not exist', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'dummy',
                    password: 'dummy'
                }
            };
            const res = {
                sendStatus: sinon.spy()
            };
            userFindOneStub.returns(Promise.resolve(null));

            // Act
            await authController.authenticate(req, res);

            // Assert
            res.sendStatus.calledOnce.should.be.true;
            res.sendStatus.firstCall.args[0].should.equal(401);
        });

        it('should throw error when no credentials are passed', async () => {
            // Arrange
            const req = {};

            // Act
            try{
                await authController.authenticate(req, res);

                // Assert
                should.fail();
            }catch(ex){
                expect(ex).not.to.equal(null);
                expect(ex).not.to.equal(undefined);
            }
        });

        it('should rethrow upon internal error', async () => {
            // Arrange
            const req = {
                body: {
                    email: 'dummy',
                    password: 'dummy'
                }
            };

            userFindOneStub.throws();

            // Act
            try{
                await authController.authenticate(req, res);

                // Assert
                should.fail();
            }catch(ex){
                expect(ex).not.to.equal(null);
                expect(ex).not.to.equal(undefined);
            }
        });

    });

    describe('returned token', () => {
        it('should be valid', async() => {
            // Arrange
            const user = {
                id: 'test guid'
            };
            const req = {
                body: {
                    email: 'dummy',
                    password: 'dummy'
                }
            };
            const res = {
                sendStatus: sinon.spy(),
                header: sinon.spy()
            };

            bcryptCompareStub.returns(Promise.resolve(true));
            userFindOneStub.returns(Promise.resolve(user));

            // Act
            await authController.authenticate(req, res);
            let header = res.header.firstCall.args[1];
            let token = header.substr(7);

            // Assert
            authController.verifyToken(token);
        });

        it('should contain userId', async() => {
            // Arrange
            const user = {
                id: 'test guid'
            };
            const req = {
                body: {
                    email: 'dummy',
                    password: 'dummy'
                }
            };
            const res = {
                sendStatus: sinon.spy(),
                header: sinon.spy()
            };

            bcryptCompareStub.returns(Promise.resolve(true));
            userFindOneStub.returns(Promise.resolve(user));

            // Act
            await authController.authenticate(req, res);
            let header = res.header.firstCall.args[1];
            let token = header.substr(7);
            let userId = authController.getUserIdFromToken(token);

            // Assert
            userId.should.equal(user.id);
        });
    });

    afterEach('restore stubs', function () {
        bcryptCompareStub.restore();
    });
});