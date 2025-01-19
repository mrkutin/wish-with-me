const convict = require('convict')
const dotenv = require('dotenv')

dotenv.config()

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'PORT'
  },
  couchdb: {
    url: {
      doc: 'CouchDB connection URL',
      format: String,
      default: 'http://localhost:5984',
      env: 'COUCHDB_URL'
    },
    username: {
      doc: 'CouchDB username',
      format: String,
      default: '',
      env: 'COUCHDB_USERNAME'
    },
    password: {
      doc: 'CouchDB password',
      format: String,
      default: '',
      env: 'COUCHDB_PASSWORD',
      sensitive: true
    },
    database: {
      doc: 'CouchDB database name',
      format: String,
      default: 'myapp',
      env: 'COUCHDB_DATABASE'
    }
  },
  logLevel: {
    doc: 'The logging level',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
    default: 'info',
    env: 'LOG_LEVEL'
  }
})

config.validate({ allowed: 'strict' })

module.exports = config 