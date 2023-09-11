/* eslint-disable import/prefer-default-export */

import moment from 'moment'

// To get duration in (hh, mm, ss) between two Date objects
export const getDuration = (startDate, endDate) => {
  let msec = (new Date(endDate)).getTime() - (new Date(startDate)).getTime()
  const hh = Math.floor(msec / 1000 / 60 / 60)
  msec -= hh * 1000 * 60 * 60
  const mm = Math.floor(msec / 1000 / 60)
  msec -= mm * 1000 * 60
  const ss = Math.floor(msec/1000)
  return {
    hour: hh,
    min: mm,
    sec: ss
  }
}

// To get the lowerbound of time eg. 16:25 -> 16:00
export const getLowerboundTime = (time) => `${time.split(':')[0]}:00`

// To convert 24 hour format to 12 hour format
// Pass 'a' as 2nd argument if 'am/pm' is needed at end of the string
export const T12HrFormat = (time, meridiem = '') => moment(time, 'HH:mm').format(`hh:mm${meridiem}`)
