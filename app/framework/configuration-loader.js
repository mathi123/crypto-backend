const fs = require('fs');

class ConfigurationLoader{
    load(configurationFilePath, configurationOverrides){
        const fileContent = fs.readFileSync(configurationFilePath);
        const configuration = JSON.parse(fileContent);

        if(configurationOverrides !== undefined){
            this.applyConfigurationOverrides(configuration, configurationOverrides);
        }
        return configuration;
    }

    applyConfigurationOverrides(configuration, configurationOverrides) {
        if(configurationOverrides === null) return;

        Object.keys(configurationOverrides)
            .forEach((key) => {
                configuration[key] = configurationOverrides[key];
            });
    }
}

module.exports = ConfigurationLoader;
