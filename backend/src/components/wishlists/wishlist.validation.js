const { AppError } = require('../../middleware/error-handler')

const validateWishlist = (req, res, next) => {
  const { name, description } = req.body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new AppError(400, 'Name is required'))
  }

  if (description && typeof description !== 'string') {
    return next(new AppError(400, 'Description must be a string'))
  }

  next()
}

const validateItem = (req, res, next) => {
  const { name, url } = req.body

  // Check that exactly one of name or url is provided
  const hasName = name !== undefined && name !== null
  const hasUrl = url !== undefined && url !== null

  if (hasName && hasUrl) {
    return next(new AppError(400, 'Provide either name or url, not both'))
  }

  if (!hasName && !hasUrl) {
    return next(new AppError(400, 'Provide either name or url'))
  }

  // Validate name if provided
  if (hasName) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return next(new AppError(400, 'Name cannot be empty'))
    }
    if (name.length > 100) {
      return next(new AppError(400, 'Name must not exceed 100 characters'))
    }
  }

  // Validate URL if provided
  if (hasUrl) {
    if (typeof url !== 'string' || url.trim().length === 0) {
      return next(new AppError(400, 'URL cannot be empty'))
    }
    if (!url.match(/^https?:\/\/.+/)) {
      return next(new AppError(400, 'URL must be valid'))
    }
    if (url.length > 500) {
      return next(new AppError(400, 'URL must not exceed 500 characters'))
    }
  }

  next()
}

module.exports = {
  validateWishlist,
  validateItem
} 