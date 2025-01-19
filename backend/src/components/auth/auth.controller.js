const express = require('express')
const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

// TODO: Implement authentication routes
router.post('/signup', async (req, res, next) => {
  // Implementation coming soon
})

router.post('/login', async (req, res, next) => {
  // Implementation coming soon
})

router.post('/google', async (req, res, next) => {
  // Implementation coming soon
})

module.exports = router 