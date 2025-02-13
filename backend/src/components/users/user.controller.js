const express = require('express')
const router = express.Router()
const userService = require('./user.service')
const authMiddleware = require('../../middleware/auth')
const { validateUpdateProfile, validateUser } = require('./user.validation')
const { AppError } = require('../../middleware/error-handler')

router.use(authMiddleware) // Protect all user routes

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   email:
 *                     type: string
 *                   name:
 *                     type: string
 *                   provider:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 */
router.get('/', async (req, res, next) => {
  try {
    const users = await userService.getUsers()
    res.json(users)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const userIdToDelete = req.params.id
    const requestingUserId = req.user.userId

    // Only allow users to delete their own accounts
    if (userIdToDelete !== requestingUserId) {
      throw new AppError(403, 'Not authorized to delete other users')
    }

    await userService.deleteUser(userIdToDelete)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid current password
 */
router.patch('/me', validateUpdateProfile, async (req, res, next) => {
  try {
    const userId = req.user.userId
    const updatedUser = await userService.updateProfile(userId, req.body)
    res.json(updatedUser)
  } catch (error) {
    next(error)
  }
})

router.post('/', validateUser, async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body)
    
    // For testing purposes, if this is a second user, store as targetUserId
    if (req.get('X-Store-Target-User') === 'true') {
      res.set('X-Target-User-Id', user._id)
    }
    
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
})

module.exports = router 