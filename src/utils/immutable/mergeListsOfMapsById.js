import { List } from 'immutable'

/**
 * collectionA: List([ Map({ id:  0,  propA: 'a'})  ])
 * collectionB: List([ Map({ id: 0, propB: 'b'}), Map({ id: 1, propA: 'a' }) ])
 *
 * mergedList -->
 *  List([ Map({ id: 0, propA: 'a', propB: 'b' }), Map({ id: 1, propA: 'a' }) ])
 */
const mergeListsOfMapsById = (collectionA, collectionB) => {
  let mergedList = collectionA
  // collectionB could be either List of Maps or Map
  // if Map --> convert into List of Map
  if (!List.isList(collectionB)) {
    collectionB = List([collectionB])
  }
  collectionB.forEach(itemB => {
    const indexOfItemBInCollectionA = collectionA.findIndex(
      itemA => itemA.get('id') === itemB.get('id')
    )
    if (indexOfItemBInCollectionA > -1) {
      mergedList = mergedList.update(indexOfItemBInCollectionA, item =>
        item.merge(itemB)
      )
    } else {
      mergedList = mergedList.push(itemB)
    }
  })
  return mergedList
}

export default mergeListsOfMapsById
