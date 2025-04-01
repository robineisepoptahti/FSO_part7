const blogsReducer = (state = [], action) => {
  if (action.type === 'ADDBLOGS') {
    return action.payload
  }
  if (action.type === 'ADDLIKE') {
    return state.map((bl) =>
      bl.id === action.payload ? { ...bl, likes: bl.likes + 1 } : bl
    )
  } else if (action.type === 'REMOVEBLOG') {
    return state.filter((blogsInList) => action.payload !== blogsInList.id)
  }
  return state
}

export default blogsReducer
