import { isEmpty, omit, pick, get } from 'lodash'
import { List } from 'immutable'
import getCountryCode from './getCountryCode'
import { Base64 } from 'js-base64'
import config from '../config'

export const getOrdersInUse = data => data.map(item => item.order)

export const getOrderAutoComplete = orders => {
  const defaultOrder = Math.max(...orders) + 1
  return Number.isFinite(defaultOrder) ? defaultOrder : 1
}

export const getItemByProp = (data, prop, value) => {
  const foundData = data.find(item => get(item, prop) === value) || {}
  return foundData
}

export const getDataByProp = (data, prop, value) => {
  if (!data) return []
  const foundData = data.filter(item => get(item, prop) === value) || []
  return foundData
}
export const getDataById = (data, id) => getItemByProp(data, 'id', id)

export const filterItems = (arr, itemsToRemove) =>
  arr.filter(item => !itemsToRemove.includes(item))

/**
 * takes a children property and makes it parent
 * @example
 * ```js
 * const a = [
 *  { id: 0, parent: {id: 0} },
 *  { id: 1, parent: {id: 0} }
 *  { id: 2, parent: {id: 1} },
 *  { id: 3, parent: { id: 1 }}
 * ]
 * nestChildrenIntoParent(a, 'child', 'parent')
 * result -> [
 * { id: 0, child: [{ id: 0 }, {id: 1}] }
 * { id: 1, child: [{ id: 2 }, {id: 3}] }
 * ]
 * ```
 */
export const nestChildrenIntoParent = (
  children,
  childrenName,
  parentName,
  propertyToExtract
) => {
  const data = []
  children.forEach(child => {
    const parent = pick(child, [parentName])[parentName]
    const rest = omit(child, [parentName, propertyToExtract])
    if (!parent || isEmpty(parent)) return
    const item = getDataById(data, parent.id)
    if (isEmpty(item)) {
      const dataToPush =
        propertyToExtract !== undefined
          ? {
            ...parent,
            [propertyToExtract]: child[propertyToExtract],
            [childrenName]: [rest]
          }
          : { ...parent, [childrenName]: [rest] }
      data.push(dataToPush)
    } else {
      const parentIndex = data.map(x => x.id).indexOf(parent.id)
      data[parentIndex][childrenName].push(rest)
    }
  })
  return data
}

export const nestTopicsInChapter = topics =>
  nestChildrenIntoParent(topics, 'topics', 'chapter')

export const pickOne = (dataA, dataB) =>
  dataA.size > 0 ? dataA : dataB

export const filterKey = (data, key) =>
  data ? data.filter(item => item && item.get('__keys') && item.get('__keys').includes(key)) : List([])

export const filterKeyReverse = (data, key) =>
  data ? data.filter(item => item && item.get('__keys') && !item.get('__keys').includes(key)) : List([])

export const mapRange = (obj, num) =>
  ((num - obj.from[0]) * (obj.to[1] - obj.to[0])) /
    (obj.from[1] - obj.from[0]) +
  obj.to[0]

export const minCap = (num, cap) => (num > cap ? num : cap)

export const ifNot = (main, backup) => (main ? main : backup)

export const isME = (countryCode = getCountryCode()) => ['qa', 'ae', 'om', 'kw', 'eg'].includes(countryCode)

export const maxCap = (num, cap) => (num < cap ? num : cap)

export const getVideoDuration = (videoStartTime, videoEndTime) => {
  if (
    !isNaN(videoStartTime) &&
    !isNaN(videoEndTime) &&
    videoStartTime !== undefined &&
    videoStartTime !== '' &&
    videoStartTime !== null &&
    videoEndTime !== null &&
    (videoEndTime !== undefined && videoEndTime !== '')
  ) {
    const duration = Math.round((videoEndTime - videoStartTime) / 1000)
    return duration > 60
      ? `${Math.round((duration / 60) * 10) / 10}m`
      : `${duration}s`
  }
  return 0
}

export const getPropertyFromId = (property, items, id) => {
  const itemFound = items.find(item => item.id === id)
  if (itemFound && itemFound[property]) {
    return itemFound[property]
  }
  return null
}

export function waitForGlobal(name, timeout = 300) {
  return new Promise((resolve, reject) => {
    let waited = 0

    function wait(interval) {
      setTimeout(() => {
        waited += interval
        if (window[name] !== undefined) {
          return resolve()
        }
        if (waited >= timeout * 1000) {
          return reject({ message: 'Timeout' })
        }
        wait(interval * 2)
      }, interval)
    }

    wait(30)
  })
}

export const getBuddies=(buddyList=[])=>{
  if(buddyList===null) return []
  if(!buddyList.length) return []
  return buddyList.filter(buddy=>get(buddy,'isPrimaryUser')===false)
}

export const getAppUserAuthToken=(userToken)=> Base64.encode(`${config.appToken}::${userToken}`)

export const getDateMonthFormat=(dateStr)=>{
  const months=["January","February","March","April","May","June","July",
  "August","September","October","November","December"]
  if(!dateStr) return new Date()
  const monthNumber = new Date(dateStr).getMonth()
  const monthName = months[monthNumber]
  const date = new Date(dateStr).getDate()
  return `${date} ${monthName} `
}

export const setDataInLocalStorage = (key, data) => {
  if (typeof window === 'undefined') return null
  if (key && window) {
    if (typeof data === 'object') {
      const newData = JSON.stringify(data)
      localStorage.setItem(key, newData)
    } else localStorage.setItem(key, data)
  }
}

export const getDataFromLocalStorage = (key) => {
  if (typeof window === 'undefined') return null
  if (key && window) {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        return JSON.parse(data);
      }
      catch(e) {return data;}
    }
  }
  return null
}

export const removeDataFromLocalStorage = (key) => {
  if (typeof window === 'undefined') return null
  if (key && window) {
    const data = localStorage.getItem(key)
    if (data) {
      localStorage.removeItem(key)
    }
  }
  return null
}

const DEFAULT_MAX_OUT_TIME = 30000
// wait till data is not null
export const waitFor = (dataGetter, interval=100, strictNullCheck=false,maxTimeout=DEFAULT_MAX_OUT_TIME) => {
  const doesDataExist = (data) => {
    if (strictNullCheck) {
      return data !== null
    }
    if (data instanceof Array) {
      return data.length > 0
    }
    if (data instanceof Object) {
      return Object.keys(data).length > 0
    }
    return !!data
  }


  return new Promise((resolve, reject) => {
    let waited = 0
    function wait() {
      setTimeout(() => {
        // if waited id more that 30 seconds the reject
        if (waited >= maxTimeout) {
          return reject({ message: 'Timeout' })
        }
        waited += interval
        if (doesDataExist(dataGetter())) {
          return resolve(dataGetter())
        }
        wait(interval * 2)
      }, interval)
    }
    wait()
  })
}
