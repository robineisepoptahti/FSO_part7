import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import blogService from './services/blogs'
import loginService from './services/login'
import Togglable from './components/Togglable'

const msg = {
  color: 'green',
  background: 'lightgrey',
  fontSize: 18,
  borderStyle: 'solid',
  borderRadius: 5,
  padding: 10,
  marginBottom: 10,
}
const error = {
  color: 'red',
  background: 'lightgrey',
  fontSize: 18,
  borderStyle: 'solid',
  borderRadius: 5,
  padding: 10,
  marginBottom: 10,
}

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  return (
    <div style={msg} className="msg">
      {message}
    </div>
  )
}

const ErrorNotification = ({ message }) => {
  if (message === null) {
    return null
  }
  return (
    <div style={error} className="error">
      {message}
    </div>
  )
}

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [newMessage, setMessage] = useState(null)
  const [newErrorMessage, setErrorMessage] = useState(null)

  const blogFormRef = useRef()
  //Hooks

  useEffect(() => {
    const fetchBlogs = async () => {
      const blogs = await blogService.getAll()
      setBlogs(blogs)
    }
    fetchBlogs()
    keepLogged()
  }, [])

  //Handlers

  const keepLogged = async () => {
    const credentialsJson = window.localStorage.getItem('loggedBlogappUser')
    if (credentialsJson) {
      const decodedCredentials = JSON.parse(credentialsJson)
      blogService.setToken(decodedCredentials.token)
      setUser(decodedCredentials)
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username,
        password,
      })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      console.log('logging in with', username, password)
    } catch (exception) {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const updateLikes = async (blog) => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
    }
    await blogService.update(blog.id, updatedBlog)
    blog.likes = blog.likes + 1
    setBlogs(
      blogs.map((blog) => (blog.id === updatedBlog.id ? updatedBlog : blog))
    )
  }

  const removeBlog = async (blog) => {
    try {
      if (blog.user.username !== user.username) {
        setErrorMessage('Only the user can remove blog')
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        return
      } else {
        if (window.confirm(`remove blog ${blog.title} by ${blog.author}`)) {
          const response = await blogService.remove(blog.id)
          if (response.status === 204) {
            setBlogs(blogs.filter((blogsInList) => blog.id !== blogsInList.id))
            setMessage(`${blog.title} removed`)
            setTimeout(() => {
              setMessage(null)
            }, 5000)
          }
        }
      }
    } catch (exception) {
      setErrorMessage('failed removing the blog')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const sendBlog = async ({ author, title, url }) => {
    try {
      const blog = await blogService.create({
        title: title,
        author: author,
        url: url,
      })
      setBlogs(blogs.concat(blog))
      setMessage(`a new blog ${blog.title} by ${blog.author} added`)
      setTimeout(() => {
        setMessage(null)
      }, 5000)
    } catch (exception) {
      setErrorMessage('wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  //Render
  if (user === null) {
    return (
      <div>
        <ErrorNotification message={newErrorMessage} />
        <LoginForm
          username={username}
          password={password}
          handleUsernameChange={({ target }) => setUsername(target.value)}
          handlePasswordChange={({ target }) => setPassword(target.value)}
          handleSubmit={handleLogin}
        />
      </div>
    )
  }

  return (
    <div>
      <h2>blogs</h2>
      <ErrorNotification message={newErrorMessage} />
      <Notification message={newMessage} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <p>{user.name} logged in</p>
        <button
          onClick={() => {
            setUser(null)
            window.localStorage.removeItem('loggedBlogappUser')
          }}
        >
          logout
        </button>
      </div>
      <h2>create new</h2>
      <Togglable buttonLabel="create" ref={blogFormRef}>
        <BlogForm handleSubmit={sendBlog} />
      </Togglable>
      {blogs
        .sort((a, b) => b.likes - a.likes)
        .map((blog) => (
          <Blog
            key={blog.id}
            blog={blog}
            updateLikes={updateLikes}
            removeBlog={removeBlog}
            user={user}
          />
        ))}
    </div>
  )
}

export default App
