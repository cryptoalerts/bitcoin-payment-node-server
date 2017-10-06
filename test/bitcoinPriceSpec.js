const bitcoinPrice = require('../src/bitcoinPrice'),
    chai = require('chai'),
    assert = chai.assert

describe('calculation of btc amount to receive X euros', () => {

    it('gets correct btc amount for 40 euros', () => {
        assert.equal(bitcoinPrice.getCurrentPrice(40), 0.01)
    })

    it('gets correct btc amount for 4000 euros', () => {
        assert.equal(bitcoinPrice.getCurrentPrice(4000), 1)
    })

    it('request for 0 euro', () => {
        let result = bitcoinPrice.getCurrentPrice(0)
        assert.equal(result, 0)
    })

    it('request for undefined', () => {
        let result = bitcoinPrice.getCurrentPrice(undefined)
        assert.equal(result, 0)
    })
})