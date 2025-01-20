const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dbClient = require('../../db/client')
const { AppError } = require('../../middleware/error-handler')
const logger = require('../../utils/logger')
const config = require('../../config')

class AuthService {
  async signup(userData) {
    try {
      // Check if user already exists
      const db = dbClient.client.use('users')
      const query = {
        selector: {
          email: userData.email
        }
      }
      const result = await db.find(query)
      const existingUsers = result.docs

      if (existingUsers.length > 0) {
        throw new AppError(400, 'Email already registered')
      }

      // Create new user
      const hashedPassword = await bcrypt.hash(userData.password, 10)
      const user = {
        _id: await dbClient.getUUID(),
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        provider: 'local',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      try {
        const response = await db.insert(user)
        const createdUser = {
          ...user,
          _rev: response.rev
        }
        delete createdUser.password
        const token = jwt.sign(
          { userId: createdUser._id },
          config.get('jwt.secret'),
          { expiresIn: '7d' }
        )
        return { token, user: createdUser }
      } catch (dbError) {
        logger.error('Database error details:', {
          error: dbError,
          document: user
        })
        throw new AppError(500, 'Database operation failed')
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to create user:', error)
      throw new AppError(500, 'Failed to create user')
    }
  }

  async login(email, password) {
    try {
      const db = dbClient.client.use('users')
      const query = {
        selector: {
          email: email
        }
      }
      const result = await db.find(query)
      const user = result.docs[0]
      
      if (!user) {
        throw new AppError(401, 'Invalid credentials')
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        throw new AppError(401, 'Invalid credentials')
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        config.get('jwt.secret'),
        { expiresIn: '7d' }
      )

      return {
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name
        }
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to login user:', error)
      throw new AppError(500, 'Failed to login user')
    }
  }

  async googleAuth(profile) {
    try {
      const db = dbClient.client.use('users')
      const query = {
        selector: {
          email: profile.email
        }
      }
      const result = await db.find(query)
      let user = result.docs[0]

      if (!user) {
        // Create new user
        user = {
          _id: await dbClient.getUUID(),
          email: profile.email,
          name: profile.displayName,
          provider: 'google',
          googleId: profile.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        try {
          const response = await db.insert(user)
          user._rev = response.rev
        } catch (dbError) {
          logger.error('Database error details:', {
            error: dbError,
            document: user
          })
          throw new AppError(500, 'Database operation failed')
        }
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id },
        config.get('jwt.secret'),
        { expiresIn: '7d' }
      )

      return {
        token,
        user: {
          _id: user._id,
          email: user.email,
          name: user.name
        }
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to authenticate with Google:', error)
      throw new AppError(500, 'Failed to authenticate with Google')
    }
  }

  generateToken(userId) {
    return jwt.sign(
      { userId },
      config.get('jwt.secret'),
      { expiresIn: config.get('jwt.expiresIn') }
    )
  }
}

module.exports = new AuthService() 