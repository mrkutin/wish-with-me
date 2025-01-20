const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const pinoHttp = require('pino-http')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const config = require('./config')
const logger = require('./utils/logger')
const dbClient = require('./db/client')
const { errorHandler } = require('./middleware/error-handler')
const healthRouter = require('./components/health/health.controller')
const authRouter = require('./components/auth/auth.controller')
const wishlistRouter = require('./components/wishlists/wishlist.controller')
const cartRouter = require('./components/shopping/cart.controller')
const notificationRouter = require('./components/notifications/notification.controller')
const userRouter = require('./components/users/user.controller')

const app = express()

// Security middleware
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000 // limit each IP to 100 requests per windowMs
}))

// Logging middleware
app.use(pinoHttp({ logger }))

// Body parsing middleware
app.use(express.json({ limit: '10kb' }))

// Routes
app.use('/health', healthRouter)
app.use('/auth', authRouter)
app.use('/wishlists', wishlistRouter)
app.use('/cart', cartRouter)
app.use('/notifications', notificationRouter)
app.use('/users', userRouter)

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Wish With Me API Documentation',
      version: '1.0.0',
      description: 'API documentation for Wish With Me'
    }
  },
  apis: ['./src/components/**/*.js']
}

const swaggerDocs = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

// Error handling
app.use(errorHandler)

const start = async () => {
  try {
    await dbClient.init()
    
    const port = config.get('port')
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`)
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

start() 