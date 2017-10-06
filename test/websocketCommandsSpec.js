const websocketCommands = require('../src/websocketCommands'),
    chai = require('chai'),
    nock = require('nock'),
    sinon = require('sinon'),
    assert = chai.assert

chai.should()
chai.use(require('sinon-chai'))

const createRawMessage = (type, params = {}) => JSON.stringify(Object.assign(params, { type }))

let ws

describe('be able to execute the correct commands', () => {

    beforeEach(() => {
        ws = {
            terminate: sinon.spy(),
            send: sinon.spy(),
            payment: undefined,
            paymentFinished: false
        }
    })

    afterEach(() => {
    })

    it('terminates on parsing error', () => {
        websocketCommands.onMessage('...', ws)
        assert(ws.terminate.calledOnce)
    })

    it('terminates on another parsing error', () => {
        const testMsg = createRawMessage('someSillyType', { param: 1 })

        websocketCommands.onMessage(testMsg, ws)
        assert(ws.terminate.calledOnce)
    })

    it('starts a new payment session', () => {
        websocketCommands.onMessage(createRawMessage('start'), ws)

        assert(ws.payment.requestedBtcAmount, 0.01)
        assert(ws.send.calledOnce)
    })

    it('looks up the correct payment status and responds to that', () => {
        let publicKey = '123123123'

        nock(`https://blockchain.info`)
            .get(`/rawaddr/${publicKey}?limit=0`)
            .reply(200, {
                final_balance: 300000000
            });

        ws.payment = { privateKey: 'does not matter', publicKey, requestedBtcAmount: 1 }
        ws.paymentFinished = false

        websocketCommands.onMessage(createRawMessage('checkStatus'), ws)

        assert(nock.isDone())
        // assert(ws.paymentFinished)
    })

    it('not restore payment if not present', () => {
        websocketCommands.onMessage(createRawMessage('restore', { previousPublicKey: '123123' }), ws)

        assert(ws.send.calledOnce)
    })

    it('restore valid payment history from cache', () => {
        websocketCommands.addCachedPayment('123', { publicKey: '123', privateKey: 'abc', requestedBtcAmount: 1 })
        websocketCommands.onMessage(createRawMessage('restore', { previousPublicKey: '123' }), ws)

        assert(ws.payment.publicKey, '123')
        assert(ws.payment.privateKey, 'abc')
        assert(ws.payment.requestedBtcAmount, 1)
    })
})

