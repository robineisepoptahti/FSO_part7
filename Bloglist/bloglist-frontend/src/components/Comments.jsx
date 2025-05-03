import { useState } from 'react'
import { Button } from './styles'

const Comments = ({ updateComments }) => {
  const [comment, setComment] = useState('')

  const onSubmit = (event) => {
    event.preventDefault()
    updateComments(comment)
    setComment('')
  }
  return (
    <div>
      <form onSubmit={onSubmit}>
        <h3 style={{ paddingTop: '30px' }}>Comments</h3>
        <input
          style={{ padding: 0 }}
          data-testid="comment"
          type="text"
          value={comment}
          name="Comment"
          onChange={(event) => setComment(event.target.value)}
        />
        <Button>add comment</Button>
      </form>
    </div>
  )
}

export default Comments
