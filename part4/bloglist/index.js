import app, { connectDb } from './app.js'
import config from './utils/config.js'
import logger from './utils/logger.js'

connectDb()
  .then(() => {
    logger.info('connected to MongoDB')
    app.listen(config.PORT, () => logger.info(`Server running on port ${config.PORT}`))
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
    process.exit(1)
  })
