const express = require('express')
const router = express.Router()
const wishlistService = require('./wishlist.service')
const { validateWishlist, validateItem, updateItemSchema } = require('./wishlist.validation')
const { AppError } = require('../../middleware/error-handler')
const authMiddleware = require('../../middleware/auth')
const { validationResult } = require('express-validator')

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
    const wishlistId = req.params.id;  // This is the wishlist ID from URL
    const userId = req.user.userId;     // This is the user ID from token

    const item = await wishlistService.addItem(wishlistId, userId, req.body);
    res.status(201).json(item);
  } catch (error) {
    next(error);
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
 * /wishlists/{id}/items/{itemId}:
 *   patch:
 *     summary: Update an item in wishlist
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 */
router.patch('/:id/items/:itemId', updateItemSchema, async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      throw new AppError(400, 'Validation error', errors.array())
    }

    const wishlistId = req.params.id
    const itemId = req.params.itemId
    const userId = req.user.userId
    const updateData = req.body

    const updatedItem = await wishlistService.updateItem(
      wishlistId,
      userId,
      itemId,
      updateData
    )

    res.json(updatedItem)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /wishlists/{id}/share:
 *   post:
 *     summary: Share wishlist with another user
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
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 */
router.post('/:id/share', async (req, res, next) => {
  try {
    const wishlistId = req.params.id
    const userId = req.user.userId
    const { userId: targetUserId } = req.body

    if (!targetUserId) {
      throw new AppError(400, 'Target user ID is required')
    }

    const wishlist = await wishlistService.shareWishlist(wishlistId, userId, targetUserId)
    res.status(201).json(wishlist)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /wishlists/{id}/share/{userId}:
 *   delete:
 *     summary: Remove sharing access for a user
 *     tags: [Wishlists]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/:id/share/:targetUserId', async (req, res, next) => {
  try {
    const { targetUserId } = req.params
    const userId = req.user.userId
    await wishlistService.unshareWishlist(userId, req.params.id, targetUserId)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})


module.exports = router 