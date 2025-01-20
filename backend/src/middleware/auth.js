const jwt = require('jsonwebtoken')
const config = require('../config')
const { AppError } = require('./error-handler')

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'No token provided')
    }

    const token = authHeader.split(' ')[1]
    if (!token) {
      throw new AppError(401, 'No token provided')
    }

    try {
      const decoded = jwt.verify(token, config.get('jwt.secret'))
      req.user = { userId: decoded.userId }
      next()
    } catch (error) {
      throw new AppError(401, 'Invalid token')
    }
  } catch (error) {
    next(error)
  }
}

module.exports = authMiddleware 