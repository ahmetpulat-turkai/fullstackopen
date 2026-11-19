import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from '../utils/config.js'
import User from '../models/user.js'

const loginRouter = Router()

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body
  const user = await User.findOne({ username })
  const passwordCorrect = user === null ? false : await bcrypt.compare(password || '', user.passwordHash)
  if (!(user && passwordCorrect)) {
    return response.status(401).json({ error: 'invalid username or password' })
  }
  const token = jwt.sign({ username: user.username, id: user._id }, config.SECRET, { expiresIn: 60 * 60 })
  response.status(200).send({ token, username: user.username, name: user.name })
})

export default loginRouter
