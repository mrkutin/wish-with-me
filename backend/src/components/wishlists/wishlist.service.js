const dbClient = require('../../db/client')
const { AppError } = require('../../middleware/error-handler')
const logger = require('../../utils/logger')
const browserService = require('../../services/browser.service')
const crypto = require('crypto')
const config = require('../../config')

class WishlistService {
  async createWishlist(userId, data) {
    try {
      // Get user details to include name
      const user = await dbClient.getDocument('users', userId)
      if (!user) {
        throw new AppError(404, 'User not found')
      }

      const wishlist = {
        userId,
        userName: user.name, // Add user name
        name: data.name,
        description: data.description,
        dueDate: data.dueDate,
        items: [],
        sharedWith: [],
        sharedToken: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const result = await dbClient.createDocument('wishlists', wishlist)
      return {
        ...wishlist,
        _id: result.id,
        _rev: result.rev
      }
    } catch (error) {
      logger.error(`Failed to create wishlist: ${error.message}`)
      throw new AppError(500, 'Failed to create wishlist')
    }
  }

  async getWishlists(userId) {
    try {
      const db = dbClient.client.use('wishlists')
      const result = await db.find({
        selector: { userId },
        use_index: "user-id-index",
        sort: [{'userId': 'asc'}]
      })
      
      return result.docs.sort((a, b) => {
        // Handle wishlists without due dates
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1; // Push to bottom
        if (!b.dueDate) return -1; // Keep a above b
        
        const dateA = new Date(a.dueDate);
        const dateB = new Date(b.dueDate);
        return dateA - dateB; // Ascending order
      });
    } catch (error) {
      logger.error(`Failed to get wishlists: ${error.message}`)
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

      // Check if user owns or has access to the wishlist
      const hasAccess = wishlist.userId === userId || 
        (wishlist.sharedWith && wishlist.sharedWith.some(share => share.userId === userId))
        
      if (!hasAccess) {
        throw new AppError(403, 'Access denied')
      }

      return wishlist
    } catch (error) {
      if (error.statusCode === 404) {
        throw new AppError(404, 'Wishlist not found')
      }
      if (error instanceof AppError) throw error
      logger.error(`Failed to get wishlist: ${error.message}`)
      throw new AppError(500, 'Failed to get wishlist')
    }
  }

  async updateWishlist(wishlistId, userId, data) {
    try {
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
        dueDate: data.dueDate || wishlist.dueDate,
        items: data.items || wishlist.items,
        sharedWith: data.sharedWith || wishlist.sharedWith,
        updatedAt: new Date().toISOString()
      }

      const result = await dbClient.updateDocument('wishlists', wishlistId, updatedWishlist)
      
      return {
        ...updatedWishlist,
        _rev: result.rev
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`Failed to update wishlist: ${error.message}`)
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
      logger.error(`Failed to delete wishlist: ${error.message}`)
      throw new AppError(500, 'Failed to delete wishlist')
    }
  }

