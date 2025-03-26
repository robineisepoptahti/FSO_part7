const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs')
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body
  //Adding blog id to array
  console.log('shit')
  //const blog = await Blog.find({})
  const blogs = []
  //blogs.push(blog[0]._id)
  console.log('shittton')
  if (!password || password.length < 3) {
    return response
      .status(400)
      .json({ error: 'Password must be at least 3 characters long' })
  }
  console.log('shitshit')

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  const user = new User({
    username,
    name,
    passwordHash,
    blogs,
  })
  console.log('shitfuck')
  const savedUser = await user.save()
  response.status(201).json(savedUser)
})

module.exports = usersRouter
