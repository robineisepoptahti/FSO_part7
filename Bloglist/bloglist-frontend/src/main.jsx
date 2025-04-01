import ReactDOM from 'react-dom/client'
import App from './App'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import msgReducer from './reducers/msgReducer'
import errorMsgReducer from './reducers/errorReducer'
import blogsReducer from './reducers/blogsReducer'
import usersReducer from './reducers/userReducer'
import { composeWithDevTools } from 'redux-devtools-extension'

const reducer = combineReducers({
  messages: msgReducer,
  errorMessages: errorMsgReducer,
  blogsList: blogsReducer,
  user: usersReducer,
})

const store = createStore(reducer, composeWithDevTools())

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
