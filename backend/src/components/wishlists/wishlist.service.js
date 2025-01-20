const dbClient = require('../../db/client')
const { AppError } = require('../../middleware/error-handler')
const logger = require('../../utils/logger')

class WishlistService {
  async createWishlist(userId, data) {
    try {
      const wishlist = {
        _id: await dbClient.getUUID(),
        userId,
        name: data.name,
        description: data.description,
        items: [],
        sharedWith: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      try {
        const db = dbClient.client.use('wishlists')
        const response = await db.insert(wishlist)
        return {
          ...wishlist,
          _rev: response.rev
        }
      } catch (dbError) {
        logger.error('Database error details:', {
          error: dbError,
          document: wishlist
        })
        throw new AppError(500, 'Database operation failed')
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to create wishlist:', error)
      throw new AppError(500, 'Failed to create wishlist')
    }
  }

  async getWishlists(userId) {
    try {
      const db = dbClient.client.use('wishlists')
      const query = {
        selector: {
          userId: userId
        }
      }
      const result = await db.find(query)
      return result.docs
    } catch (error) {
      logger.error('Failed to get wishlists:', error)
      throw new AppError(500, 'Failed to get wishlists')
    }
  }

  async getWishlistById(userId, wishlistId) {
    try {
      const db = dbClient.client.use('wishlists')
      const wishlist = await db.get(wishlistId)
      
      if (!wishlist) {
        throw new AppError(404, 'Wishlist not found')
      }

      if (wishlist.userId !== userId && !wishlist.sharedWith.includes(userId)) {
        throw new AppError(403, 'Access denied')
      }

      return wishlist
    } catch (error) {
      if (error.statusCode === 404) {
        throw new AppError(404, 'Wishlist not found')
      }
      if (error instanceof AppError) throw error
      logger.error('Failed to get wishlist:', error)
      throw new AppError(500, 'Failed to get wishlist')
    }
  }

  async updateWishlist(userId, wishlistId, data) {
    try {
      // Get wishlist to verify it exists and check ownership
      const wishlist = await dbClient.getDocument('wishlists', wishlistId)
      if (!wishlist) {
        throw new AppError(404, 'Wishlist not found')
      }

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Only the owner can update the wishlist')
      }

      const updatedWishlist = {
        ...wishlist,
        name: data.name || wishlist.name,
        description: data.description || wishlist.description,
        updatedAt: new Date().toISOString()
      }

      try {
        // Use nano client directly for debugging
        const db = dbClient.client.use('wishlists')
        const response = await db.insert(updatedWishlist)
        logger.info('CouchDB update response:', response)
        
        return {
          ...updatedWishlist,
          _rev: response.rev // Update revision
        }
      } catch (dbError) {
        logger.error('Database error details:', {
          error: dbError,
          wishlistId,
          document: updatedWishlist
        })
        throw new AppError(500, 'Database operation failed')
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to update wishlist:', error)
      throw new AppError(500, 'Failed to update wishlist')
    }
  }

  async deleteWishlist(userId, wishlistId) {
    try {
      // Get wishlist to verify it exists and check ownership
      const wishlist = await dbClient.getDocument('wishlists', wishlistId)
      if (!wishlist) {
        throw new AppError(404, 'Wishlist not found')
      }

      // Check ownership
      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Not authorized to delete this wishlist')
      }

      // Delete wishlist
      await dbClient.destroyDocument('wishlists', wishlistId, wishlist._rev)

      return null
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to delete wishlist:', error)
      throw new AppError(500, 'Failed to delete wishlist')
    }
  }

  async addItem(userId, wishlistId, itemData) {
    try {
      const db = dbClient.client.use('wishlists')
      const wishlist = await db.get(wishlistId)
      
      if (!wishlist) {
        throw new AppError(404, 'Wishlist not found')
      }

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Only the owner can add items')
      }

      // Check if item already exists by URL
      const existingItem = wishlist.items.find(item => item.url === itemData.url)

      let newItem
      if (existingItem) {
        // Increment quantity of existing item
        existingItem.quantity += 1
        existingItem.updatedAt = new Date().toISOString()
        newItem = existingItem
      } else {
        // Add new item with quantity 1
        newItem = {
          _id: await dbClient.getUUID(),
          url: itemData.url,
          title: itemData.title,
          price: itemData.price,
          currency: itemData.currency,
          quantity: 1,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        wishlist.items.push(newItem)
      }

      wishlist.updatedAt = new Date().toISOString()
      try {
        const response = await db.insert(wishlist)
        return {
          ...newItem,
          _rev: response.rev
        }
      } catch (dbError) {
        logger.error('Database error details:', {
          error: dbError,
          wishlistId,
          document: wishlist
        })
        throw new AppError(500, 'Database operation failed')
      }
    } catch (error) {
      if (error.statusCode === 404) {
        throw new AppError(404, 'Wishlist not found')
      }
      if (error instanceof AppError) throw error
      logger.error('Failed to add item to wishlist:', error)
      throw new AppError(500, 'Failed to add item to wishlist')
    }
  }

  async removeItem(userId, wishlistId, itemId) {
    try {
      const db = dbClient.client.use('wishlists')
      const wishlist = await db.get(wishlistId)
      
      if (!wishlist) {
        throw new AppError(404, 'Wishlist not found')
      }

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Only the owner can remove items')
      }

      const itemIndex = wishlist.items.findIndex(item => item._id === itemId)
      if (itemIndex === -1) {
        throw new AppError(404, 'Item not found')
      }

      const item = wishlist.items[itemIndex]
      if (item.quantity > 1) {
        // Decrement quantity
        item.quantity -= 1
        item.updatedAt = new Date().toISOString()
      } else {
        // Remove item completely
        wishlist.items.splice(itemIndex, 1)
      }

      wishlist.updatedAt = new Date().toISOString()
      try {
        const response = await db.insert(wishlist)
        return {
          ...wishlist,
          _rev: response.rev
        }
      } catch (dbError) {
        logger.error('Database error details:', {
          error: dbError,
          wishlistId,
          itemId,
          document: wishlist
        })
        throw new AppError(500, 'Database operation failed')
      }
    } catch (error) {
      if (error.statusCode === 404) {
        throw new AppError(404, 'Wishlist not found')
      }
      if (error instanceof AppError) throw error
      logger.error('Failed to remove item from wishlist:', error)
      throw new AppError(500, 'Failed to remove item from wishlist')
    }
  }

