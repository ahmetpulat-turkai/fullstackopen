const dummy = () => 1

const totalLikes = (blogs) => blogs.reduce((sum, blog) => sum + blog.likes, 0)

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const best = blogs.reduce((a, b) => (b.likes > a.likes ? b : a))
  return { title: best.title, author: best.author, likes: best.likes }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const counts = {}
  blogs.forEach((b) => {
    counts[b.author] = (counts[b.author] || 0) + 1
  })
  const author = Object.keys(counts).reduce((a, b) => (counts[b] > counts[a] ? b : a))
  return { author, blogs: counts[author] }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return null
  }
  const likes = {}
  blogs.forEach((b) => {
    likes[b.author] = (likes[b.author] || 0) + b.likes
  })
  const author = Object.keys(likes).reduce((a, b) => (likes[b] > likes[a] ? b : a))
  return { author, likes: likes[author] }
}

export default { dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes }
