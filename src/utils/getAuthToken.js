import { Base64 } from 'js-base64'
import { Map } from 'immutable'
import config from '../config'
import { filterKey } from './data-utils'

const getAuthToken = (tokenType, userToken) => {
  if (userToken) {
    return Base64.encode(`${config.appToken}::${userToken}`)
  }
  if (tokenType === 'appTokenOnly') {
    return Base64.encode(config.appToken)
  }

  const loggedInUser = typeof window !== 'undefined'
    ? filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser').get(0) || Map({})
    : Map({})
  const otpUser = typeof window !== 'undefined'
    ? filterKey(window.store.getState().data.getIn(['user', 'data']), 'validateOTP').get(0) || Map({})
    : Map({})
  const user = loggedInUser.get('id') ? loggedInUser : otpUser
  const parentToken = user.getIn(['parent', 'token'])
    ? user.getIn(['parent', 'token'])
    : otpUser.getIn(['parent', 'token'])
  const mentor = typeof window !== 'undefined'
    ? filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedInMentor').get(0) || Map({})
    : Map({})
  if (tokenType === 'withMenteeToken' && user.get('id')) {
    return Base64.encode(`${config.appToken}::${user.get('token')}`)
  } else if (tokenType === 'withParentToken') {
    return Base64.encode(`${config.appToken}::${parentToken}`)
  } else if (tokenType === 'withMenteeMentorToken' && user.get('id') && mentor.get('id')) {
    return Base64.encode(`${config.appToken}::${user.get('token')}::${mentor.get('token')}`)
  }

  return user.get('id')
      ? Base64.encode(`${config.appToken}::${user.get('token')}`)
      : Base64.encode(config.appToken)
}

export default getAuthToken
