const path = require('path'),
    fs = require('fs'),
    adminServer = require('./src/adminServer'),
    bitcoinPaymentWebsocket = require('./src/bitcoinPaymentWebsocket'),
    express = require('express'),
    url = require('url'),
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
        App.serveStaticFrontend();
        App.mountBackendProxies();
        App.mountRequests();
        App.mountBitcoinPaymentWebsocket(server);

        App.server.get('*', function (request, response) {
            response.sendFile(path.resolve(__dirname, 'frontend', 'index.html'))
        });

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

    serveStaticFrontend: () => {
        App.server.use(express.static('frontend/build'));
    },

    mountBackendProxies: () => {
    },

    mountRequests: () => {
    },

    mountBitcoinPaymentWebsocket: (server) => {
        App.wss = bitcoinPaymentWebsocket.start(server);
    }
};

App.start(APP_PORT);
