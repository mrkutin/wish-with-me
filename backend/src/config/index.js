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
    databases: {
      users: {
        doc: 'Users database name',
        format: String,
        default: 'users',
        env: 'COUCHDB_USERS_DB'
      },
      wishlists: {
        doc: 'Wishlists database name',
        format: String,
        default: 'wishlists',
        env: 'COUCHDB_WISHLISTS_DB'
      },
      carts: {
        doc: 'Shopping carts database name',
        format: String,
        default: 'carts',
        env: 'COUCHDB_CARTS_DB'
      }
    }
  },
  logLevel: {
    doc: 'The logging level',
    format: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
    default: 'info',
    env: 'LOG_LEVEL'
  },
  jwt: {
    secret: {
      doc: 'JWT secret key',
      format: String,
      default: 'your-secret-key',
      env: 'JWT_SECRET',
      sensitive: true
    },
    expiresIn: {
      doc: 'JWT expiration time',
      format: String,
      default: '7d',
      env: 'JWT_EXPIRES_IN'
    }
  },
  google: {
    clientId: {
      doc: 'Google OAuth client ID',
      format: String,
      default: '',
      env: 'GOOGLE_CLIENT_ID'
    },
    clientSecret: {
      doc: 'Google OAuth client secret',
      format: String,
      default: '',
      env: 'GOOGLE_CLIENT_SECRET',
      sensitive: true
    },
    callbackUrl: {
      doc: 'Google OAuth callback URL',
      format: String,
      default: 'http://localhost:3000/auth/google/callback',
      env: 'GOOGLE_CALLBACK_URL'
    }
  }
})

config.validate({ allowed: 'strict' })

module.exports = config 