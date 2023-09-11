import duck from './index'
import { isImmutable } from 'immutable'
import store from '../store'

const isCachedDataExpired = (type, expiresIn = 0) => {
  const queryName = type.split('/')[0]
  if (expiresIn) {
    let stateToUpdate = store.getState().data.getIn([queryName, 'data'])
    stateToUpdate = stateToUpdate.filter(item => {
      let newItem = item
      if (isImmutable(item)) {
        newItem = item && item.toJS()
      }
      if (expiresIn && newItem && newItem.fetchedAt) {
        const currentTime = new Date().getTime()
        const dataFetchedAtTime = new Date(newItem.fetchedAt).getTime()
        return (currentTime - dataFetchedAtTime) < expiresIn
      }
      return true;
    })
    return stateToUpdate && stateToUpdate.size === 0
  }
  return true
}
const isAlreadyInCache = ({
  key,
  type,
  force = false,
  expiresIn = 0
}) => {
  const queryName = type.split('/')[0]
  if (expiresIn && !isCachedDataExpired(type, expiresIn)) {
    return true;
  }
  const status = store.getState().data.getIn([queryName, 'fetchStatus', key])
  if (status && !force) {
    if (isImmutable(status)) {
      const { loading, success } = status.toJS()
      if (loading || success) {
        return true
      }
    } else {
      const { loading, success } = status
      if (loading || success) {
        return true
      }
    }
  }
  return false
}

const queryMethod = async ({
  key,
  type,
  force = false,
  expiresIn = 0,
  ...rest
}) => {
  if (isAlreadyInCache({
    key,
    type,
    force,
    expiresIn
  })) {
    return new Promise(() => {})
  }
  return {
    query: await duck.query({
      key,
      type,
      expiresIn,
      ...rest
    }),

  }
}
const createQueryMethod = ({
  key,
  type,
  force = false,
  expiresIn = 0,
  ...rest
}) => {
  const query = duck.createQuery({
    key,
    type,
    expiresIn,
    ...rest
  })
  return {
    mapStateToProps: query.mapStateToProps,
    call: () => {
      if (expiresIn && isCachedDataExpired(type, expiresIn)) {
        query.call()
        return Promise.resolve({});
      }
      if (isAlreadyInCache({
        key,
        type,
        force,
        expiresIn
      })) {
        return Promise.resolve({});
      }
      return query.call()
    }
  }
}

const duckCacheAware = {
  query: queryMethod,
  createQuery: createQueryMethod,
}

export default duckCacheAware
