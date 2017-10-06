const WebSocket = require('ws'),
    websocketCommands = require('./websocketCommands'),
    moment = require('moment')

const PING_PONG_INTERVAL_SECS = 20,
    PING_PONG_REPLY_TOLERANCE = 1.05,
    ACCEPTED_SECONDS = PING_PONG_INTERVAL_SECS * PING_PONG_REPLY_TOLERANCE

const isActiveClient = (ws, acceptedSeconds) => {
    return ws.lastPing && ws.lastPing.add(acceptedSeconds, 'seconds') >= moment()
}

module.exports = {
    start: (httpServer) => {
        let webSocketServer = new WebSocket.Server({ server: httpServer, clientTracking: true })

        webSocketServer.on('connection', (wsClient, req) => {
            wsClient.lastPing = moment()
            wsClient.on('pong', (binaryMessage) => {
                // let message = binaryMessage.toString('ascii')
                this.lastPing = moment()
                websocketCommands.checkPaymentStatus(wsClient)
            })

            wsClient.on('message', (rawMessage) => {
                websocketCommands.onMessage(rawMessage, wsClient)
            });

            wsClient.on('close', () => {
                websocketCommands.beforeTerminateClient(wsClient)
            });
        });

        setInterval(() => {
            webSocketServer.clients.forEach((wsClient) => {
                let shouldTerminateClient = !isActiveClient(wsClient, ACCEPTED_SECONDS)

                if (shouldTerminateClient) {
                    websocketCommands.beforeTerminateClient(wsClient)
                    return wsClient.terminate();
                }

                wsClient.ping('', false, true);
            });
        }, 1000 * PING_PONG_INTERVAL_SECS);

        return webSocketServer
    }
};
