
/**
  * @param {import('@babel/types').Immutable} state immutable state
  * @param {string} list list that needs to be updated with the key
  * @param {string} itemId items's id who's key is to be updated
  * @param {string} keyToAdd key to be added to the list Ex:Topics,Chapters,...
  * @returns {{isKeyPresent:Boolean,newState:import('@babel/types').Immutable,item:import('@babel/types').Immutable}}
  */

const addKeyToList = (state, list, itemId, keyToAdd) => {
  let newState = state
  const listItems = newState.getIn([list, 'data'])
  const itemIndex = listItems.findIndex(listItem => listItem.get('id') === itemId)
  const item = listItems.get(itemIndex)
  const isKeyPresent = item.get('__keys').indexOf(keyToAdd) !== -1
  newState = newState.setIn([list, 'data', itemIndex],
    isKeyPresent ? item : item.set('__keys', item.get('__keys').concat(keyToAdd))
  )
  return {
    isKeyPresent,
    newState,
    item
  }
}

export default addKeyToList
