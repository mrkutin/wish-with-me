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
      const existingUsers = await dbClient.findDocuments('users', {
        selector: {
          email: userData.email
        }
      })

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

      // Use dbClient to create user
      const response = await dbClient.createDocument('users', user)
      const createdUser = {
        ...user,
        _rev: response.rev
      }
      delete createdUser.password

      // Generate token
      const token = jwt.sign(
        { userId: createdUser._id },
        config.get('jwt.secret'),
        { expiresIn: '7d' }
      )

      return { token, user: createdUser }

    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to create user:', error)
      throw new AppError(500, 'Failed to create user')
    }
  }

  async login(email, password) {
    try {
      // Find user by email
      const users = await dbClient.findDocuments('users', {
        selector: { email }
      })

      if (!users || users.length === 0) {
        throw new AppError(401, 'Invalid email or password')
      }

      const user = users[0]

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        throw new AppError(401, 'Invalid email or password')
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id },
        config.get('jwt.secret'),
        { expiresIn: '7d' }
      )

      // Return both token and user info (without password)
      const userResponse = {
        _id: user._id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }

      return { token, user: userResponse }
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