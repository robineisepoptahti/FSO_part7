const usersReducer = (state = [], action) => {
  if (action.type === 'ADDUSER') {
    return action.payload
  } else if (action.type === 'REMOVEUSER') {
    return null
  }
  return state
}

export default usersReducer
