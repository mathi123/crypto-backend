const ContextController = require('../../controllers/context-controller');
const expect = require('chai').expect;
const models = require('../../models/index');
const sinon = require('sinon');

describe('context controller', () => {
    let contexController, req, res;

    beforeEach(() => {
        contexController = new ContextController('api');
        req = {
            userId: 1
        };
        res = {
            json: sinon.stub()
        };
    });

    describe('getRoles', () => {
        let findAllRolesStub;

        beforeEach(() => {
            // Arrange
            findAllRolesStub = sinon.stub();
            models.Role = {
                findAll: findAllRolesStub
            };

            findAllRolesStub.returns([{ id: '', code: 'test', description: 'test' }]);
        });

        it('should query the database for roles', async () => {
            // Act
            await contexController.getRoles(req, res);

            // Assert
            expect(findAllRolesStub.calledOnce).to.be.true;
        });
       it('returns currently logged user roles as json', async () => {
            // Act
           await contexController.getRoles(req, res);

           // Assert
           expect(res.json.calledOnce).to.be.true;
           expect(res.json.firstCall.args[0]).to.be.an.array;
       });
   });

   describe('getPermissions', () => {
       let roleFindAllStub, permissionFindAllStub;

       beforeEach(() => {
           // Arrange
           roleFindAllStub = sinon.stub();
           models.Role = {
               findAll: roleFindAllStub
           };
           roleFindAllStub.returns([{ id: 123 }, { id: 345}]);

           permissionFindAllStub = sinon.stub();
           models.Permission = {
               findAll: permissionFindAllStub
           };

           permissionFindAllStub.returns([{ id: '2', code: 'test', description: 'test' }]);
       });

       it('should query for the users roles, and the permissions of that role after', async () => {
           // Act
           await contexController.getPermissions(req, res);

           // Assert
           expect(roleFindAllStub.calledOnce).to.be.true;
           expect(permissionFindAllStub.calledOnce).to.be.true;
       });

       it('returns currently logged user permissions as json', async () => {
            // Act
           await contexController.getPermissions(req, res);

           // Assert
           expect(res.json.calledOnce).to.be.true;
           expect(res.json.firstCall.args[0]).to.be.an.array;
       });
   });
});