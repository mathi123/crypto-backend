const expect = require('chai').expect;
const sinon = require('sinon');
const path = require('path');
const ConfigurationLoader = require('../configuration-loader');

describe('ConfigurationLoader', () => {
    it('should load the correct file', () => {
        // Arrange
        const configurationLoader = new ConfigurationLoader();

        // Act
        const pathToLoad = path.join(__dirname, 'resources', 'test-configuration.json');
        const configuration = configurationLoader.load(pathToLoad);

        // Assert
        expect(configuration.port).to.equal(3002);
    });

    it('should apply overrides', () => {
        // Arrange
        const configurationLoader = new ConfigurationLoader();

        // Act
        const pathToLoad = path.join(__dirname, 'resources', 'test-configuration.json');
        const configuration = configurationLoader.load(pathToLoad, { runMigrationsOnStartUp: "test"});

        // Assert
        expect(configuration.runMigrationsOnStartUp).to.equal("test");
    });
});
