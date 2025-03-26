const notesRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const testingRouter = require('./controllers/testing')
const express = require('express')
const app = express()
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const cors = require('cors')
const mongoose = require('mongoose')
const loginRouter = require('./controllers/login')

MONGODB_URI = config.MONGODB_URI

const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl)

app.use(cors())
app.use(express.json())
app.use(middleware.tokenExtractor, notesRouter)
app.use(middleware.userExtractor, notesRouter)
app.use('/api/blogs', notesRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

if (process.env.NODE_ENV === 'test') {
  app.use('/api/testing', testingRouter)
}

app.use(middleware.errorHandler)

module.exports = app
