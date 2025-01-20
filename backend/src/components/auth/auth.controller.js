const express = require('express')
const passport = require('passport')
const router = express.Router()
const authService = require('./auth.service')
const { validateSignup, validateLogin } = require('./auth.validation')
const { AppError } = require('../../middleware/error-handler')
const userService = require('../users/user.service')
const authMiddleware = require('../../middleware/auth')

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 */
router.post('/signup', validateSignup, async (req, res, next) => {
  try {
    const result = await authService.signup(req.body)
    res.status(201).json(result)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 */
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const result = await authService.login(req.body.email, req.body.password)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Google OAuth login
 *     tags: [Authentication]
 */
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res, next) => {
    try {
      const result = await authService.googleAuth(req.user)
      res.redirect(`/auth-callback?token=${result.token}`)
    } catch (error) {
      next(error)
    }
  }
)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

/**
 * @swagger
 * /auth/me:
 *   delete:
 *     summary: Delete current user account
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete('/me', async (req, res, next) => {
  try {
    const userId = 'temp-user-id' // Will be replaced with actual user ID from JWT
    await userService.deleteUser(userId)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

module.exports = router 