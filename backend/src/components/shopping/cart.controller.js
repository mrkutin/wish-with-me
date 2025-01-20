const express = require('express')
const router = express.Router()
const cartService = require('./cart.service')
const { AppError } = require('../../middleware/error-handler')
const authMiddleware = require('../../middleware/auth')

router.use(authMiddleware) // Protect all cart routes

/**
 * @swagger
 * tags:
 *   name: Shopping Cart
 *   description: Shopping cart management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       required:
 *         - wishlistId
 *         - itemId
 *         - url
 *         - title
 *         - price
 *         - currency
 *       properties:
 *         wishlistId:
 *           type: string
 *           description: ID of the wishlist containing the item
 *         itemId:
 *           type: string
 *           description: ID of the item in the wishlist
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
 * /cart:
 *   get:
 *     summary: Get user's shopping cart
 *     tags: [Shopping Cart]
 *     responses:
 *       200:
 *         description: Shopping cart retrieved successfully
 */
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user.userId
    const cart = await cartService.getCart(userId)
    res.json(cart)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add item to cart
 *     tags: [Shopping Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CartItem'
 */
router.post('/items', async (req, res, next) => {
  try {
    const userId = req.user.userId
    const item = await cartService.addItem(userId, req.body)
    res.status(201).json(item)
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /cart/items/{wishlistId}/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Shopping Cart]
 *     parameters:
 *       - in: path
 *         name: wishlistId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 */
router.delete('/items/:wishlistId/:itemId', async (req, res, next) => {
  try {
    const userId = req.user.userId
    await cartService.removeItem(userId, req.params.wishlistId, req.params.itemId)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear shopping cart
 *     tags: [Shopping Cart]
 */
router.delete('/', async (req, res, next) => {
  try {
    const userId = req.user.userId
    await cartService.clearCart(userId)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

module.exports = router 