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
      logger.info('Attempting to delete user:', { userId })

      // Get user to verify it exists
      const user = await dbClient.getDocument('users', userId)
      if (!user) {
        throw new AppError(404, 'User not found')
      }

      // Get all user's wishlists
      const wishlists = await dbClient.findDocuments('wishlists', {
        selector: { userId }
      })

      // Delete each wishlist and its items
      for (const wishlist of wishlists) {
        try {
          // Try to delete items, but don't fail if items database doesn't exist
          try {
            const items = await dbClient.findDocuments('items', {
              selector: { wishlistId: wishlist._id }
            })
            for (const item of items) {
              await dbClient.destroyDocument('items', item._id, item._rev)
            }
          } catch (error) {
            logger.warn('Failed to delete items, continuing with wishlist deletion:', error)
          }

          // Delete the wishlist itself
          await dbClient.destroyDocument('wishlists', wishlist._id, wishlist._rev)
        } catch (error) {
          logger.error('Failed to delete wishlist:', error)
          // Continue with other wishlists
        }
      }

      // Find and update any shared wishlists
      try {
        const sharedWishlists = await dbClient.findDocuments('wishlists', {
          selector: {
            sharedWith: { $elemMatch: { $eq: userId } }
          }
        })

        // Remove user from sharedWith arrays
        for (const wishlist of sharedWishlists) {
          const updatedSharedWith = wishlist.sharedWith.filter(id => id !== userId)
          await dbClient.updateDocument('wishlists', wishlist._id, {
            ...wishlist,
            sharedWith: updatedSharedWith
          })
        }
      } catch (error) {
        logger.error('Failed to update shared wishlists:', error)
        // Continue with user deletion
      }

      // Finally delete the user
      await dbClient.destroyDocument('users', userId, user._rev)

      logger.info('Successfully deleted user and all related data:', { userId })
      return null

    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to delete user:', error)
      throw new AppError(500, 'Failed to delete user')
    }
  }

  async updateProfile(userId, updateData) {
    try {
      logger.info('Attempting to update user:', { userId })

      // Log all users in the database
      const allUsers = await dbClient.findDocuments('users', { selector: {} })
      logger.info('All users in database:', { users: allUsers })

      // Get current user using the ID from the token
      const currentUser = await dbClient.getDocument('users', userId)
      logger.info('Database response:', { currentUser })

      if (!currentUser) {
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
          currentUser.password
        )
        if (!isValidPassword) {
          throw new AppError(401, 'Current password is incorrect')
        }

        // Hash new password
        updates.password = await bcrypt.hash(updateData.newPassword, 10)
      }

      // Update timestamp
      updates.updatedAt = new Date().toISOString()

      try {
        // Create the update document by spreading currentUser first, then updates
        const updatedUser = {
          ...currentUser,  // This includes _id and _rev
          ...updates
        }

        // Update the document using the dbClient method
        const response = await dbClient.updateDocument('users', userId, updatedUser)
        
        // Prepare the response
        const result = {
          ...updatedUser,
          _rev: response.rev
        }
        delete result.password
        return result

      } catch (dbError) {
        logger.error('Database update error:', dbError)
        if (dbError.statusCode === 409) {
          throw new AppError(409, 'Document update conflict. Please try again.')
        }
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