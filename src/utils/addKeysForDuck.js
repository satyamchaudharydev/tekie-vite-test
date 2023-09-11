import { List } from 'immutable'

const addKeys = data => {
  if (List.isList(data)) {
    return data.map(item => item.set('__keys', List(['homepage'])))
  }
  return data
}

export default addKeys
