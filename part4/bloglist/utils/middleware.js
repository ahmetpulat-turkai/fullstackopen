import jwt from 'jsonwebtoken'
import config from './config.js'
import User from '../models/user.js'
import logger from './logger.js'

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  request.token =
    authorization && authorization.startsWith('Bearer ') ? authorization.replace('Bearer ', '') : null
  next()
}

const userExtractor = async (request, response, next) => {
  try {
    const decoded = jwt.verify(request.token, config.SECRET)
    if (!decoded.id) {
      return response.status(401).json({ error: 'token invalid' })
    }
    const user = await User.findById(decoded.id)
    if (!user) {
      return response.status(401).json({ error: 'user not found' })
    }
    request.user = user
    next()
  } catch (error) {
    next(error)
  }
}

const errorHandler = (error, request, response, next) => {
  logger.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  if (error.name === 'MongoServerError' && error.message.includes('E11000')) {
    return response.status(400).json({ error: 'expected `username` to be unique' })
  }
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  next(error)
}

export default { unknownEndpoint, tokenExtractor, userExtractor, errorHandler }
