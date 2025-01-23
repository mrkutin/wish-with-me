const { validationResult } = require('express-validator')
const { AppError } = require('./error-handler')

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)))

    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg)
      return next(new AppError(400, errorMessages[0]))
    }

    next()
  }
}

module.exports = {
  validate
} 