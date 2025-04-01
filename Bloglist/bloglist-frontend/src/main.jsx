import ReactDOM from 'react-dom/client'
import App from './App'
import { Provider } from 'react-redux'
import { createStore, combineReducers } from 'redux'
import msgReducer from './reducers/msgReducer'
import errorMsgReducer from './reducers/errorReducer'
import blogsReducer from './reducers/blogsReducer'

const reducer = combineReducers({
  messages: msgReducer,
  errorMessages: errorMsgReducer,
  blogsList: blogsReducer,
})

const store = createStore(reducer)

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
