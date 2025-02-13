const jwt = require('jsonwebtoken')
const { AppError } = require('./error-handler')
const config = require('../config')
const logger = require('../utils/logger')

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided')
    }

    const token = authHeader.split(' ')[1]
    logger.info('Token received:', { 
      token,
      decoded: jwt.decode(token)
    })

    // Verify token
    const decoded = jwt.verify(token, config.get('jwt.secret'))
    logger.info('Decoded token:', { decoded })
    
    // Set user in request
    req.user = decoded
    logger.info('User set in request:', { 
      user: req.user,
      databaseUserId: 'a8717c84b43cbe48d31ff3d13f0132c8'
    })

    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError(401, 'Invalid token'))
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError(401, 'Token expired'))
    } else {
      next(new AppError(401, 'Invalid or expired token'))
    }
  }
}

module.exports = authMiddleware 