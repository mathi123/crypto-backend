const expect = require('chai').expect;
const sinon = require('sinon');
const ConfigurationLoader = require('../configuration-loader');
const Bootstrapper = require('../bootstrapper');
const OrmInitializer = require('../orm-initializer');
const Server = require('../server');
const fs = require('fs');

describe('Bootstrapper', () => {
    let bootstrapper, configurationLoadStub;
    let stubs = [];
    const ormConfig = {
        test: 'test',
    };

    beforeEach('setup', () => {
        // Arrange
        bootstrapper = new Bootstrapper();
    });

    it('loads the configuration file', async () => {
        // Assert
        configurationLoadStub = sinon.stub(ConfigurationLoader.prototype, 'load');
        configurationLoadStub.returns({ configKey: 'test', orm: ormConfig , modules: [ 'core' ] });

        // Act
        try{
            await bootstrapper.run();
        }catch(err){}

        // Assert
        expect(configurationLoadStub.calledOnce).to.be.true;

        const configFilePath = configurationLoadStub.firstCall.args[0];
        expect(fs.existsSync(configFilePath)).to.be.true;
    });

    it('builds a server instance', async () => {
        // Act
        let server = await bootstrapper.run({ runMigrationsOnStartUp: false });

        // Assert
        expect(server).to.be.instanceOf(Server);
    });

    afterEach('clean up', () => {
        if(configurationLoadStub !== undefined) {
            configurationLoadStub.restore();
        }
        stubs.forEach((stub) => stub.restore());
    });
});
