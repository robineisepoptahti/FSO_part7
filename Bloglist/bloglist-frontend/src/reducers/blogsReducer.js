const blogsReducer = (state = [], action) => {
  if (action.type === 'ADDBLOGS') {
    return action.payload
  } else if (action.type === 'REMOVEBLOG') {
    return ''
  }
  return state
}

export default blogsReducer
