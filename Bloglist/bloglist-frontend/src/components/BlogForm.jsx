import PropTypes from 'prop-types'
import { useState } from 'react'
import { Button } from './styles'
import { Input } from './styles'

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
      <div style={{ alignItems: 'center', marginTop: '40px' }}>
        <form onSubmit={onSubmit}>
          <div>
            Title:
            <Input
              data-testid="title"
              type="text"
              value={title}
              name="Title"
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            Author:
            <Input
              data-testid="author"
              type="text"
              value={author}
              name="Author"
              onChange={(event) => setAuthor(event.target.value)}
            />
          </div>
          <div>
            URL:
            <Input
              data-testid="url"
              type="text"
              value={url}
              name="Url"
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>
          <Button>submit</Button>
        </form>
      </div>
    </div>
  )
}

BlogForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
}

export default BlogForm
