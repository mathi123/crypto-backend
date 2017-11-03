const logger = require('./framework/logger');
const Bootstrapper = require('./framework/bootstrapper');

const bootstrapper = new Bootstrapper();
bootstrapper.run()
    .then((server) => server.start())
    .catch((err) => logger.error(err));
