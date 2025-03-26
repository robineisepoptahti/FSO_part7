import PropTypes from 'prop-types'
import { useState } from 'react'
const BlogForm = ({ handleSubmit }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const onSubmit = (event) => {
    event.preventDefault()
    handleSubmit({ title, author, url })
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <div>
        <form onSubmit={onSubmit}>
          <div>
            title
            <input
              data-testid="title"
              type="text"
              value={title}
              name="Title"
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            author
            <input
              data-testid="author"
              type="text"
              value={author}
              name="Author"
              onChange={(event) => setAuthor(event.target.value)}
            />
          </div>
          <div>
            url
            <input
              data-testid="url"
              type="text"
              value={url}
              name="Url"
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>
          <button>submit</button>
        </form>
      </div>
    </div>
  )
}

BlogForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default BlogForm
