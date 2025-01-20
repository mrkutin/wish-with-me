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
}

module.exports = new UserService() 