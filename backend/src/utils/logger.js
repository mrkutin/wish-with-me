const pino = require('pino')
const config = require('../config')

const logger = pino({
  level: config.get('logLevel'),
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
})

module.exports = logger 