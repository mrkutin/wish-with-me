const { body } = require('express-validator')
const { validate } = require('../../middleware/validate')

const validateUser = validate([
  body('email')
    .isEmail()
    .withMessage('Must be a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters')
])

const validateUpdateProfile = validate([
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email'),
  body('currentPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Current password must be at least 6 characters'),
  body('newPassword')
    .optional()
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
])

module.exports = {
  validateUser,
  validateUpdateProfile
} 