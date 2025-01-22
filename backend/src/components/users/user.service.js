const bcrypt = require('bcryptjs')
const dbClient = require('../../db/client')
const { AppError } = require('../../middleware/error-handler')
const logger = require('../../utils/logger')

class UserService {
  async getUsers() {
    try {
      const users = await dbClient.findDocuments('users', {
        selector: {},
        fields: ['_id', 'email', 'name', 'provider', 'createdAt', 'updatedAt']
      })
      return users
    } catch (error) {
      logger.error('Failed to get users:', error)
      throw new AppError(500, 'Failed to get users')
    }
  }

  async deleteUser(userId) {
    try {
      // Get user to verify it exists
      const user = await dbClient.getDocument('users', userId)
      if (!user) {
        throw new AppError(404, 'User not found')
      }

      // Delete user's wishlists
      const wishlists = await dbClient.findDocuments('wishlists', {
        selector: { userId }
      })
      for (const wishlist of wishlists) {
        await dbClient.destroyDocument('wishlists', wishlist._id, wishlist._rev)
      }

      // Delete user's cart
      const carts = await dbClient.findDocuments('carts', {
        selector: { userId }
      })
      for (const cart of carts) {
        await dbClient.destroyDocument('carts', cart._id, cart._rev)
      }

      // Delete user
      await dbClient.destroyDocument('users', userId, user._rev)

      return null
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to delete user:', error)
      throw new AppError(500, 'Failed to delete user')
    }
  }

  async updateProfile(userId, updateData) {
    try {
      // Get current user
      const user = await dbClient.getDocument('users', userId)
      if (!user) {
        throw new AppError(404, 'User not found')
      }

      const updates = {}

      // Handle name update
      if (updateData.name !== undefined) {
        updates.name = updateData.name
      }

      // Handle email update
      if (updateData.email !== undefined) {
        // Check if email is already taken
        const existingUser = await dbClient.findDocuments('users', {
          selector: {
            email: updateData.email,
            _id: { $ne: userId }
          }
        })
        if (existingUser.length > 0) {
          throw new AppError(400, 'Email already in use')
        }
        updates.email = updateData.email
      }

      // Handle password update
      if (updateData.newPassword) {
        // Verify current password
        const isValidPassword = await bcrypt.compare(
          updateData.currentPassword,
          user.password
        )
        if (!isValidPassword) {
          throw new AppError(401, 'Current password is incorrect')
        }

        // Hash new password
        updates.password = await bcrypt.hash(updateData.newPassword, 10)
      }

      // Update timestamp
      updates.updatedAt = new Date().toISOString()

      // Update user document
      const updatedUser = {
        ...user,
        ...updates
      }

      try {
        const response = await dbClient.databases.users.insert(updatedUser)
        const result = {
          ...updatedUser,
          _rev: response.rev
        }
        delete result.password
        return result
      } catch (dbError) {
        logger.error('Database error details:', {
          error: dbError,
          userId,
          updates
        })
        throw new AppError(500, 'Database operation failed')
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to update user profile:', error)
      throw new AppError(500, 'Failed to update user profile')
    }
  }
}

module.exports = new UserService() 