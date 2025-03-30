import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import blogService from './services/blogs'
import loginService from './services/login'
import Togglable from './components/Togglable'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { useSelector } from 'react-redux'

import msgReducer from './reducers/msgReducer'
import errorMsgReducer from './reducers/errorReducer'

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

const reducer = combineReducers({
  messages: msgReducer,
  errorMessages: errorMsgReducer,
})

const store = createStore(reducer)

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
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
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
      store.dispatch({ type: 'SETERROR', payload: 'wrong credentials' })
      setTimeout(() => {
        store.dispatch({ type: 'CLEARERROR' })
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
        store.dispatch({
          type: 'SETERROR',
          payload: 'Only the user can remove blog',
        })
        setTimeout(() => {
          store.dispatch({ type: 'CLEARERROR' })
        }, 5000)
        return
      } else {
        if (window.confirm(`remove blog ${blog.title} by ${blog.author}`)) {
          const response = await blogService.remove(blog.id)
          if (response.status === 204) {
            setBlogs(blogs.filter((blogsInList) => blog.id !== blogsInList.id))
            store.dispatch({ type: 'SET', payload: `${blog.title} removed` })
            setTimeout(() => {
              store.dispatch({ type: 'CLEAR' })
            }, 5000)
          }
        }
      }
    } catch (exception) {
      store.dispatch({ type: 'SETERROR', payload: 'failed removing the blog' })
      setTimeout(() => {
        store.dispatch({ type: 'CLEARERROR' })
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
      store.dispatch({
        type: 'SET',
        payload: `a new blog ${blog.title} by ${blog.author} added`,
      })
      setTimeout(() => {
        store.dispatch({ type: 'CLEAR' })
      }, 5000)
    } catch (exception) {
      store.dispatch({ type: 'SETERROR', payload: 'wrong credentials' })
      setTimeout(() => {
        store.dispatch({ type: 'CLEARERROR' })
      }, 5000)
    }
  }

  //Render
  if (user === null) {
    return (
      <Provider store={store}>
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
      </Provider>
    )
  }

  return (
    <Provider store={store}>
      <div>
        <h2>blogs</h2>
        <ErrorNotification />
        <Notification />
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
    </Provider>
  )
}

export default App
