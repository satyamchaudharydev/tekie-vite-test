import { combineReducers, createStore } from 'redux'
import duck from './duck'
import handleLogoutAndAsyncStorageActions from './utils/handleLogoutAndAsyncStorageActions'
import syncLocalStorageWithStore from './utils/syncLocalStorageWithStore'

export const rootReducer = combineReducers({
  data: duck.reducer
})


const store = createStore(
  handleLogoutAndAsyncStorageActions(rootReducer),
  typeof window !== 'undefined' ? window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() : {},
)


duck.registerStore(store)

store.subscribe(() => {
  syncLocalStorageWithStore(store.getState())
})

if (typeof window !== 'undefined') {
  window.store = store
}
export default store
