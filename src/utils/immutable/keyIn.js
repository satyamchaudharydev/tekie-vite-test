import { Set } from 'immutable'

const keyIn = (...keys) => {
  const keySet = Set(keys)
  return (value, key) => keySet.has(key)
}

export default keyIn
