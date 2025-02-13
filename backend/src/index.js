const express = require('express')
const http = require('http')
const fs = require('fs')
const path = require('path')
const helmet = require('helmet')
const cors = require('cors')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const pinoHttp = require('pino-http')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy

const config = require('./config')
const logger = require('./utils/logger')
const dbClient = require('./db/client')
const { errorHandler } = require('./middleware/error-handler')
const healthRouter = require('./components/health/health.controller')
const authRouter = require('./components/auth/auth.controller')
const wishlistRouter = require('./components/wishlists/wishlist.controller')
const notificationRouter = require('./components/notifications/notification.controller')
const userRouter = require('./components/users/user.controller')
const browserService = require('./services/browser.service')
const authService = require('./components/auth/auth.service')

const app = express()

// Initialize passport
app.use(passport.initialize())
require('./components/auth/auth.service') // Make sure Google Strategy is loaded

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "img-src": ["'self'", "data:", "https:"],
    },
  },
}))
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://wishwith.me',
      'https://api.wishwith.me',
      'https://accounts.google.com',
      'https://oauth.yandex.ru',
      'https://oauth.vk.com'
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cache-Control',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Referer',
    'User-Agent',
    'Sec-Fetch-Mode',
    'Sec-Fetch-Site',
    'Sec-Fetch-Dest'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type', 'ETag'],
  maxAge: 86400, // 24 hours in seconds
  preflightContinue: false,
  optionsSuccessStatus: 204
}))
app.use(compression())
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000 // limit each IP to 100 requests per windowMs
}))

// Logging middleware
app.use(pinoHttp({
  logger,
  autoLogging: false,
  customLogLevel: function (req, res, err) {
    if (res.statusCode >= 400 && res.statusCode < 500) return 'warn'
    if (res.statusCode >= 500 || err) return 'error'
    return 'silent'
  }
}))

// Body parsing middleware
app.use(express.json({ limit: '10kb' }))

// Routes
app.use('/health', healthRouter)
app.use('/auth', authRouter)
app.use('/wishlists', wishlistRouter)
app.use('/notifications', notificationRouter)
app.use('/users', userRouter)

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wish With Me API Documentation',
      version: '1.0.0',
      description: 'API documentation for Wish With Me - a collaborative wishlist management system',
      contact: {
        name: 'API Support',
        email: 'support@wishwithme.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.wishwithme.com' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/components/**/*.js']
}

const swaggerDocs = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Wish With Me API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true
  }
}))

// Error handling
app.use(errorHandler)

async function startServer() {
  try {
    // Test database connection before starting server
    const isConnected = await dbClient.testConnection()
    if (!isConnected) {
      throw new Error('Could not connect to CouchDB')
    }

    await browserService.initialize()
    
    const backendPort = config.get('backendPort')
    
    const server = http.createServer(app)
    logger.info('Starting server in HTTP mode')
    
    server.listen(backendPort, () => {
      logger.info(`Server is running on http://localhost:${backendPort}`)
    })

    // Cleanup on server shutdown
    const cleanup = async () => {
      logger.info('Server shutting down...')
      await browserService.cleanup()
      server.close()
      process.exit(0)
    }

    process.on('SIGTERM', cleanup)
    process.on('SIGINT', cleanup)

  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer() 