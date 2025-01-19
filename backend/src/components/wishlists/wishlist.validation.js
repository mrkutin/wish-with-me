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
  const { url, title, price, currency } = req.body

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return next(new AppError(400, 'Valid URL is required'))
  }

  if (!title || typeof title !== 'string') {
    return next(new AppError(400, 'Title is required'))
  }

  if (!price || typeof price !== 'number' || price <= 0) {
    return next(new AppError(400, 'Valid price is required'))
  }

  if (!currency || typeof currency !== 'string' || currency.length !== 3) {
    return next(new AppError(400, 'Valid currency code is required'))
  }

  next()
}

module.exports = {
  validateWishlist,
  validateItem
} 