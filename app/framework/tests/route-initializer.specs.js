const expect = require('chai').expect;
const sinon = require('sinon');
const RouteInitializer = require('../route-intializer');
const FakeController = require('./fake-module/controllers/fake-controller');
const path = require('path');

describe('RouteInitializer', () => {
    let routeInitializer;
    let applicationMock;
    let routePrefix = 'api';

    beforeEach(() => {
        applicationMock = sinon.mock();
        routeInitializer = new RouteInitializer(applicationMock, routePrefix);
    });

    describe('fileFilter', ()=>{

        it('accepts files ending with -controller.js', () => {
            expect(routeInitializer.fileFilter('../modules/controllers', 'test-controller.js')).to.be.true;
        });
        it('rejects files not ending on -controller.js', () => {
            expect(routeInitializer.fileFilter('../modules/controllers', 'testcontroller.js')).to.be.false;
            expect(routeInitializer.fileFilter('../modules/controllers', 'test-controllr.js')).to.be.false;
            expect(routeInitializer.fileFilter('../modules/controllers', 'controller-helpers.js')).to.be.false;
        });
    });

    describe('buildRoutes', () => {
        let fakeControllerBuildRoutesSpy, controllerDirPath;

        beforeEach(() => {
            fakeControllerBuildRoutesSpy = sinon.spy(FakeController.prototype, 'buildRoutes');
            controllerDirPath = path.join(__dirname, 'fake-module', 'controllers');
        });

       it('calls constructor on models with route prefix', () => {
           // Act
           const controller = routeInitializer.buildRoutes(controllerDirPath, 'fake-controller.js');

           // Assert
           expect(controller.routePrefix).to.equal(routePrefix);
       });

       it('calls buildFallbackRoute on controller instances', () => {
           // Act
           routeInitializer.buildRoutes(controllerDirPath, 'fake-controller.js');

           // Assert
           expect(fakeControllerBuildRoutesSpy.calledOnce).to.be.true;
           expect(fakeControllerBuildRoutesSpy.getCall(0).args[0]).to.equal(applicationMock);
       });

       afterEach(() => {
           fakeControllerBuildRoutesSpy.restore();
       });
    });
});
