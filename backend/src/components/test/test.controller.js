const express = require('express')
const router = express.Router()
const dbClient = require('../../db/client')
const { AppError } = require('../../middleware/error-handler')

/**
 * @swagger
 * /test:
 *   post:
 *     summary: Create a test document
 *     tags: [Test]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Hello, World!"
 *     responses:
 *       201:
 *         description: Document created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', async (req, res, next) => {
  try {
    const { message } = req.body

    if (!message) {
      throw new AppError(400, 'Message is required')
    }

    const doc = {
      type: 'test',
      message,
      createdAt: new Date().toISOString()
    }

    const result = await dbClient.createDocument(doc)
    
    res.status(201).json({
      status: 'success',
      data: {
        id: result.id,
        ...doc
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /test/{id}:
 *   get:
 *     summary: Get a test document by ID
 *     tags: [Test]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document retrieved successfully
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params
    const doc = await dbClient.getDocument(id)

    if (!doc) {
      throw new AppError(404, 'Document not found')
    }

    res.json({
      status: 'success',
      data: doc
    })
  } catch (error) {
    if (error.statusCode === 404) {
      next(new AppError(404, 'Document not found'))
    } else {
      next(error)
    }
  }
})

module.exports = router 