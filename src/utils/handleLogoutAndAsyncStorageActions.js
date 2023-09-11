import { fromJS } from 'immutable'
import qs from 'query-string'
import { getBuddiesArray } from './buddyUtils'
import { utmDetailKeys } from './utmParameterAction'
import get from 'lodash/get'
import { logoutBuddies } from '../pages/Signup/schoolLiveClassLogin/utils'
import { getDataFromLocalStorage } from './data-utils'

const handleLogoutAndAsyncStorageActions = reducer => (state, action) => {
  if (action.type === 'LOGOUT') {
    const batchSessionId = getDataFromLocalStorage("currentSessionId")
    const userIds = getBuddiesArray(state).map(buddy => get(buddy, 'id'))
    if (batchSessionId) logoutBuddies(batchSessionId, JSON.stringify(userIds))
    const query = qs.parse(window.location.search)
    const queryKeys = Object.keys(query)
    state = undefined
    const country_code = localStorage.getItem('country_code')
    const timezone = localStorage.getItem('timezone')
    const ipapi = localStorage.getItem('ipapi')
    const deviceInfo = localStorage.getItem('deviceInfo')
    const viewModal = localStorage.getItem('viewModal')
    const systemId = localStorage.getItem('systemId')
    const utmDetail = []
    utmDetailKeys.forEach(key => {
      if (localStorage.hasOwnProperty(key) && localStorage.getItem(key)) {
        utmDetail.push({ key: key, value: localStorage.getItem(key) })
      }
    })
    localStorage.clear()
    sessionStorage.clear()
    utmDetail.forEach(utm => {
      if (utm.value) {
        localStorage.setItem(utm.key, utm.value)
      }
    })
    if (country_code && country_code !== 'null' && country_code !== 'undefined') {
      localStorage.setItem('country_code', country_code)
    }
    if (timezone && timezone !== 'null' && timezone !== 'undefined') {
      localStorage.setItem('timezone', timezone)
    }
    if (ipapi && ipapi !== 'null' && ipapi !== 'undefined') {
      localStorage.setItem('ipapi', ipapi)
    }
    if (viewModal && viewModal !== 'null' && viewModal !== 'undefined') {
      localStorage.setItem('viewModal', viewModal)
    }
    if (deviceInfo && deviceInfo !== 'null' && deviceInfo !== 'undefined') {
      localStorage.setItem('deviceInfo', deviceInfo)
    }
    localStorage.setItem('appVersion', import.meta.env.REACT_APP_VERSION)
    if (queryKeys && queryKeys.length > 0) {
      for (const key of queryKeys) {
        localStorage.setItem(key, query[key])
      }
    }
    if (systemId) localStorage.setItem("systemId", systemId)
    if (window && window.fcWidget) {
      window.fcWidget.setFaqTags({
        tags: ['unregistered'],
        filterType: 'article'
      })
      window.fcWidget.hide()
    }
  }
  if (action.type === 'loadFromLocalStorage') {
    return {
      ...state,
      data: state.data.merge(action.data)
    }
  }

  if (action.type === 'prefetch') {
    return {
      ...state,
      data: state.data.merge(fromJS(action.data))
    }
  }
  return reducer(state, action)
}
export default handleLogoutAndAsyncStorageActions
