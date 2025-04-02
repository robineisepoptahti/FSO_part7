import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import blogService from './services/blogs'
import loginService from './services/login'
import Togglable from './components/Togglable'
import { useSelector, useDispatch } from 'react-redux'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

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

const Notification = () => {
  const message = useSelector((state) => state.messages)
  if (message === '') {
    return null
  }

  return (
    <div style={msg} className="msg">
      {message}
    </div>
  )
}

const ErrorNotification = () => {
  const message = useSelector((state) => state.errorMessages)
  console.log(`${message}`)
  if (message === '') {
    return null
  }
  return (
    <div style={error} className="error">
      {message}
    </div>
  )
}

const App = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const blogFormRef = useRef()

  //Hooks
  const dispatch = useDispatch()
  const blogsList = useSelector((state) => state.blogsList)
  const user = useSelector((state) => state.user)
  const users = useSelector((state) => state.users)

  useEffect(() => {
    const fetchBlogs = async () => {
      const blogs = await blogService.getAll()
      dispatch({ type: 'ADDBLOGS', payload: blogs })
    }
    fetchBlogs()
    keepLogged()
  }, [dispatch])

  //Handlers
  const keepLogged = async () => {
    const credentialsJson = window.localStorage.getItem('loggedBlogappUser')
    if (credentialsJson) {
      const decodedCredentials = JSON.parse(credentialsJson)
      blogService.setToken(decodedCredentials.token)
      dispatch({ type: 'ADDUSER', payload: decodedCredentials })
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
      dispatch({ type: 'ADDUSER', payload: user })
      setUsername('')
      setPassword('')
      console.log('logging in with', username, password)
    } catch (exception) {
      dispatch({ type: 'SETERROR', payload: 'wrong credentials' })
      setTimeout(() => {
        dispatch({ type: 'CLEARERROR' })
      }, 5000)
    }
  }

  const updateLikes = async (blog) => {
    const updatedBlog = {
      ...blog,
      likes: blog.likes + 1,
    }
    await blogService.update(blog.id, updatedBlog)
    dispatch({
      type: 'ADDLIKE',
      payload: blog.id,
    })
  }

  const removeBlog = async (blog) => {
    try {
      if (blog.user.username !== user.username) {
        dispatch({
          type: 'SETERROR',
          payload: 'Only the user can remove blog',
        })
        setTimeout(() => {
          dispatch({ type: 'CLEARERROR' })
        }, 5000)
        return
      } else {
        if (window.confirm(`remove blog ${blog.title} by ${blog.author}`)) {
          const response = await blogService.remove(blog.id)
          if (response.status === 204) {
            dispatch({
              type: 'REMOVEBLOG',
              payload: blog.id,
            })
            dispatch({ type: 'SET', payload: `${blog.title} removed` })
            setTimeout(() => {
              dispatch({ type: 'CLEAR' })
            }, 5000)
          }
        }
      }
    } catch (exception) {
      dispatch({ type: 'SETERROR', payload: 'failed removing the blog' })
      setTimeout(() => {
        dispatch({ type: 'CLEARERROR' })
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
      const res = await blogService.addToUser(user.id, blog.id)
      dispatch({
        type: 'ADDBLOGS',
        payload: blogsList.concat(blog),
      })
      dispatch({
        type: 'SET',
        payload: `a new blog ${blog.title} by ${blog.author} added`,
      })
      setTimeout(() => {
        dispatch({ type: 'CLEAR' })
      }, 5000)
    } catch (exception) {
      dispatch({ type: 'SETERROR', payload: 'wrong credentials' })
      setTimeout(() => {
        dispatch({ type: 'CLEARERROR' })
      }, 5000)
    }
  }

  const UsersView = () => {
    useEffect(() => {
      const fetchUsers = async () => {
        const data = await blogService.getAllUsers()
        dispatch({ type: 'ADDUSERS', payload: data })
      }
      fetchUsers()
    }, [])
    return (
      <div>
        <h2>Users</h2>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Blogs created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.blogs.length} </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  //Render
  if (user === null) {
    return (
      <div>
        <ErrorNotification />
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

  const BlogsView = () => {
    return (
      <div>
        <h2>create new</h2>
        <Togglable buttonLabel="create" ref={blogFormRef}>
          <BlogForm handleSubmit={sendBlog} />
        </Togglable>
        {blogsList
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

  return (
    <Router>
      <div>
        <h2>blogs</h2>
        <ErrorNotification />
        <Notification />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <p>{user.name} logged in</p>
          <button
            onClick={() => {
              dispatch({ type: 'REMOVEUSER' })
              window.localStorage.removeItem('loggedBlogappUser')
            }}
          >
            logout
          </button>
        </div>

        <Routes>
          <Route path="/users" element={<UsersView />} />
          <Route path="/" element={<BlogsView />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
