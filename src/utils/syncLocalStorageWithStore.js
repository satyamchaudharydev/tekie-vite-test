import { List } from 'immutable'
import { keyIn } from './immutable'
import { keysToCache } from '../config'

let previousData = List([])
const shouldStoreInAsyncStorage = (currentData, previousData) => {
  for (const [key, value] of currentData) {
    if (!value.equals(previousData.get(key))) {
      return true
    }
  }
  return false
}

const syncLocalStorageWithStore = (state) => {
  const currentData = state.data.filter(keyIn(...keysToCache))
  const shouldStore = shouldStoreInAsyncStorage(
    currentData,
    previousData
  )
  if (shouldStore && typeof localStorage !== 'undefined') {
    localStorage.setItem('data',JSON.stringify(currentData.toJS()))
  }
  previousData = currentData
}

export default syncLocalStorageWithStore
