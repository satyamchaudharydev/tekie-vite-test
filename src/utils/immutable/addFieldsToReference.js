import getMapById from './getMapById'

const addFieldsToReference = (
  mapCollection,
  referencedCollection,
  referenceKey
) =>
  mapCollection.map(mapItem =>
    mapItem.set(
      referenceKey,
      mapItem
        .get(referenceKey)
        .map(referenceMapItem =>
          getMapById(referencedCollection, referenceMapItem.get('id'))
        )
    )
  )

export default addFieldsToReference
