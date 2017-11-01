const expect = require('chai').expect;
const sinon = require('sinon');
const ConfigurationLoader = require('../configuration-loader');
const Bootstrapper = require('../bootstrapper');
const Server = require('../server');
const fs = require('fs');

describe.skip('Bootstrapper', () => {
    let bootstrapper, configurationLoadStub;
    const stubs = [];
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
        configurationLoadStub.returns({ configKey: 'test', orm: ormConfig, modules: [ 'core' ] });

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
        const server = await bootstrapper.run({ runMigrationsOnStartUp: false });

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
