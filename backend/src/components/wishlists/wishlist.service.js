const dbClient = require('../../db/client')
const { AppError } = require('../../middleware/error-handler')
const logger = require('../../utils/logger')

class WishlistService {
  async createWishlist(userId, data) {
    try {
      const wishlist = {
        type: 'wishlist',
        userId,
        name: data.name,
        description: data.description,
        items: [],
        sharedWith: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const result = await dbClient.createDocument(wishlist)
      return { _id: result.id, ...wishlist }
    } catch (error) {
      logger.error('Failed to create wishlist:', error)
      throw new AppError(500, 'Failed to create wishlist')
    }
  }

  async getWishlists(userId) {
    try {
      const query = {
        selector: {
          type: 'wishlist',
          userId: userId
        }
      }
      const result = await dbClient.db.find(query)
      return result.docs
    } catch (error) {
      logger.error('Failed to get wishlists:', error)
      throw new AppError(500, 'Failed to get wishlists')
    }
  }

  async getWishlistById(userId, wishlistId) {
    try {
      const wishlist = await dbClient.getDocument(wishlistId)
      
      if (!wishlist || wishlist.type !== 'wishlist') {
        throw new AppError(404, 'Wishlist not found')
      }

      if (wishlist.userId !== userId && !wishlist.sharedWith.includes(userId)) {
        throw new AppError(403, 'Access denied')
      }

      return wishlist
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to get wishlist:', error)
      throw new AppError(500, 'Failed to get wishlist')
    }
  }

  async updateWishlist(userId, wishlistId, data) {
    try {
      const wishlist = await this.getWishlistById(userId, wishlistId)

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Only the owner can update the wishlist')
      }

      const updatedWishlist = {
        ...wishlist,
        name: data.name || wishlist.name,
        description: data.description || wishlist.description,
        updatedAt: new Date().toISOString()
      }

      await dbClient.db.insert(updatedWishlist)
      return updatedWishlist // CouchDB response already includes _id
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to update wishlist:', error)
      throw new AppError(500, 'Failed to update wishlist')
    }
  }

  async deleteWishlist(userId, wishlistId) {
    try {
      const wishlist = await this.getWishlistById(userId, wishlistId)

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Only the owner can delete the wishlist')
      }

      await dbClient.db.destroy(wishlistId, wishlist._rev)
      return { message: 'Wishlist deleted successfully' }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to delete wishlist:', error)
      throw new AppError(500, 'Failed to delete wishlist')
    }
  }

  async addItem(userId, wishlistId, item) {
    try {
      const wishlist = await this.getWishlistById(userId, wishlistId)

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Only the owner can add items')
      }

      const newItem = {
        _id: Date.now().toString(),
        url: item.url,
        title: item.title,
        price: item.price,
        currency: item.currency,
        addedAt: new Date().toISOString()
      }

      wishlist.items.push(newItem)
      wishlist.updatedAt = new Date().toISOString()

      await dbClient.db.insert(wishlist)
      return newItem
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to add item to wishlist:', error)
      throw new AppError(500, 'Failed to add item to wishlist')
    }
  }

  async removeItem(userId, wishlistId, itemId) {
    try {
      const wishlist = await this.getWishlistById(userId, wishlistId)

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Only the owner can remove items')
      }

      const itemIndex = wishlist.items.findIndex(item => item._id === itemId)
      if (itemIndex === -1) {
        throw new AppError(404, 'Item not found')
      }

      wishlist.items.splice(itemIndex, 1)
      wishlist.updatedAt = new Date().toISOString()

      await dbClient.db.insert(wishlist)
      return { message: 'Item removed successfully' }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to remove item from wishlist:', error)
      throw new AppError(500, 'Failed to remove item from wishlist')
    }
  }

  async shareWishlist(userId, wishlistId, targetUserId) {
    try {
      const wishlist = await this.getWishlistById(userId, wishlistId)

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Only the owner can share the wishlist')
      }

      if (wishlist.sharedWith.includes(targetUserId)) {
        throw new AppError(400, 'Wishlist already shared with this user')
      }

      wishlist.sharedWith.push(targetUserId)
      wishlist.updatedAt = new Date().toISOString()

      await dbClient.db.insert(wishlist)
      return wishlist // Return the updated wishlist
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to share wishlist:', error)
      throw new AppError(500, 'Failed to share wishlist')
    }
  }

  async unshareWishlist(userId, wishlistId, targetUserId) {
    try {
      const wishlist = await this.getWishlistById(userId, wishlistId)

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Only the owner can unshare the wishlist')
      }

      if (!wishlist.sharedWith.includes(targetUserId)) {
        throw new AppError(400, 'Wishlist is not shared with this user')
      }

      wishlist.sharedWith = wishlist.sharedWith.filter(id => id !== targetUserId)
      wishlist.updatedAt = new Date().toISOString()

      await dbClient.db.insert(wishlist)
      return wishlist
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to unshare wishlist:', error)
      throw new AppError(500, 'Failed to unshare wishlist')
    }
  }
}

module.exports = new WishlistService() 