import 'dotenv/config'

const PORT = process.env.PORT || 3003
const MONGODB_URI = process.env.MONGODB_URI
const SECRET = process.env.SECRET || 'dev-only-secret-change-me'

export default { PORT, MONGODB_URI, SECRET }
