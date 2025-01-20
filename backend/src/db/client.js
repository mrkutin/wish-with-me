const nano = require('nano')
const config = require('../config')
const logger = require('../utils/logger')

class DatabaseClient {
  constructor() {
    const url = config.get('couchdb.url')
    const username = config.get('couchdb.username')
    const password = config.get('couchdb.password')

    if (username && password) {
      this.client = nano(`http://${username}:${password}@${url.replace('http://', '')}`)
    } else {
      this.client = nano(url)
    }

    this.databases = {}
  }

  async init() {
    try {
      const dbList = await this.client.db.list()
      
      // Initialize users database
      const usersDb = config.get('couchdb.databases.users')
      if (!dbList.includes(usersDb)) {
        await this.client.db.create(usersDb)
        logger.info(`Database ${usersDb} created`)
      }
      this.databases.users = this.client.use(usersDb)

      // Initialize wishlists database
      const wishlistsDb = config.get('couchdb.databases.wishlists')
      if (!dbList.includes(wishlistsDb)) {
        await this.client.db.create(wishlistsDb)
        logger.info(`Database ${wishlistsDb} created`)
      }
      this.databases.wishlists = this.client.use(wishlistsDb)

      // Initialize carts database
      const cartsDb = config.get('couchdb.databases.carts')
      if (!dbList.includes(cartsDb)) {
        await this.client.db.create(cartsDb)
        logger.info(`Database ${cartsDb} created`)
      }
      this.databases.carts = this.client.use(cartsDb)

      logger.info('All databases initialized')
    } catch (error) {
      logger.error('Failed to initialize databases:', error)
      throw error
    }
  }

  async createDocument(database, doc) {
    try {
      const result = await this.databases[database].insert(doc)
      return result
    } catch (error) {
      logger.error(`Failed to create document in ${database}:`, error)
      throw error
    }
  }

  async getDocument(database, id) {
    try {
      const doc = await this.databases[database].get(id)
      return doc
    } catch (error) {
      if (error.statusCode === 404) {
        return null
      }
      logger.error(`Failed to get document from ${database}:`, error)
      throw error
    }
  }

  async findDocuments(database, query) {
    try {
      const result = await this.databases[database].find(query)
      return result.docs
    } catch (error) {
      logger.error(`Failed to find documents in ${database}:`, error)
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

  async destroyDocument(database, id, rev) {
    try {
      const result = await this.databases[database].destroy(id, rev)
      return result
    } catch (error) {
      if (error.statusCode === 404) {
        return null
      }
      logger.error(`Failed to destroy document in ${database}:`, error)
      throw error
    }
  }
}

module.exports = new DatabaseClient() 