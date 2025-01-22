const { AppError } = require('../../middleware/error-handler')

const validateUpdateProfile = (req, res, next) => {
  const { name, email, currentPassword, newPassword } = req.body

  // At least one field must be provided
  if (!name && !email && !newPassword) {
    return next(new AppError(400, 'Provide at least one field to update'))
  }

  // Validate name if provided
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      return next(new AppError(400, 'Name cannot be empty'))
    }
    if (name.length > 100) {
      return next(new AppError(400, 'Name must not exceed 100 characters'))
    }
  }

  // Validate email if provided
  if (email !== undefined) {
    if (typeof email !== 'string' || !email.includes('@')) {
      return next(new AppError(400, 'Invalid email format'))
    }
    if (email.length > 255) {
      return next(new AppError(400, 'Email must not exceed 255 characters'))
    }
  }

  // Validate password if provided
  if (newPassword !== undefined) {
    if (!currentPassword) {
      return next(new AppError(400, 'Current password is required to set new password'))
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return next(new AppError(400, 'New password must be at least 6 characters'))
    }
    if (newPassword.length > 100) {
      return next(new AppError(400, 'New password must not exceed 100 characters'))
    }
  }

  next()
}

module.exports = {
  validateUpdateProfile
} 