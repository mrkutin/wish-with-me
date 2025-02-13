const express = require('express')
const router = express.Router()
const wishlistService = require('./wishlist.service')
const { validateWishlist, validateItem, updateItemSchema } = require('./wishlist.validation')
const { AppError } = require('../../middleware/error-handler')
const authMiddleware = require('../../middleware/auth')
const { validationResult } = require('express-validator')
const browserService = require('../../services/browser.service')
const logger = require('../../utils/logger')

router.use(authMiddleware) // Protect all wishlist routes


/**
 * @swagger
 * tags:
 *   name: Wishlists
 *   description: Wishlist management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Wishlist:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the wishlist
 *         description:
 *           type: string
 *           description: Optional description of the wishlist
 *     WishlistItem:
 *       type: object
 *       required:
 *         - url
 *         - title
 *         - price
 *         - currency
 *       properties:
 *         url:
 *           type: string
 *           description: URL of the item
 *         title:
 *           type: string
 *           description: Title of the item
 *         price:
 *           type: number
 *           description: Price of the item
 *         currency:
 *           type: string
 *           description: Currency code (e.g., USD)
 */

/**
 * @swagger
 * /wishlists:
 *   post:
 *     summary: Create a new wishlist
 *     tags: [Wishlists]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Wishlist'
 *     responses:
 *       201:
 *         description: Wishlist created successfully
 */
router.post('/', validateWishlist, async (req, res, next) => {
  try {
    const userId = req.user.userId
    const wishlist = await wishlistService.createWishlist(userId, req.body)
    res.status(201).json(wishlist)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /wishlists:
 *   get:
 *     summary: Get all wishlists for the user
 *     tags: [Wishlists]
 *     responses:
 *       200:
 *         description: List of wishlists
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.userId
    const wishlists = await wishlistService.getWishlists(userId)
    res.json(wishlists)
  } catch (error) {
    next(error)
  }
})

// Get wishlists shared with the user
router.get('/shared', async (req, res, next) => {
  try {
    const userId = req.user.userId
    const wishlists = await wishlistService.getSharedWishlists(userId)
    res.json(wishlists)
  } catch (error) {
    next(error)
  }
})


/**
 * @swagger
 * /wishlists/{id}:
 *   get:
 *     summary: Get a specific wishlist
 *     tags: [Wishlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.user.userId
    const wishlist = await wishlistService.getWishlistById(userId, req.params.id)
    res.json(wishlist)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /wishlists/{id}:
 *   put:
 *     summary: Update a wishlist
 *     tags: [Wishlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Wishlist'
 */
router.put('/:id', validateWishlist, async (req, res, next) => {
  try {
    const userId = req.user.userId
    const wishlist = await wishlistService.updateWishlist(userId, req.params.id, req.body)
    res.json(wishlist)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /wishlists/{id}:
 *   patch:
 *     summary: Update a wishlist
 *     tags: [Wishlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const wishlistId = req.params.id
    const userId = req.user.userId
    const updatedWishlist = await wishlistService.updateWishlist(wishlistId, userId, req.body)
    res.json(updatedWishlist)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /wishlists/{id}:
 *   delete:
 *     summary: Delete a wishlist
 *     tags: [Wishlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user.userId // Get from auth middleware
    await wishlistService.deleteWishlist(userId, req.params.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /wishlists/resolve-item:
 *   post:
 *     summary: Resolve item details from URL
 *     tags: [Wishlists]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL of the item to resolve
 *     responses:
 *       200:
 *         description: Item details resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                 currency:
 *                   type: string
 *                 image:
 *                   type: string
 *       400:
 *         description: Invalid URL or unsupported marketplace
 *       500:
 *         description: Server error
 */
router.post('/resolve-item', async (req, res, next) => {
  try {
    const { url } = req.body
    
    if (!url) {
      throw new AppError(400, 'URL is required')
    }

    const itemDetails = await browserService.extractItemInfoByUrl(url)
    
    if (!itemDetails) {
      throw new AppError(400, 'Could not resolve item details from URL')
    }

    res.json(itemDetails)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /wishlists/{id}/items:
 *   post:
 *     summary: Add an item to wishlist
 *     tags: [Wishlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WishlistItem'
 */
router.post('/:id/items', validateItem, async (req, res, next) => {
  try {
    const wishlistId = req.params.id
    const userId = req.user.userId
    const { name, url, price, currency, image } = req.body

    logger.debug('Adding item to wishlist:', {
      wishlistId,
      userId,
      itemData: { name, url, price, currency }
    })

    const itemData = {
      name,
      url,
      price,
      currency,
      image,
      bought: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const item = await wishlistService.addItem(wishlistId, userId, itemData)
    
    logger.info('Item added successfully:', {
      wishlistId,
      itemId: item._id,
      name: item.name
    })
    
    res.status(201).json(item)
  } catch (error) {
    if (error instanceof AppError) {
      logger.warn('Failed to add item:', {
        message: error.message,
        statusCode: error.statusCode
      })
      next(error)
    } else {
      logger.error('Unexpected error while adding item:', error)
      next(new AppError(500, 'An unexpected error occurred'))
    }
  }
})

/**
 * @swagger
 * /wishlists/{id}/items/{itemId}:
 *   delete:
 *     summary: Remove an item from wishlist
 *     tags: [Wishlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id/items/:itemId', async (req, res, next) => {
  try {
    const wishlistId = req.params.id
    const itemId = req.params.itemId
    const userId = req.user.userId

    await wishlistService.removeItem(wishlistId, userId, itemId)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /wishlists/wishlists/share/:token:
 *   get:
 *     summary: Get a wishlist by token
 *     tags: [Wishlists]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Wishlist found successfully
 *       404:
 *         description: Wishlist not found
 */
router.get('/get-by-token/:token', async (req, res) => {
  try {
    const wishlist = await wishlistService.getWishlistByToken(req.params.token)
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' })
    }
    res.json(wishlist)
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Share a wishlist with another user
router.post('/:token/follow', async (req, res, next) => {
  try {
    const sharedToken = req.params.token
    const { targetUserId } = req.body

    // Find wishlist by sharedToken instead of _id
    const updatedWishlist = await wishlistService.shareWishlistByToken(sharedToken, targetUserId)
    res.json(updatedWishlist)
  } catch (error) {
    next(error)
  }
})

// Unshare a wishlist from another user
router.post('/:id/unfollow', async (req, res, next) => {
  try {
    const userId = req.user.userId
    const wishlistId = req.params.id

    // When unfollowing, the current user is the target user
    const updatedWishlist = await wishlistService.unshareWishlist(userId, wishlistId, userId)
    res.json(updatedWishlist)
  } catch (error) {
    next(error)
  }
})

router.patch('/:wishlistId/items/:itemId', authMiddleware, async (req, res) => {
  try {
    const { wishlistId, itemId } = req.params
    const { name, url, price, currency, priority, notes, bought } = req.body

    const updatedWishlist = await wishlistService.updateWishlistItem(
      wishlistId, 
      itemId,
      { name, url, price, currency, priority, notes, bought }
    )

    res.json(updatedWishlist)
  } catch (error) {
    handleError(error, res)
  }
})

module.exports = router 