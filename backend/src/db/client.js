const nano = require('nano')
const config = require('../config')
const logger = require('../utils/logger')

class DatabaseClient {
  constructor() {
    const url = config.get('couchdb.url')
    const username = config.get('couchdb.username')
    const password = config.get('couchdb.password')

    this.client = nano(`${url}`)
    this.dbName = config.get('couchdb.database')
    
    if (username && password) {
      this.client = nano(`http://${username}:${password}@${url.replace('http://', '')}`)
    }
  }

  async init() {
    try {
      const dbList = await this.client.db.list()
      if (!dbList.includes(this.dbName)) {
        await this.client.db.create(this.dbName)
        logger.info(`Database ${this.dbName} created`)
      }
      this.db = this.client.use(this.dbName)
      logger.info('Database connection established')
    } catch (error) {
      logger.error('Failed to initialize database:', error)
      throw error
    }
  }

  async createDocument(doc) {
    try {
      const result = await this.db.insert(doc)
      return result
    } catch (error) {
      logger.error('Failed to create document:', error)
      throw error
    }
  }

  async getDocument(id) {
    try {
      const doc = await this.db.get(id)
      return doc
    } catch (error) {
      logger.error('Failed to get document:', error)
      throw error
    }
  }

  async getUUID() {
    try {
      const response = await this.client.request({
        db: '_uuids',
        method: 'get'
      })
      return response.uuids[0]
    } catch (error) {
      logger.error('Failed to get UUID from CouchDB:', error)
      throw error
    }
  }
}

module.exports = new DatabaseClient() 