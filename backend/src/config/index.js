const convict = require('convict')
const dotenv = require('dotenv')

dotenv.config()

console.log('Environment variables:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('Loaded from .env file:', require('dotenv').config().parsed)

const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  useHttps: {
    doc: 'Use HTTPS instead of HTTP',
    format: Boolean,
    default: false,
    env: 'USE_HTTPS'
  },
  backendPort: {
    doc: 'The port to bind.',
    format: 'port',
    default: 3000,
    env: 'BACKEND_PORT'
  },
  couchdb: {
    host: {
      doc: 'CouchDB host',
      format: String,
      default: 'localhost',
      env: 'COUCHDB_HOST'
    },
    port: {
      doc: 'CouchDB port',
      format: 'port',
      default: 5984,
      env: 'COUCHDB_PORT'
    },
    username: {
      doc: 'CouchDB username',
      format: String,
      default: 'admin',
      env: 'COUCHDB_USERNAME'
    },
    password: {
      doc: 'CouchDB password',
      format: String,
      default: 'password',
      env: 'COUCHDB_PASSWORD'
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
      }
    }
  },
  logLevel: {
    doc: 'Logging level',
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