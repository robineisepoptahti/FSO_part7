import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Comments from './components/Comments'
import NavbarField from './components/NavbarField'
import blogService from './services/blogs'
import loginService from './services/login'
import Togglable from './components/Togglable'
import { useSelector, useDispatch } from 'react-redux'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  Link,
} from 'react-router-dom'
import { Table, Alert, ListGroup } from 'react-bootstrap'
import { Button } from './components/styles'

const Notification = () => {
  const message = useSelector((state) => state.messages)
  if (message === '') {
    return null
  }

  return (
    <Alert variant="success">
      <div className="msg">{message}</div>
    </Alert>
  )
}

const ErrorNotification = () => {
  const message = useSelector((state) => state.errorMessages)
  if (message === '') {
    return null
  }
  return (
    <Alert variant="danger">
      <div className="error">{message}</div>
    </Alert>
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
      if (users.length === 0) {
        fetchUsers()
      }
    }, [])
    return (
      <div>
        <h2>Users</h2>
        <Table>
          <thead>
            <tr>
              <th>Users</th>
              <th>Blogs created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((userThis) => (
              <tr key={userThis.id}>
                <td>
                  <Link to={`/users/${userThis.id}`}>{userThis.name}</Link>
                </td>
                <td>{userThis.blogs.length} </td>
              </tr>
            ))}
          </tbody>
        </Table>
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
        <Togglable buttonLabel="create new" ref={blogFormRef}>
          <BlogForm handleSubmit={sendBlog} />
        </Togglable>
        <Table striped>
          <tbody>
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
          </tbody>
        </Table>
      </div>
    )
  }

  const UserView = () => {
    useEffect(() => {
      const fetchUsers = async () => {
        if (users.length === 0) {
          const data = await blogService.getAllUsers()
          dispatch({ type: 'ADDUSERS', payload: data })
          console.log('OKOK')
        }
      }
      fetchUsers()
    }, [])
    const id = useParams().id
    const userToDisplay = users.find((n) => n.id === id)
    if (userToDisplay) {
      return (
        <div>
          <h2 style={{ marginBottom: '30px', marginTop: '30px' }}>
            {userToDisplay.name}
          </h2>
          <h3>Added blogs</h3>
          <div>
            <ListGroup>
              {userToDisplay.blogs.map((blog) => (
                <ListGroup.Item key={blog.id}>{blog.title}</ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </div>
      )
    } else return <p>No user found with given id...</p>
  }

  const BlogView = () => {
    const id = useParams().id
    const blogToDisplay = blogsList.find((n) => n.id === id)

    const [comments, setComments] = useState(
      blogToDisplay ? blogToDisplay.comments : []
    )

    const updateComments = async (comment) => {
      const newBlog = { ...blogToDisplay, comments: comments.concat(comment) }
      await blogService.update(blogToDisplay.id, newBlog)
      setComments(newBlog.comments)
    }
    const showRemove = () => {
      if (blogToDisplay.user.username === user.username) {
        return <Button onClick={() => removeBlog(blogToDisplay)}>remove</Button>
      } else {
        return null
      }
    }

    if (blogToDisplay) {
      return (
        <div>
          <h2>{blogToDisplay.title}</h2>
          <a href={`${blogToDisplay.title}`}>{`${blogToDisplay.title}`}</a>
          <br></br>
          Likes: {blogToDisplay.likes}{' '}
          <Button onClick={() => updateLikes(blogToDisplay)}>like</Button>{' '}
          <br></br>Added by: {blogToDisplay.author}
          <Comments updateComments={updateComments} />
          <ListGroup>
            {comments.map((comment) => (
              <div key={comment}>
                <ListGroup.Item>{comment}</ListGroup.Item>
              </div>
            ))}
          </ListGroup>
          {showRemove()}
        </div>
      )
    } else return <p>No user found with given id...</p>
  }

  return (
    <Router>
      <div className="container">
        <h2 style={{ marginBottom: '15px' }}>Blogs</h2>
        <ErrorNotification />
        <Notification />
        <NavbarField user={user.name} />

        <Routes>
          <Route path="/users" element={<UsersView />} />
          <Route path="/" element={<BlogsView />} />
          <Route path="/users/:id" element={<UserView />} />
          <Route path="/blogs/:id" element={<BlogView />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