  async addItem(userId, wishlistId, itemData) {
    try {
      const wishlist = await this.getWishlistById(wishlistId, userId);
      
      // Preserve existing fields during update
      const updatedWishlist = {
        ...wishlist, // Maintain all existing properties
        items: [...wishlist.items], 
        updatedAt: new Date().toISOString()
      };

      // Validate required fields
      if (!itemData.name) {
        throw new AppError(400, 'Item name is required')
      }

      // Create new item with validated data
      const newItem = {
        _id: await dbClient.getUUID(),
        name: itemData.name.trim(),
        url: itemData.url?.trim(),
        price: itemData.price ? Number(itemData.price) : undefined,
        currency: itemData.currency?.trim()?.toUpperCase(),
        image: itemData.image?.trim(),
        bought: itemData.bought || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Remove undefined fields
      Object.keys(newItem).forEach(key => 
        newItem[key] === undefined && delete newItem[key]
      )

      updatedWishlist.items.push(newItem)
      updatedWishlist.updatedAt = new Date().toISOString()

      try {
        await dbClient.updateDocument('wishlists', wishlistId, updatedWishlist)
        return newItem
      } catch (dbError) {
        logger.error(`Database error while adding item: ${dbError.message}`)
        throw new AppError(500, 'Failed to save item to database')
      }

    } catch (error) {
      if (error instanceof AppError) throw error
      
      logger.error('Failed to add item to wishlist:', {
        wishlistId,
        userId,
        error: error.message,
        stack: error.stack,
        itemData: JSON.stringify(itemData)
      })
      
      throw new AppError(500, 'An unexpected error occurred while adding the item')
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
      logger.error(`Failed to remove item from wishlist: ${error.message}`)
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
      logger.error(`Failed to share wishlist: ${error.message}`)
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

      const sharedUserIndex = wishlist.sharedWith.findIndex(share => share.userId === targetUserId)
      if (sharedUserIndex === -1) {
        throw new AppError(400, 'Wishlist is not shared with this user')
      }

      // Remove target user from sharedWith array
      wishlist.sharedWith.splice(sharedUserIndex, 1)
      wishlist.updatedAt = new Date().toISOString()

      try {
        const response = await db.insert(wishlist)
        return {
          ...wishlist,
          _rev: response.rev
        }
      } catch (dbError) {
        logger.error(`Database error details: ${dbError.message}`)
        throw new AppError(500, 'Database operation failed')
      }
    } catch (error) {
      if (error.statusCode === 404) {
        throw new AppError(404, 'Wishlist not found')
      }
      if (error instanceof AppError) throw error
      logger.error(`Failed to unshare wishlist: ${JSON.stringify(error)}`)
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

      logger.debug(`Updating item: ${JSON.stringify({ 
        wishlistId, 
        itemId, 
        currentItem: item,
        updateData 
      })}`)

      // If URL is being updated and name is not provided, try to extract name
      if (updateData.url && !updateData.name && updateData.url !== item.url) {
        const extractedName = await browserService.extractNameFromUrl(updateData.url)
        if (extractedName) {
          updateData.name = extractedName
          logger.debug(`Using extracted name: ${JSON.stringify({ name: updateData.name })}`)
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

      logger.info(`Item updated successfully: ${JSON.stringify({
        wishlistId,
        itemId: item._id,
        name: item.name
      })}`)

      return item
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error(`Failed to update item in wishlist: ${error.message}`)
      throw new AppError(500, 'Failed to update item in wishlist')
    }
  }

  async getWishlistByToken(token) {
    try {
      const db = dbClient.client.use('wishlists')
      const result = await db.find({
        selector: { sharedToken: token },
        limit: 1
      })
      return result.docs[0] || null
    } catch (error) {
      throw new AppError(500, `Failed to fetch shared wishlist: ${error.message}`)
    }
  }

  async shareWishlistByToken(sharedToken, targetUserId) {
    try {
      // Get wishlist by token
      const db = dbClient.client.use('wishlists')
      const result = await db.find({
        selector: { sharedToken },
        limit: 1
      })
      
      const wishlist = result.docs[0]
      if (!wishlist) {
        throw new AppError(404, 'Wishlist not found')
      }

      // Validate targetUserId
      if (!targetUserId) {
        throw new AppError(400, 'Target user ID is required')
      }

      // Check if user exists and get their name
      const targetUser = await dbClient.getDocument('users', targetUserId)
      if (!targetUser) {
        throw new AppError(404, 'Target user not found')
      }

      // Create updated wishlist object
      const updatedWishlist = {
        ...wishlist,
        sharedWith: wishlist.sharedWith || [], // Ensure array exists
        updatedAt: new Date().toISOString()
      }

      // Add user to sharedWith if not already present
      const isAlreadyShared = updatedWishlist.sharedWith.some(share => 
        share.userId === targetUserId
      )

      if (!isAlreadyShared) {
        updatedWishlist.sharedWith.push({
          userId: targetUserId,
          name: targetUser.name
        })
        
        try {
          const res = await dbClient.updateDocument('wishlists', wishlist._id, updatedWishlist)
          logger.info('Wishlist shared successfully:', {
            wishlistId: wishlist._id,
            targetUserId,
            targetUserName: targetUser.name
          })
        } catch (dbError) {
          logger.error(`Database error while sharing wishlist: ${dbError.message}`)
          throw new AppError(500, 'Failed to update wishlist sharing')
        }
      }

      return updatedWishlist
    } catch (error) {
      if (error instanceof AppError) throw error
      
      logger.error('Failed to share wishlist by token:', {
        sharedToken,
        targetUserId,
        error: error.message,
        stack: error.stack
      })
      
      throw new AppError(500, 'An unexpected error occurred while sharing the wishlist')
    }
  }

  async getSharedWishlists(userId) {
    try {
      const db = dbClient.client.use('wishlists')
      const result = await db.find({
        selector: {
          sharedWith: {
            $elemMatch: {
              userId: userId
            }
          }
        },
        use_index: "shared-with-index"
      })
      
      return result.docs
    } catch (error) {
      logger.error(`Failed to get shared wishlists: ${error.message}`)
      throw new AppError(500, 'Failed to get shared wishlists')
    }
  }

  async updateWishlistItem(wishlistId, itemId, updates) {
    try {
      const wishlist = await dbClient.getDocument('wishlists', wishlistId)
      if (!wishlist) {
        throw new AppError(404, 'Wishlist not found')
      }

      const itemIndex = wishlist.items.findIndex(item => item._id === itemId)
      if (itemIndex === -1) {
        throw new AppError(404, 'Item not found')
      }

      // Ensure we keep all existing fields and only update what's provided
      const existingItem = wishlist.items[itemIndex]
      const updatedItem = {
        _id: existingItem._id,
        name: updates.name || existingItem.name,
        url: updates.url || existingItem.url,
        price: updates.price || existingItem.price,
        currency: updates.currency || existingItem.currency,
        image: updates.image || existingItem.image,
        bought: typeof updates.bought === 'boolean' ? updates.bought : existingItem.bought,
        createdAt: existingItem.createdAt,
        updatedAt: new Date().toISOString()
      }

      wishlist.items[itemIndex] = updatedItem

      const result = await dbClient.updateDocument('wishlists', wishlistId, wishlist)

      return {
        ...wishlist,
        _rev: result.rev
      }
    } catch (error) {
      logger.error(`Failed to update wishlist item: ${error.message}`)
      throw error
    }
  }
}

module.exports = new WishlistService() 