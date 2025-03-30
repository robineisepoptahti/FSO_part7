const errorMsgReducer = (state = '', action) => {
  if (action.type === 'SETERROR') {
    return action.payload
  } else if (action.type === 'CLEARERROR') {
    return ''
  }
  return state
}

export default errorMsgReducer
