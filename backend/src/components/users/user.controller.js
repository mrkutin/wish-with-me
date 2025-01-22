const express = require('express')
const router = express.Router()
const userService = require('./user.service')
const authMiddleware = require('../../middleware/auth')
const { validateUpdateProfile } = require('./user.validation')

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
    await userService.deleteUser(req.params.id)
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

module.exports = router 