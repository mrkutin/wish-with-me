const dbClient = require('../../db/client')
const { AppError } = require('../../middleware/error-handler')
const logger = require('../../utils/logger')
const browserService = require('../../services/browser.service')

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

  async updateWishlist(wishlistId, userId, data) {
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

      const result = await dbClient.updateDocument('wishlists', wishlistId, updatedWishlist)
      return {
        ...updatedWishlist,
        _rev: result.rev
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

  async addItem(wishlistId, userId, itemData) {
    try {
      // Get wishlist to verify it exists and check ownership
      const wishlist = await dbClient.getDocument('wishlists', wishlistId)
      if (!wishlist) {
        throw new AppError(404, 'Wishlist not found')
      }

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Not authorized to modify this wishlist')
      }

      logger.debug('Adding item to wishlist:', { wishlistId, itemData })

      // If only URL is provided, try to extract name
      if (itemData.url && !itemData.name) {
        const extractedName = await browserService.extractNameFromUrl(itemData.url)
        if (extractedName) {
          itemData.name = extractedName
          logger.debug('Using extracted name:', { name: itemData.name })
        }
      }

      // Find existing item by URL or name
      const existingItem = wishlist.items.find(item => 
        (itemData.url && item.url === itemData.url) || 
        (itemData.name && item.name === itemData.name)
      )

      let updatedItem
      if (existingItem) {
        logger.debug('Found existing item, updating quantity:', { 
          existingItem 
        })
        // Increment quantity of existing item
        existingItem.quantity += 1
        // Update name if provided
        if (itemData.name) {
          existingItem.name = itemData.name
        }
        // Update the timestamp
        existingItem.updatedAt = new Date().toISOString()
        updatedItem = existingItem
      } else {
        // Create new item
        updatedItem = {
          _id: await dbClient.getUUID(),
          wishlistId,
          name: itemData.name,
          url: itemData.url,
          quantity: 1,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        logger.debug('Creating new item:', { updatedItem })

        // Add new item to wishlist
        wishlist.items.push(updatedItem)
      }

      // Update wishlist in database
      wishlist.updatedAt = new Date().toISOString()
      await dbClient.updateDocument('wishlists', wishlistId, wishlist)

      logger.info('Item added successfully:', { 
        wishlistId, 
        itemId: updatedItem._id,
        name: updatedItem.name 
      })

      return updatedItem
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to add item to wishlist:', {
        wishlistId,
        itemData,
        error: {
          message: error.message,
          stack: error.stack
        }
      })
      throw new AppError(500, 'Failed to add item to wishlist')
    }
  }

  async removeItem(wishlistId, userId, itemId) {
    try {
      // Get wishlist using dbClient
      const wishlist = await dbClient.getDocument('wishlists', wishlistId)

      if (!wishlist) {
        throw new AppError(404, 'Wishlist not found')
      }

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Not authorized to modify this wishlist')
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
      
      // Update wishlist using dbClient
      await dbClient.updateDocument('wishlists', wishlistId, wishlist)

      return null
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to remove item from wishlist:', error)
      throw new AppError(500, 'Failed to remove item from wishlist')
    }
  }

  async shareWishlist(wishlistId, userId, targetUserId) {
    try {
      // Get wishlist to verify it exists and check ownership
      const wishlist = await dbClient.getDocument('wishlists', wishlistId)
      if (!wishlist) {
        throw new AppError(404, 'Wishlist not found')
      }

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Only the owner can share the wishlist')
      }

      // Validate targetUserId
      if (!targetUserId || typeof targetUserId !== 'string') {
        throw new AppError(400, 'Invalid target user ID')
      }

      // Check if user exists
      const targetUser = await dbClient.getDocument('users', targetUserId)
      if (!targetUser) {
        throw new AppError(404, 'Target user not found')
      }

      // Check if already shared
      if (wishlist.sharedWith.includes(targetUserId)) {
        throw new AppError(400, 'Wishlist already shared with this user')
      }

      // Add target user to sharedWith array
      wishlist.sharedWith.push(targetUserId)
      wishlist.updatedAt = new Date().toISOString()

      // Update wishlist
      const result = await dbClient.updateDocument('wishlists', wishlistId, wishlist)
      return {
        ...wishlist,
        _rev: result.rev
      }
    } catch (error) {
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

  async updateItem(wishlistId, userId, itemId, updateData) {
    try {
      // Get wishlist to verify it exists and check ownership
      const wishlist = await dbClient.getDocument('wishlists', wishlistId)
      if (!wishlist) {
        throw new AppError(404, 'Wishlist not found')
      }

      if (wishlist.userId !== userId) {
        throw new AppError(403, 'Not authorized to modify this wishlist')
      }

      // Find the item
      const item = wishlist.items.find(item => item._id === itemId)
      if (!item) {
        throw new AppError(404, 'Item not found')
      }

      logger.debug('Updating item:', { 
        wishlistId, 
        itemId, 
        currentItem: item,
        updateData 
      })

      // If URL is being updated and name is not provided, try to extract name
      if (updateData.url && !updateData.name && updateData.url !== item.url) {
        const extractedName = await browserService.extractNameFromUrl(updateData.url)
        if (extractedName) {
          updateData.name = extractedName
          logger.debug('Using extracted name:', { name: updateData.name })
        }
      }

      // Update item fields
      if (updateData.name) item.name = updateData.name
      if (updateData.url) item.url = updateData.url
      if (updateData.quantity) item.quantity = updateData.quantity

      // Update timestamp
      item.updatedAt = new Date().toISOString()
      wishlist.updatedAt = new Date().toISOString()

      // Update wishlist in database
      await dbClient.updateDocument('wishlists', wishlistId, wishlist)

      logger.info('Item updated successfully:', {
        wishlistId,
        itemId: item._id,
        name: item.name
      })

      return item
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to update item in wishlist:', {
        wishlistId,
        itemId,
        updateData,
        error: {
          message: error.message,
          stack: error.stack
        }
      })
      throw new AppError(500, 'Failed to update item in wishlist')
    }
  }
}

module.exports = new WishlistService() 