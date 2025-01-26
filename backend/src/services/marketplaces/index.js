const ozon = require('./ozon')
const wildberries = require('./wildberries')
const yandexMarket = require('./yandex-market')

const marketplaces = {
  OZON: ozon,
  WILDBERRIES: wildberries,
  YANDEX_MARKET: yandexMarket
}

module.exports = {
  marketplaces
} 