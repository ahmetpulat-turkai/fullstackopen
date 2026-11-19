import { test, describe, before, after, beforeEach } from 'node:test'
import assert from 'node:assert'
import mongoose from 'mongoose'
import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import app, { connectDb } from '../app.js'
import Blog from '../models/blog.js'
import User from '../models/user.js'

const api = supertest(app)
let mongod
let token
let otherToken

const initialBlogs = [
  { title: 'HTML is easy', author: 'A. Author', url: 'http://a/1', likes: 3 },
  { title: 'Browser can execute only JavaScript', author: 'B. Author', url: 'http://b/2', likes: 8 }
]

before(async () => {
  mongod = await MongoMemoryServer.create()
  await connectDb(mongod.getUri('bloglist_test'))
})

after(async () => {
  await mongoose.connection.close()
  await mongod.stop()
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  await api.post('/api/users').send({ username: 'root', name: 'Root', password: 'sekret' })
  await api.post('/api/users').send({ username: 'other', name: 'Other', password: 'sekret' })
  token = (await api.post('/api/login').send({ username: 'root', password: 'sekret' })).body.token
  otherToken = (await api.post('/api/login').send({ username: 'other', password: 'sekret' })).body.token
  for (const blog of initialBlogs) {
    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(blog)
  }
})

describe('viewing blogs', () => {
  test('blogs are returned as json with the right amount', async () => {
    const response = await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
    assert.strictEqual(response.body.length, initialBlogs.length)
  })

  test('blogs have an id field instead of _id', async () => {
    const response = await api.get('/api/blogs')
    assert.ok(response.body[0].id)
    assert.strictEqual(response.body[0]._id, undefined)
  })
})

describe('adding blogs', () => {
  test('a valid blog can be added', async () => {
    const newBlog = { title: 'Async/await', author: 'C. Author', url: 'http://c/3', likes: 1 }
    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(201)
    const blogs = (await api.get('/api/blogs')).body
    assert.strictEqual(blogs.length, initialBlogs.length + 1)
    assert.ok(blogs.map((b) => b.title).includes('Async/await'))
  })

  test('likes defaults to 0', async () => {
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'No likes', author: 'D', url: 'http://d/4' })
      .expect(201)
    assert.strictEqual(response.body.likes, 0)
  })

  test('blog without title or url gets 400', async () => {
    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send({ author: 'E', url: 'http://e' }).expect(400)
    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send({ title: 'T', author: 'E' }).expect(400)
  })

  test('adding without a token gets 401', async () => {
    await api.post('/api/blogs').send({ title: 'T', author: 'E', url: 'http://e' }).expect(401)
  })
})

describe('deleting and updating blogs', () => {
  test('the creator can delete a blog', async () => {
    const blogs = (await api.get('/api/blogs')).body
    await api.delete(`/api/blogs/${blogs[0].id}`).set('Authorization', `Bearer ${token}`).expect(204)
    const after = (await api.get('/api/blogs')).body
    assert.strictEqual(after.length, initialBlogs.length - 1)
  })

  test('another user cannot delete the blog', async () => {
    const blogs = (await api.get('/api/blogs')).body
    await api.delete(`/api/blogs/${blogs[0].id}`).set('Authorization', `Bearer ${otherToken}`).expect(403)
  })

  test('likes of a blog can be updated', async () => {
    const blogs = (await api.get('/api/blogs')).body
    const target = blogs[0]
    const response = await api.put(`/api/blogs/${target.id}`).send({ ...target, user: undefined, likes: 99 }).expect(200)
    assert.strictEqual(response.body.likes, 99)
  })
})

describe('users', () => {
  test('creation fails with a short password', async () => {
    const result = await api.post('/api/users').send({ username: 'newuser', name: 'N', password: 'ab' }).expect(400)
    assert.ok(result.body.error.includes('password'))
  })

  test('creation fails with a short or duplicate username', async () => {
    await api.post('/api/users').send({ username: 'ab', name: 'N', password: 'abcd' }).expect(400)
    await api.post('/api/users').send({ username: 'root', name: 'N', password: 'abcd' }).expect(400)
  })

  test('login fails with a wrong password', async () => {
    await api.post('/api/login').send({ username: 'root', password: 'wrong' }).expect(401)
  })

  test('users list contains the blogs of a user', async () => {
    const users = (await api.get('/api/users')).body
    const root = users.find((u) => u.username === 'root')
    assert.strictEqual(root.blogs.length, initialBlogs.length)
    assert.strictEqual(root.passwordHash, undefined)
  })
})
