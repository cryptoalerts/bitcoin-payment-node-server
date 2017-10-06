#!/usr/bin/env bash

docker build -t bitcoin-payment-node-server .
docker tag bitcoin-payment-node-server jverhoelen/bitcoin-payment-node-server
docker push jverhoelen/bitcoin-payment-node-server
