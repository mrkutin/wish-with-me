const logger = require('../../utils/logger')
const dbClient = require('../../db/client')
const { AppError } = require('../../middleware/error-handler')

class CartService {
  async getCart(userId) {
    try {
      const query = {
        selector: {
          type: 'cart',
          userId: userId
        }
      }
      const result = await dbClient.db.find(query)
      return result.docs[0] || await this.createCart(userId)
    } catch (error) {
      logger.error('Failed to get cart:', error)
      throw new AppError(500, 'Failed to get cart')
    }
  }

  async createCart(userId) {
    try {
      const cart = {
        _id: await dbClient.getUUID(),
        type: 'cart',
        userId,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const result = await dbClient.createDocument(cart)
      return { _id: result.id, ...cart }
    } catch (error) {
      logger.error('Failed to create cart:', error)
      throw new AppError(500, 'Failed to create cart')
    }
  }

  async addItem(userId, itemData) {
    try {
      if (!itemData.wishlistId || !itemData.itemId || !itemData.url || 
          !itemData.title || !itemData.price || !itemData.currency) {
        throw new AppError(400, 'Missing required item data')
      }

      let cart = await this.getCart(userId)

      // Check if item already exists by wishlistId and itemId combination
      const existingItem = cart.items.find(item => 
        item.wishlistId === itemData.wishlistId && 
        item.itemId === itemData.itemId
      )

      let newItem
      if (existingItem) {
        // If item exists, add the incoming quantity to it
        existingItem.quantity += (itemData.quantity || 1)
        existingItem.updatedAt = new Date().toISOString()
        newItem = existingItem
      } else {
        // Add new item with quantity from wishlist item
        newItem = {
          wishlistId: itemData.wishlistId,
          itemId: itemData.itemId,
          url: itemData.url,
          title: itemData.title,
          price: itemData.price,
          currency: itemData.currency,
          quantity: itemData.quantity || 1, // Use wishlist item's quantity or default to 1
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        cart.items.push(newItem)
      }

      cart.updatedAt = new Date().toISOString()
      await dbClient.db.insert(cart)
      return newItem
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to add item to cart:', error)
      throw new AppError(500, 'Failed to add item to cart')
    }
  }

  async removeItem(userId, wishlistId, itemId) {
    try {
      const cart = await this.getCart(userId)

      // Find item by itemId (which is the wishlist item's _id)
      const itemIndex = cart.items.findIndex(item => item.itemId === itemId)
      if (itemIndex === -1) {
        throw new AppError(404, 'Item not found in cart')
      }

      const item = cart.items[itemIndex]
      if (item.quantity > 1) {
        // Decrement quantity
        item.quantity -= 1
        item.updatedAt = new Date().toISOString()
      } else {
        // Remove item completely
        cart.items.splice(itemIndex, 1)
      }

      cart.updatedAt = new Date().toISOString()
      await dbClient.db.insert(cart)
      return null
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to remove item from cart:', error)
      throw new AppError(500, 'Failed to remove item from cart')
    }
  }

  async clearCart(userId) {
    try {
      const cart = await this.getCart(userId)
      
      cart.items = []
      cart.updatedAt = new Date().toISOString()

      await dbClient.db.insert(cart)
      return null
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to clear cart:', error)
      throw new AppError(500, 'Failed to clear cart')
    }
  }
}

module.exports = new CartService() 