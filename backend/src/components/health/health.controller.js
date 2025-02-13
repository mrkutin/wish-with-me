const express = require('express')
const router = express.Router()
const dbClient = require('../../db/client')

router.get('/', async (req, res) => {
  try {
    // Test database connection by getting server info
    await dbClient.client.request({
      method: 'get',
      path: '/'
    })

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    })
  }
})

module.exports = router 