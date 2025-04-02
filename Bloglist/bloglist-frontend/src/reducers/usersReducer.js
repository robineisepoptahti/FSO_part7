const usersReducer = (state = [], action) => {
  if (action.type === 'ADDUSERS') {
    return action.payload
  } else if (action.type === 'REMOVEUSERS') {
    return null
  }
  return state
}

export default usersReducer
