const
    fs = require('fs'),
    adminServer = require('./src/adminServer'),
    bitcoinPaymentWebsocket = require('./src/bitcoinPaymentWebsocket'),
    express = require('express'),
    http = require('http')

const
    APP_PORT = 3002,
    ADMIN_INTERFACE_PORT = APP_PORT - 1

const App = {

    start: (port) => {
        const app = express();
        App.server = app;
        const server = http.createServer(app);

        App.setupFeatures();
        App.mountBitcoinPaymentWebsocket(server);

        server.listen(port, () => {
            console.info(`Wrapper server starting on port ${port}...`);
        });

        let adminServerConfig = adminServer.buildConfig(ADMIN_INTERFACE_PORT, APP_PORT, {});
        adminServer.start(adminServerConfig);
    },

    setupFeatures: () => {
        App.server.use(require('compression')());
        App.server.enable('trust proxy');
    },

    mountBitcoinPaymentWebsocket: (server) => {
        App.wss = bitcoinPaymentWebsocket.start(server);
    }
};

App.start(APP_PORT);
