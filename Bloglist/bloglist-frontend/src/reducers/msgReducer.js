const msgReducer = (state = '', action) => {
  if (action.type === 'SET') {
    return action.payload
  } else if (action.type === 'CLEAR') {
    return ''
  }
  return state
}

export default msgReducer
