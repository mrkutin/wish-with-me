const { AppError } = require('../../middleware/error-handler')
const { param, body } = require('express-validator')

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
  const hasName = name !== undefined && name !== null && name !== ''
  const hasUrl = url !== undefined && url !== null && url !== ''

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

const updateItemSchema = [
  param('id').isString().notEmpty().withMessage('Wishlist ID is required'),
  param('itemId').isString().notEmpty().withMessage('Item ID is required'),
  body('name').optional().isString().trim().notEmpty().withMessage('Name cannot be empty'),
  body('url').optional().isURL().withMessage('Invalid URL format'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1')
]

module.exports = {
  validateWishlist,
  validateItem,
  updateItemSchema
} 