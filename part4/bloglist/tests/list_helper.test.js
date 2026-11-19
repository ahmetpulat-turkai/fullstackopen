import { test, describe } from 'node:test'
import assert from 'node:assert'
import listHelper from '../utils/list_helper.js'

const blogs = [
  { _id: '1', title: 'React patterns', author: 'Michael Chan', url: 'https://reactpatterns.com/', likes: 7 },
  { _id: '2', title: 'Go To Statement Considered Harmful', author: 'Edsger W. Dijkstra', url: 'http://x/1', likes: 5 },
  { _id: '3', title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', url: 'http://x/2', likes: 12 },
  { _id: '4', title: 'First class tests', author: 'Robert C. Martin', url: 'http://x/3', likes: 10 },
  { _id: '5', title: 'TDD harms architecture', author: 'Robert C. Martin', url: 'http://x/4', likes: 0 },
  { _id: '6', title: 'Type wars', author: 'Robert C. Martin', url: 'http://x/5', likes: 2 }
]

test('dummy returns one', () => {
  assert.strictEqual(listHelper.dummy([]), 1)
})

describe('total likes', () => {
  test('of empty list is zero', () => assert.strictEqual(listHelper.totalLikes([]), 0))
  test('when list has only one blog equals the likes of that', () =>
    assert.strictEqual(listHelper.totalLikes([blogs[0]]), 7))
  test('of a bigger list is calculated right', () => assert.strictEqual(listHelper.totalLikes(blogs), 36))
})

describe('favorite blog', () => {
  test('of empty list is null', () => assert.strictEqual(listHelper.favoriteBlog([]), null))
  test('is the one with most likes', () =>
    assert.deepStrictEqual(listHelper.favoriteBlog(blogs), {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12
    }))
})

describe('most blogs', () => {
  test('of empty list is null', () => assert.strictEqual(listHelper.mostBlogs([]), null))
  test('is the author with most blogs', () =>
    assert.deepStrictEqual(listHelper.mostBlogs(blogs), { author: 'Robert C. Martin', blogs: 3 }))
})

describe('most likes', () => {
  test('of empty list is null', () => assert.strictEqual(listHelper.mostLikes([]), null))
  test('is the author with most likes', () =>
    assert.deepStrictEqual(listHelper.mostLikes(blogs), { author: 'Edsger W. Dijkstra', likes: 17 }))
})
