import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose'
import Person from './models/person.js'

const app = express()

app.use(express.static('dist'))
app.use(express.json())

morgan.token('body', (req) => (req.method === 'POST' ? JSON.stringify(req.body) : ''))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

mongoose.set('strictQuery', false)

export const connect = (uri = process.env.MONGODB_URI) => {
  if (!uri) {
    console.log('MONGODB_URI is not set')
    process.exit(1)
  }
  return mongoose
    .connect(uri)
    .then(() => console.log('connected to MongoDB'))
    .catch((error) => {
      console.log('error connecting to MongoDB:', error.message)
      process.exit(1)
    })
}

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => response.json(persons))
    .catch(next)
})

app.get('/info', (request, response, next) => {
  Person.countDocuments({})
    .then((count) => {
      response.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`)
    })
    .catch(next)
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(next)
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(next)
})

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body
  if (!name || !number) {
    return response.status(400).json({ error: 'name or number is missing' })
  }
  new Person({ name, number })
    .save()
    .then((saved) => response.status(201).json(saved))
    .catch(next)
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body
  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { returnDocument: 'after', runValidators: true, context: 'query' }
  )
    .then((updated) => {
      if (updated) {
        response.json(updated)
      } else {
        response.status(404).end()
      }
    })
    .catch(next)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

export default app

if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  connect().then(() => {
    const PORT = process.env.PORT || 3001
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
}
