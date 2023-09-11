import State from '../tekie-redux-state-managment/src'
import { Map } from 'immutable'
import schema from './schema'
import customInitialState from './customInitialState'
import requestToGraphql from '../utils/requestToGraphql'

const getInitialState = () => {
  if (typeof window !== 'undefined') {
    if (window.INITIAL_STATE) {
      return {
        ...window.INITIAL_STATE.data,
        ...customInitialState
      }
    }
  }
  return customInitialState
}

const duck = new State({
  schema,
  customInitialState: getInitialState(),
  graphqlLib: async (query, {tokenType, token, ...variables}) => {
    if (tokenType) {
      const response  = await requestToGraphql(query, variables, token, tokenType)
      return response
    } else {
      const response = await requestToGraphql(query, variables, token)
      return response
    }
  }
})

duck.registerGlobalMapStateToProps((stateToSubscribe, type, key) => (state, dispatch) => {
  const mapStateToProps = {}
  for (const token of stateToSubscribe) {
    mapStateToProps[token] = duck.getState(token, key)
  }
  if (type) {
    const queryName = type.split('/')[0]
    mapStateToProps[`${queryName}Status`] = duck.getStatus(queryName, key, Map({
      loading: false,
      success: false,
      failure: false
    }))
  }
  return mapStateToProps
})


export default duck
