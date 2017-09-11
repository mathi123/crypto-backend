const Bootstrapper = require('./framework/bootstrapper');

const bootstrapper = new Bootstrapper();
bootstrapper.run().then((server) => server.start());
