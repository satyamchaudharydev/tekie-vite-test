import moment from 'moment'

const padWithZero = (value) => {
  return value < 10 ? `0${value}` : value
}
// To get duration in (hh, mm, ss) between two Date objects
export const getDuration = (startDate, endDate, showSec) => {
  if (!endDate) endDate = moment(new Date()).format()
  let msec = (new Date(endDate)).getTime() - (new Date(startDate)).getTime()

  const dd = Math.floor(msec / 1000 / 60 / 60 / 24)
  msec -= dd * 1000 * 60 * 60 * 24

  const hh = Math.floor(msec / 1000 / 60 / 60)
  msec -= hh * 1000 * 60 * 60

  const mm = Math.floor(msec / 1000 / 60)
  msec -= mm * 1000 * 60

  if (dd || hh || mm) {
    const ss = Math.floor(msec / 1000)
    msec -= ss * 1000
    let time = ''
    if (dd) time += `${dd} days `
    if (hh) time += `${hh} hr `
    if (mm) time += `${mm} mins `
    return time
  }
  if (dd === 0 && hh === 0 && mm === 0) {
    return '0 mins'
  }
  if(!showSec && hh !== 0){
    const ss = Math.floor(msec / 1000)
    msec -= ss * 1000
    return `${hh}:${mm}:${ss}  hours`
  }
  if(!showSec && hh === 0){
    const ss = Math.floor(msec / 1000)
    msec -= ss * 1000
    return `${mm}:${ss}  mins`
  }

  
  return `${hh}:${mm}`
}

// To get the lowerbound of time eg. 16:25 -> 16:00
export const getLowerboundTime = (time) => `${time.split(':')[0]}:00`

// To convert 24 hour format to 12 hour format
// Pass 'a' as 2nd argument if 'am/pm' is needed at end of the string
export const T12HrFormat = (time, meridiem = '') => moment(time, 'HH:mm').format(`hh:mm${meridiem}`)