#!/usr/bin/env bash

./dockerize.sh
docker tag bitcoin-payment-node-server jverhoelen/bitcoin-payment-node-server
docker push jverhoelen/bitcoin-payment-node-server