  async shareWishlist(userId, wishlistId, targetUserId) {
    try {
      const db = dbClient.client.use('wishlists')
      const wishlist = await db.get(wishlistId)
      
      if (!wishlist) {
        throw new AppError(404, 'Wishlist not found')
      }

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Only the owner can share the wishlist')
      }

      if (wishlist.sharedWith.includes(targetUserId)) {
        throw new AppError(400, 'Wishlist already shared with this user')
      }

      // Add target user to sharedWith array
      wishlist.sharedWith.push(targetUserId)
      wishlist.updatedAt = new Date().toISOString()

      try {
        const response = await db.insert(wishlist)
        return {
          ...wishlist,
          _rev: response.rev
        }
      } catch (dbError) {
        logger.error('Database error details:', {
          error: dbError,
          wishlistId,
          targetUserId,
          document: wishlist
        })
        throw new AppError(500, 'Database operation failed')
      }
    } catch (error) {
      if (error.statusCode === 404) {
        throw new AppError(404, 'Wishlist not found')
      }
      if (error instanceof AppError) throw error
      logger.error('Failed to share wishlist:', error)
      throw new AppError(500, 'Failed to share wishlist')
    }
  }

  async unshareWishlist(userId, wishlistId, targetUserId) {
    try {
      const db = dbClient.client.use('wishlists')
      const wishlist = await db.get(wishlistId)
      
      if (!wishlist) {
        throw new AppError(404, 'Wishlist not found')
      }

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Only the owner can unshare the wishlist')
      }

      const index = wishlist.sharedWith.indexOf(targetUserId)
      if (index === -1) {
        throw new AppError(400, 'Wishlist is not shared with this user')
      }

      // Remove target user from sharedWith array
      wishlist.sharedWith.splice(index, 1)
      wishlist.updatedAt = new Date().toISOString()

      try {
        const response = await db.insert(wishlist)
        return {
          ...wishlist,
          _rev: response.rev
        }
      } catch (dbError) {
        logger.error('Database error details:', {
          error: dbError,
          wishlistId,
          targetUserId,
          document: wishlist
        })
        throw new AppError(500, 'Database operation failed')
      }
    } catch (error) {
      if (error.statusCode === 404) {
        throw new AppError(404, 'Wishlist not found')
      }
      if (error instanceof AppError) throw error
      logger.error('Failed to unshare wishlist:', error)
      throw new AppError(500, 'Failed to unshare wishlist')
    }
  }
}

module.exports = new WishlistService() 