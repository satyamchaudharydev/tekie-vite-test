import tz from 'countries-and-timezones'
import { get } from 'lodash'
import moment from 'moment'
import 'moment-timezone'

const getIntlDateTime = (date, istTime, targetTimezone) => {
  const timezone = tz.getTimezone(targetTimezone)
  const indianOffset = get(tz.getTimezone('Asia/Kolkata'), 'dstOffset')
  const intlOffset = get(timezone, 'dstOffset')
  const timeDiffInMs = (indianOffset - intlOffset) * 60 * 1000
  const offsetedSelectedDateInMs = moment(date).tz('Asia/Kolkata').startOf('day').valueOf() - timeDiffInMs
  const dateAfterSlotOffset_ = moment(offsetedSelectedDateInMs + (istTime * 60 * 60 * 1000)).tz('Asia/Kolkata')
  const intlDate = dateAfterSlotOffset_.format('DD-MM-YYYY')
  const intlTime = dateAfterSlotOffset_.format('LT')
  const endIntlTime = moment(dateAfterSlotOffset_ + (60 * 60 * 1000)).tz('Asia/Kolkata').format('LT')
  const intlSlot = dateAfterSlotOffset_.hours()
  const intlMin = dateAfterSlotOffset_.minutes()
  return {
    intlDate,
    intlTime,
    intlDateObj: new Date(dateAfterSlotOffset_.format('MM/DD/YYYY')),
    intlTimeLabel: `${intlTime} - ${endIntlTime}`,
    intlSlot,
    intlMin
  }
}

export default getIntlDateTime

