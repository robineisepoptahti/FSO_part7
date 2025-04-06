const notesRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
require('express-async-errors')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

notesRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

notesRouter.post('/', async (request, response) => {
  if (request.token === null) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = request.user
  const blog = new Blog({
    author: request.body.author,
    title: request.body.title,
    url: request.body.url,
    likes: request.body.likes,
    user: user,
  })
  if (!blog.title || !blog.url) {
    response.status(400).end()
    return
  }
  const result = await blog.save()
  response.status(201).json(result)
})

notesRouter.delete('/:id', async (request, response) => {
  if (request.token === null) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  foundBlog = await Blog.findById(request.params.id)
  if (request.user.id.toString() !== foundBlog.user.toString()) {
    return response
      .status(401)
      .json({ error: 'invalid user for removing resource' })
  }
  const res = await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

notesRouter.put('/:id', async (request, response) => {
  try {
    const body = request.body
    const updatedBlog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      comments: body.comments,
    }
    const res = await Blog.findByIdAndUpdate(request.params.id, updatedBlog, {
      new: true,
    })
    response.json(res)
  } catch (error) {
    console.error('Error updating blog:', error)
    response.status(400).json({ error: 'invalid data' })
  }
})

module.exports = notesRouter
