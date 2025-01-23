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

  async extractNameFromUrl(url) {
    let page = null
    try {
      if (!url) {
        logger.error('No URL provided')
        return null
      }

      logger.debug('Starting extraction process', { url })

      page = await browserService.getPage()

      // Set up page configuration
      await page.setViewport({ width: 1920, height: 1080 })
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36')
      
      // Enable request logging
      page.on('request', request => {
        logger.debug('Outgoing request:', {
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          resourceType: request.resourceType()
        })
      })

      page.on('response', response => {
        logger.debug('Received response:', {
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        })
      })

      // Log console messages from the page
      page.on('console', msg => {
        logger.debug('Browser console:', {
          type: msg.type(),
          text: msg.text()
        })
      })

      // Log errors from the page
      page.on('pageerror', error => {
        logger.debug('Page error:', {
          message: error.message,
          stack: error.stack
        })
      })

      await page.evaluateOnNewDocument(() => {
        // Overwrite the 'navigator.webdriver' property
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined
        })

        // Add modern browser features
        window.chrome = {
          runtime: {},
          loadTimes: function() {},
          csi: function() {},
          app: {}
        }

        // Add language and platform info
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en', 'ru']
        })

        Object.defineProperty(navigator, 'plugins', {
          get: () => [
            {
              0: {
                type: "application/x-google-chrome-pdf",
                suffixes: "pdf",
                description: "Portable Document Format"
              },
              name: "Chrome PDF Plugin"
            }
          ]
        })
      })
      logger.debug('Browser fingerprinting applied')

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Ch-Ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"macOS"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      })
      logger.debug('Headers set')

      await page.setJavaScriptEnabled(true)
      logger.debug('JavaScript enabled')

      const domain = new URL(url).hostname
      await page.setCookie({
        name: 'session-check',
        value: '1',
        domain
      })
      logger.debug('Cookie set for domain:', { domain })

      logger.debug('Starting page navigation')
      const response = await page.goto(url, {
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 30000
      })
      logger.debug('Navigation complete', {
        status: response.status(),
        headers: response.headers()
      })

      const finalUrl = page.url()
      logger.debug('Final URL after redirects:', { 
        originalUrl: url,
        finalUrl,
        redirected: url !== finalUrl
      })

      // Get page content for debugging
      const content = await page.content()
      logger.debug('Page content length:', { 
        length: content.length,
        preview: content.substring(0, 500) // First 500 chars
      })

      logger.debug('Waiting for selectors')
      await Promise.race([
        page.waitForSelector('h1').then(() => logger.debug('Found h1')),
        page.waitForSelector('meta[property="og:title"]').then(() => logger.debug('Found og:title')),
        page.waitForSelector('[data-widget="webProductHeading"]').then(() => logger.debug('Found product heading')),
        new Promise(resolve => setTimeout(resolve, 5000)).then(() => logger.debug('Timeout reached'))
      ])

      const productName = await page.evaluate(() => {
        function logElement(selector, element) {
          console.log(`Found element for selector "${selector}":`, {
            text: element?.textContent,
            html: element?.outerHTML
          })
        }

        function cleanText(text) {
          return text
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/[|•\-–—].*$/, '')
            .replace(/купить.*$/i, '')
            .replace(/buy.*$/i, '')
            .replace(/в интернет.*$/i, '')
            .trim()
        }

        // Try JSON-LD first
        const jsonLdElements = document.querySelectorAll('script[type="application/ld+json"]')
        console.log('Found JSON-LD elements:', jsonLdElements.length)
        for (const element of jsonLdElements) {
          try {
            const data = JSON.parse(element.textContent)
            if (data['@type'] === 'Product' && data.name) {
              return cleanText(data.name)
            }
            // Handle array of products
            if (Array.isArray(data)) {
              const product = data.find(item => item['@type'] === 'Product')
              if (product?.name) {
                return cleanText(product.name)
              }
            }
          } catch (e) {}
        }

        // Try meta tags
        const metaSelectors = [
          'meta[property="og:title"]',
          'meta[name="title"]',
          'meta[property="product:title"]'
        ]
        for (const selector of metaSelectors) {
          const meta = document.querySelector(selector)
          if (meta?.content) {
            return cleanText(meta.content)
          }
        }

        // Try Ozon-specific selectors
        const ozonSelectors = [
          '[data-widget="webProductHeading"]',
          '.rk4 h1',
          '[data-widget="paginator"] h1',
          '[data-widget="column"] h1'
        ]
        for (const selector of ozonSelectors) {
          const element = document.querySelector(selector)
          if (element?.textContent) {
            return cleanText(element.textContent)
          }
        }

        // Try common selectors
        const commonSelectors = [
          'h1[itemprop="name"]',
          '[data-auto="productName"]',
          '.product-name',
          '.product-title',
          'h1'
        ]
        for (const selector of commonSelectors) {
          const element = document.querySelector(selector)
          if (element?.textContent) {
            return cleanText(element.textContent)
          }
        }

        // Fallback to title
        return document.title ? cleanText(document.title) : null
      })

      logger.debug('Name extraction complete', { 
        found: !!productName,
        productName 
      })

      if (productName) {
        logger.info('Successfully extracted name:', { url, name: productName })
        return productName
      }

      // URL fallback
      const urlPath = new URL(url).pathname
      const lastSegment = urlPath.split('/').filter(Boolean).pop()
      logger.debug('Attempting URL fallback', { 
        urlPath,
        lastSegment 
      })

      if (lastSegment) {
        const nameFromUrl = lastSegment
          .replace(/-/g, ' ')
          .replace(/\d+$/, '')
          .trim()
        logger.info('Extracted name from URL:', { url, name: nameFromUrl })
        return nameFromUrl
      }

      logger.warn('All extraction methods failed')
      return null

    } catch (error) {
      logger.error('Failed to extract name from URL:', {
        url,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
      return null
    } finally {
      if (page) {
        await page.close().catch(error => {
          logger.error('Error closing page:', {
            error: error.message
          })
        })
      }
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