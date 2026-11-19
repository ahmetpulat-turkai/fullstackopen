import { Router } from 'express'
import Blog from '../models/blog.js'
import middleware from '../utils/middleware.js'

const blogsRouter = Router()

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const { title, author, url, likes } = request.body
  const user = request.user
  const blog = new Blog({ title, author, url, likes, user: user._id })
  const saved = await blog.save()
  user.blogs = user.blogs.concat(saved._id)
  await user.save()
  response.status(201).json(saved)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(204).end()
  }
  if (blog.user.toString() !== request.user._id.toString()) {
    return response.status(403).json({ error: 'only the creator can delete a blog' })
  }
  await blog.deleteOne()
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const { title, author, url, likes } = request.body
  const updated = await Blog.findByIdAndUpdate(
    request.params.id,
    { title, author, url, likes },
    { returnDocument: 'after', runValidators: true, context: 'query' }
  )
  if (!updated) {
    return response.status(404).end()
  }
  response.json(updated)
})

export default blogsRouter
