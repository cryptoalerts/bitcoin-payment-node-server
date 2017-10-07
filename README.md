## bitcoin-payment-node-server

Implementation of a simple NodeJS/Express server that enables payment via Bitcoin. It launches a light websocket server with that client applications can interact easily.
For every started payment process, the Bitcoin payment address will be a new one. The operator of this server will be in charge of public and private key of these addresses via the logs.

### Getting started

Currently this is not designed in a plug & play way. You'd need to fork or clone the repository to customize it.


#### Dev environment

1. Clone or fork the repository
2. Make adjustments to the code as needed (e.g. `CURRENT_EURO_PRICE` for the price of the product or service to pay or `currentBtcEuroPrice` for current BTC/EUR)
3. `nvm use` - use the npm version from `.nvmrc`
4. `npm install` - install the dependencies
5. `npm run start` - to start the server locally on port 3002
6. Tests can be executed with `npm run test`, of course also if the server is stopped

Besides the main server, an admin server runs on port 3001.

#### Running with Docker

1. `chmod +x ./build.sh && chmod +x ./dockerize.sh`
2. `./build.sh && ./dockerize.sh` - Install dependencies and build docker image from `Dockerfile`
3. `docker run -p 3002:3002 -p 3001:3001 bitcoin-payment-node-server` - Run the locally created docker image


### Future development

Let's see.