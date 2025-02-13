const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dbClient = require('../../db/client')
const { AppError } = require('../../middleware/error-handler')
const logger = require('../../utils/logger')
const config = require('../../config')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const YandexStrategy = require('passport-yandex').Strategy
const VKontakteStrategy = require('passport-vkontakte').Strategy

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

  generateToken(userId) {
    return jwt.sign(
      { userId },
      config.get('jwt.secret'),
      { expiresIn: config.get('jwt.expiresIn') }
    )
  }

  async getCurrentUser(userId) {
    try {
      const users = await dbClient.findDocuments('users', {
        selector: {
          _id: userId
        }
      })

      if (!users || users.length === 0) {
        throw new AppError(404, 'User not found')
      }

      const user = users[0]
      // Don't send password back to client
      return {
        _id: user._id,
        email: user.email,
        name: user.name,
        provider: user.provider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    } catch (error) {
      if (error instanceof AppError) throw error
      logger.error('Failed to get current user:', error)
      throw new AppError(500, 'Failed to get current user')
    }
  }
}

// Add this to your existing auth.service.js
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL, // Must match the route exactly
    scope: ['profile', 'email']
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      // Find user by email
      const users = await dbClient.findDocuments('users', {
        selector: {
          email: profile.emails[0].value,
          provider: 'google'
        }
      })

      let user = users[0]
      
      if (!user) {
        // Create new user if doesn't exist
        const newUser = {
          _id: await dbClient.getUUID(),
          email: profile.emails[0].value,
          name: profile.displayName,
          provider: 'google',
          googleId: profile.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        const response = await dbClient.createDocument('users', newUser)
        user = {
          ...newUser,
          _rev: response.rev
        }
      }
      
      return done(null, user)
    } catch (err) {
      return done(err, null)
    }
  }
))

// Add Yandex Strategy
passport.use(new YandexStrategy({
    clientID: process.env.YANDEX_CLIENT_ID,
    clientSecret: process.env.YANDEX_CLIENT_SECRET,
    callbackURL: process.env.YANDEX_CALLBACK_URL,
    scope: ['login:email', 'login:info', 'login:avatar']
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      console.log('Yandex profile:', JSON.stringify(profile, null, 2))

      const users = await dbClient.findDocuments('users', {
        selector: {
          email: profile.emails[0].value,
          provider: 'yandex'
        }
      })

      let user = users[0]
      
      if (!user) {
        // Create new user if doesn't exist
        const newUser = {
          _id: await dbClient.getUUID(),
          email: profile.emails?.[0]?.value,
          name: profile.displayName || profile.username,
          provider: 'yandex',
          yandexId: profile.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        // Validate required fields
        if (!newUser.email) {
          return done(new Error('Email is required'), null)
        }

        const response = await dbClient.createDocument('users', newUser)
        user = {
          ...newUser,
          _rev: response.rev
        }
      }
      
      return done(null, user)
    } catch (err) {
      console.error('Yandex auth error:', err)
      return done(err, null)
    }
  }
))

// Add VK Strategy
passport.use(new VKontakteStrategy({
    clientID: process.env.VK_CLIENT_ID,
    clientSecret: process.env.VK_CLIENT_SECRET,
    callbackURL: process.env.VK_CALLBACK_URL,
    scope: ['email'],
    profileFields: ['email']
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      console.log('VK profile:', JSON.stringify(profile, null, 2))

      const users = await dbClient.findDocuments('users', {
        selector: {
          email: profile.emails[0].value,
          provider: 'vk'
        }
      })

      let user = users[0]
      
      if (!user) {
        const newUser = {
          _id: await dbClient.getUUID(),
          email: profile.emails[0].value,
          name: profile.displayName,
          provider: 'vk',
          vkId: profile.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        const response = await dbClient.createDocument('users', newUser)
        user = {
          ...newUser,
          _rev: response.rev
        }
      }
      
      return done(null, user)
    } catch (err) {
      console.error('VK auth error:', err)
      return done(err, null)
    }
  }
))

module.exports = new AuthService() 