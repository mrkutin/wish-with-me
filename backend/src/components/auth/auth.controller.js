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
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL}/login`
  }),
  function(req, res) {
    const token = authService.generateToken(req.user._id)
    // Include all necessary user fields
    const userInfo = {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      provider: req.user.provider,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    }
    const encodedUser = encodeURIComponent(JSON.stringify(userInfo))
    res.redirect(`${process.env.FRONTEND_URL}/callback?token=${token}&user=${encodedUser}`)
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

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user info
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.userId)
    res.json(user)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /auth/yandex:
 *   get:
 *     summary: Yandex OAuth login
 *     tags: [Authentication]
 */
router.get('/yandex',
  passport.authenticate('yandex', { scope: ['login:email', 'login:info'], session: false })
)

router.get('/yandex/callback',
  passport.authenticate('yandex', { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL}/login`
  }),
  function(req, res) {
    const token = authService.generateToken(req.user._id)
    // Include all necessary user fields
    const userInfo = {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      provider: req.user.provider,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    }
    const encodedUser = encodeURIComponent(JSON.stringify(userInfo))
    res.redirect(`${process.env.FRONTEND_URL}/callback?token=${token}&user=${encodedUser}`)
  }
)

/**
 * @swagger
 * /auth/vk:
 *   get:
 *     summary: VK OAuth login
 *     tags: [Authentication]
 */
router.get('/vk',
  passport.authenticate('vkontakte', { session: false })
)

router.get('/vk/callback',
  passport.authenticate('vkontakte', { 
    session: false, 
    failureRedirect: `${process.env.FRONTEND_URL}/login`
  }),
  function(req, res) {
    const token = authService.generateToken(req.user._id)
    const userInfo = {
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      provider: req.user.provider,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    }
    const encodedUser = encodeURIComponent(JSON.stringify(userInfo))
    res.redirect(`${process.env.FRONTEND_URL}/callback?token=${token}&user=${encodedUser}`)
  }
)

module.exports = router 