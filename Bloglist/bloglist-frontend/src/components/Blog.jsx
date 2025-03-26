import { useState } from 'react'

const Blog = ({ blog, updateLikes, removeBlog, user }) => {
  const [visible, setVisible] = useState(false)

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  }
  const toggle = () => {
    setVisible(!visible)
  }

  const showRemove = () => {
    if (blog.user.username === user.username) {
      return <button onClick={() => removeBlog(blog)}>remove</button>
    } else {
      return null
    }
  }

  if (!visible) {
    return (
      <div style={blogStyle}>
        {blog.title} {blog.author}
        <button onClick={toggle}>view</button>
      </div>
    )
  }
  return (
    <div style={blogStyle}>
      {blog.title} {blog.author}
      <button onClick={toggle}>hide</button>
      <br />
      {blog.url}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div data-testid="likes">
          <p>likes {blog.likes}</p>
        </div>
        <button onClick={() => updateLikes(blog)}>like</button>
      </div>
      <div>{blog.user.name}</div>
      {showRemove()}
    </div>
  )
}

export default Blog
