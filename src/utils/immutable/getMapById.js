import { Map } from 'immutable'

const getMapById = (listOfMaps, id) => {
  const foundMap = listOfMaps.find(map => map.get('id') === id)
  if (foundMap) return foundMap
  return Map({})
}

export default getMapById
