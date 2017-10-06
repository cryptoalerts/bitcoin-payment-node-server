let currentBtcEuroPrice = 4000 // todo fetch this from an online api in an interval

module.exports = {
    getCurrentPrice: (forEuros) => {
        if (!forEuros) return 0

        return forEuros / currentBtcEuroPrice
    }
}