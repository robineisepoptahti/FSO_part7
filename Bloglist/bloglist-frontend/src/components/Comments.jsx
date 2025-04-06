import { useState } from 'react'

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
        <h3>comments</h3>
        <input
          style={{ padding: 0 }}
          data-testid="comment"
          type="text"
          value={comment}
          name="Comment"
          onChange={(event) => setComment(event.target.value)}
        />
        <button>add comment</button>
      </form>
    </div>
  )
}

export default Comments
