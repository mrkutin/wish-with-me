const { AppError } = require('../../middleware/error-handler')

const validateSignup = (req, res, next) => {
  const { email, password, name } = req.body

  if (!email || !email.includes('@')) {
    return next(new AppError(400, 'Valid email is required'))
  }

  if (!password || password.length < 6) {
    return next(new AppError(400, 'Password must be at least 6 characters'))
  }

  if (!name || name.trim().length === 0) {
    return next(new AppError(400, 'Name is required'))
  }

  next()
}

const validateLogin = (req, res, next) => {
  const { email, password } = req.body

  if (!email || !email.includes('@')) {
    return next(new AppError(400, 'Valid email is required'))
  }

  if (!password) {
    return next(new AppError(400, 'Password is required'))
  }

  next()
}

module.exports = {
  validateSignup,
  validateLogin
} 