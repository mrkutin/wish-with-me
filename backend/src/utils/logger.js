const pino = require('pino')
const config = require('../config')

const logger = pino({
  level: config.get('logLevel'),
  transport: config.get('env') === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  } : undefined,
  formatters: {
    level: (label) => {
      return { level: label }
    }
  }
})

module.exports = logger 