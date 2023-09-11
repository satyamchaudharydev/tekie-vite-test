import { List } from 'immutable'
import get from 'lodash/get'
import { filterKey, getDataFromLocalStorage } from "./data-utils"
import getSystemId from './getOrGenerateSystemId'

const isBuddyExist = () => {
  if (typeof window === 'undefined') return false
  let user = filterKey(window.store.getState().data.getIn(['user', 'data']), 'loggedinUser') || List([])
  user = (user && user.toJS()) || []
  if (user.length) {
    return (get(user, '[0].buddyDetails', []) || []).filter(buddy => !get(buddy, 'isPrimaryUser')).length
  }
  return false
}

export const getBuddiesArray = (state) => {
  if (typeof window === 'undefined') return []
  let user = filterKey(state.data.getIn(['user', 'data']), 'loggedinUser') || List([])
  user = (user && user.toJS()) || []
  if (get(user, '[0].buddyDetails', []) && get(user, '[0].buddyDetails', []).length > 1) {
    return (get(user, '[0].buddyDetails', []) || [])
  }
  return [{id: get(user,'[0].id', '')}]
}

export const isSessionOrHomeworkPage = () => {
  if (window !== 'undefined') {
    const { pathname } = window.location;
    const sessionsRoute = '/sessions';
    const homeworkRoute = '/homework';
    if (((pathname.includes(sessionsRoute) && pathname !== sessionsRoute)
      || (pathname.includes(homeworkRoute) && pathname !== homeworkRoute))
      && pathname !== '/' && pathname !== '/login') {
      return true;
    }
  }
  return false;
}

export const getHeadersForBuddy = (tokenType) => {
  const headerObj = {};
  if (tokenType === 'appTokenOnly') return headerObj;
  const currentSessionId = getDataFromLocalStorage("currentSessionId")
  if (currentSessionId) headerObj['BatchSession-Id'] = currentSessionId
  if (tokenType !== 'buddyToken') return headerObj;
  if (!isSessionOrHomeworkPage()) return {};
  if (!isBuddyExist()) return {};
  if (getSystemId()) headerObj['User-Device-Id'] = getSystemId();
  return headerObj;
}

export default isBuddyExist;