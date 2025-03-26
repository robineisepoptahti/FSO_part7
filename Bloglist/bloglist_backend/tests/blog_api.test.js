const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const assert = require('node:assert')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

const initialBlogs = [
  {
    title: 'Book1',
    author: 'Darwin1',
    url: 'url1',
    likes: 1,
  },
  {
    title: 'Book2',
    author: 'Darwin2',
    url: 'url2',
    likes: 2,
  },
]

const initialUsers = [
  {
    username: 'mikael',
    name: 'Mika Waltari',
    password: 'salasana',
  },
  {
    username: 'tauriel',
    name: 'Tauriel Waltari',
    password: 'salasana',
  },
]

const blogToPost = {
  title: 'Book3',
  author: 'Darwin3',
  url: 'url3',
  likes: 3,
}

const likelessBlog = {
  title: 'Book4',
  author: 'Darwin4',
  url: 'url4',
}
const titlelessBlog = {
  author: 'Darwin4',
  url: 'url4',
}

const updateBlog = {
  title: 'Book1',
  author: 'Darwin1',
  url: 'url1',
  likes: 20,
}

describe('API tests (initially 2 blogs saved)', () => {
  let token
  beforeEach(async () => {
    //await Blog.deleteMany({})
    await User.deleteMany({})
    await Blog.deleteMany({})

    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()

    await api
      .post('/api/users')
      .send({ username: 'mikael', name: 'Mika Waltari', password: 'salasana' })

    await api
      .post('/api/users')
      .send({
        username: 'tauriel',
        name: 'Tauriel Waltari',
        password: 'salasana',
      })

    await Blog.deleteMany({})

    const res = await api
      .post('/api/login')
      .send({ username: 'mikael', name: 'Mika Waltari', password: 'salasana' })
    token = res.body.token

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(initialBlogs[0])

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(initialBlogs[1])
  })

  test('right amount of blogs are returned as json', async () => {
    const res = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.equal(res.body.length, 2)
  })

  test('check if id is defined in response', async () => {
    res = await api.get('/api/blogs')
    res.body.forEach((blog) => assert(blog.id))
  })

  test('post 1 blog', async () => {
    //Here we are getting the length before adding
    const res_len = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    //adding 1 blog.
    const res_new_len = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogToPost)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(res_new_len.body.title, blogToPost.title)
    assert.strictEqual(res_new_len.body.url, blogToPost.url)
    assert.strictEqual(res_new_len.body.likes, blogToPost.likes)
    assert.strictEqual(res_new_len.body.author, blogToPost.author)

    //Getting the updated list of blogs
    const post_res_len = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(res_len.body.length + 1, post_res_len.body.length)
  })

  test('posting without token', async () => {
    //Here we are getting the length before adding
    const res_len = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    //adding 1 blog.
    const res_new_len = await api
      .post('/api/blogs')
      .send(blogToPost)
      .expect(401)
      .expect('Content-Type', /application\/json/)
    //Getting the updated list of blogs
    const post_res_len = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(res_len.body.length, post_res_len.body.length)
  })

  test('test if likes is 0 when not defined', async () => {
    //Cleaning the database
    await Blog.deleteMany({})
    //Adding a blog without likes
    const res = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(likelessBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(res.body.likes, 0)
  })

  test('test if status code 400 is returned when post has no title or url.', async () => {
    const res = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(titlelessBlog)
      .expect(400)
  })
})

describe('API tests for deleting', () => {
  let token
  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})

    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()

    await api
      .post('/api/users')
      .send({ username: 'mikael', name: 'Mika Waltari', password: 'salasana' })

    await Blog.deleteMany({})

    const res = await api
      .post('/api/login')
      .send({ username: 'mikael', name: 'Mika Waltari', password: 'salasana' })
    token = res.body.token

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(initialBlogs[0])

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(initialBlogs[1])
  })

  test('delete a blog', async () => {
    //Get the blogs and id:s
    const res = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    //Delete the first blog
    await api
      .delete(`/api/blogs/${res.body[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)
    //Get the bloglist to check the length
    const res_len = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(res_len.body.length, 1)
  })

  test('trying to delete with invalid token', async () => {
    //Get the blogs and id:s
    const res = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    //Delete the first blog
    await api
      .delete(`/api/blogs/${res.body[0].id}`)
      .set(
        'Authorization',
        `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InplcnZvIiwiaWQiOiI2N2IzMWNkZTk0YTEyOTAwYTI3OTUwNzgiLCJpYXQiOjE3Mzk4NzEyNzZ9.hs1XfTx64Y5csS-49tFiBpvenymDPbCRzkT3tCed3WY`
      )
      .expect(401)
    //Get the bloglist to check the length
    const res_len = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(res_len.body.length, 2)
  })

  test('trying to delete without any token', async () => {
    //Get the blogs and id:s
    const res = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    //Delete the first blog
    await api.delete(`/api/blogs/${res.body[0].id}`).expect(401)
    //Get the bloglist to check the length
    const res_len = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
    assert.strictEqual(res_len.body.length, 2)
  })
})

describe('API  tests for updating', () => {
  test('checks if response matches update', async () => {
    //Get the blogs and id:s
    const res = await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const updated_res = await api
      .put(`/api/blogs/${res.body[0].id}`)
      .send(updateBlog)
      .expect(200)
    assert.strictEqual(updated_res.body.likes, updateBlog.likes)
  })
})

describe('when there is initially one user at db', () => {
  let token
  beforeEach(async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})

    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()

    await api
      .post('/api/users')
      .send({ username: 'mikael', name: 'Mika Waltari', password: 'salasana' })

    await Blog.deleteMany({})

    const res = await api
      .post('/api/login')
      .send({ username: 'mikael', name: 'Mika Waltari', password: 'salasana' })
    token = res.body.token

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(initialBlogs[0])

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(initialBlogs[1])
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mikael',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('password too short', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'sa',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(
      result.body.error.includes('Password must be at least 3 characters long')
    )

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})
