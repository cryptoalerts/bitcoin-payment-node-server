const bitcoin = require('bitcoinjs-lib'),
    request = require('superagent'),
    bitcoinPrice = require('./bitcoinPrice'),
    moment = require('moment')

const CURRENT_EURO_PRICE = 40

let connectionCache = {}

const quitOnError = (ws) => {
    api.beforeTerminateClient(ws);
    ws.terminate();
}

const api = {
    onMessage: (rawMessage, ws) => {
        let command = { type: undefined }
        try {
            command = JSON.parse(rawMessage);
            switch (command.type) {
                case 'start':
                    startPaymentProcess(ws)
                    break
                case 'checkStatus':
                    checkPaymentStatus(ws)
                    break
                case 'restore':
                    tryPaymentRestore(ws, command)
                    break
                default:
                    quitOnError(ws)
            }
        } catch (e) {
            quitOnError(ws)
        }
    },

    beforeTerminateClient: (ws) => {
        let clientsPaymentInfo = ws.payment

        if (clientsPaymentInfo && !ws.paymentFinished) {
            addCachedPayment(clientsPaymentInfo.publicKey, clientsPaymentInfo)
            console.log(`Client with payment info ${clientsPaymentInfo.publicKey} terminates`)
        } else {
            console.log(`Client terminated. ${ws.paymentFinished ? 'Finished payment' : 'Payment was not finished'}`)
            if (clientsPaymentInfo) {
                delete connectionCache[clientsPaymentInfo.publicKey]
            }
        }
    },

    addCachedPayment: (publicKey, payment) => {
        payment.time = moment()
        connectionCache[publicKey] = payment
    },

    checkPaymentStatus: (ws) => {
        if (ws.payment) {
            let address = ws.payment.publicKey

            request
                .get(`https://blockchain.info/rawaddr/${address}?limit=0`)
                .end((err, res) => {
                    if (err) {
                        ws.send(JSON.stringify({ error: 'notAvailable' }))
                        return
                    }

                    // received in satoshis, divide by 100 million to get to btc
                    let finalBalanceInBtc = res.body.final_balance / 100000000,
                        requestedBalance = ws.payment.requestedBtcAmount

                    if (finalBalanceInBtc >= requestedBalance) {
                        console.log(`Balance of ${finalBalanceInBtc} BTC was detected, requested was: ${requestedBalance}. Successful payment!`)
                        ws.paymentFinished = true
                        ws.send(JSON.stringify({ status: 'sufficient', balance: finalBalanceInBtc }))
                    } else {
                        console.log(`Balance is only ${finalBalanceInBtc} which is not sufficient for ${address}`)
                        ws.send(JSON.stringify({ status: 'notSufficient' }))
                    }
                })
        } else {
            ws.send(JSON.stringify({ status: 'paymentNotStarted' }))
        }
    }
};

const startPaymentProcess = (ws) => {
    let keyPair = bitcoin.ECPair.makeRandom(),
        publicKey = keyPair.getAddress(),
        privateKey = keyPair.toWIF(),
        requestedBtcAmount = bitcoinPrice.getCurrentPrice(CURRENT_EURO_PRICE)

    console.log(`Opening funding address to request ${requestedBtcAmount} BTC...\nPublic: ${publicKey}\nPrivate: ${privateKey}`)

    ws.payment = { publicKey, privateKey, requestedBtcAmount };

    ws.send(JSON.stringify({ publicKey, requestedBtcAmount }))
};

const tryPaymentRestore = (ws, command) => {
    if (!command.previousPublicKey) return

    let prevPubKey = command.previousPublicKey,
        lookup = connectionCache[prevPubKey]

    if (lookup) {
        ws.payment = {
            publicKey: lookup.publicKey,
            privateKey: lookup.privateKey,
            requestedBtcAmount: lookup.requestedBtcAmount
        }

        console.log(`Payment tracking of ${lookup.publicKey} has been restored from connection cache`)
        ws.send(JSON.stringify({ publicKey: lookup.publicKey, requestedBtcAmount: lookup.requestedBtcAmount }))
    } else {
        ws.send(JSON.stringify({ error: 'notFound' }))
    }
};

module.exports = api