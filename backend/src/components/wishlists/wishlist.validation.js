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
  const { name, url, price, currency } = req.body

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new AppError(400, 'Name is required'))
  }

  if (url) {
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

  if (price !== undefined) {
    const numPrice = Number(price)
    if (isNaN(numPrice) || numPrice < 0) {
      return next(new AppError(400, 'Price must be a positive number'))
    }
  }

  if (currency !== undefined) {
    if (typeof currency !== 'string' || currency.trim().length === 0) {
      return next(new AppError(400, 'Currency cannot be empty'))
    }
    if (currency.length > 3) {
      return next(new AppError(400, 'Currency must be a valid 3-letter code'))
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