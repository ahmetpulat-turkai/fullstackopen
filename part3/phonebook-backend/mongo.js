// Usage: MONGODB_URI=<connection string> node mongo.js            -> list all entries
//        MONGODB_URI=<connection string> node mongo.js Name Number -> add an entry
// The connection string (with password) is read from the environment and is never stored in the repository.
import mongoose from 'mongoose'
import Person from './models/person.js'

const uri = process.env.MONGODB_URI
if (!uri) {
  console.log('give the connection string in the MONGODB_URI environment variable')
  process.exit(1)
}

mongoose.set('strictQuery', false)
await mongoose.connect(uri)

if (process.argv.length === 4) {
  const person = new Person({ name: process.argv[2], number: process.argv[3] })
  await person.save()
  console.log(`added ${person.name} number ${person.number} to phonebook`)
} else {
  const persons = await Person.find({})
  console.log('phonebook:')
  persons.forEach((p) => console.log(p.name, p.number))
}
await mongoose.connection.close()
