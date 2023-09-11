import moment from 'moment'

const formatDateFromISO = (dateTobeFormatted) => {
  const date = moment(dateTobeFormatted).format('YYYY-MM-DD')
  return date
}
export default formatDateFromISO
