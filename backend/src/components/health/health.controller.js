const express = require('express')
const router = express.Router()
const dbClient = require('../../db/client')

router.get('/', async (req, res) => {
  try {
    await dbClient.db.info()
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    })
  }
})

module.exports = router 