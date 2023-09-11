import React, { Component } from 'react'
import { get } from 'lodash'
import moment from 'moment'
import cx from 'classnames'
import Select from 'react-select'
import './BookSession.scss'
import getPath from '../../utils/getPath'
import { Button } from '../../photon'
import getTimezones from '../../utils/time-zones'
import config from '../../config'

const getTimeLabel = (slot) => {
  const slotArray = slot.split(' ')
  if (slotArray.length === 2) {
    if (slotArray[0].includes(':')) {
      return `${slotArray[0]} ${slotArray[1].toUpperCase()}`
    }
    return `${slotArray[0]}:00 ${slotArray[1].toUpperCase()}`
  }
}

export default class BookSession extends Component {
  state = {
    currentPage: 1,
    selectedTime: '',
    bookingDate: ''
  }

  componentDidMount() {
    this.setBookingDate()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.selectedDate !== prevProps.selectedDate) {
      if (this.state.selectedTime) {
        this.setState({ selectedTime: '' })
      }
      this.setBookingDate()
    }
  }

  setBookingDate() {
    const calenderDates =
      this.props.slots.slice(0 + (4 * (this.state.currentPage - 1)), (4 * (this.state.currentPage)))
    if (calenderDates && calenderDates.length > 0) {
      calenderDates.forEach(calenderDate => {
        if (get(calenderDate, 'date') === this.props.selectedDate) {
          this.setState({
            bookingDate: get(calenderDate, 'bookingDate')
          })
        }
      })
    }
  }

  filterSlots(slots) {
    const filteredSlots = []
    if (!this.props.isTrialSession) return slots
    if (this.props.country !== 'india') return slots

    for (const slot of slots) {
      const isToday = moment(
        moment().date(this.props.selectedDate).toString()
      ).isSame(moment(), 'day')
      const isTomorrow = moment().date(this.props.selectedDate).date() - moment().date() === 1
      if (isToday && moment().hours() >= 8) {
        // if today AND less than {config.timeLag} hours from now, disable it
        if (get(slot, 'slotTime') > moment().hours() + config.timeLag) {
          filteredSlots.push(slot)
        }
      }  else if (
        (isTomorrow && moment().hours() >= 8 && moment().hours() >= config.bookClosingWindow) ||
        (isToday && moment().hours() < 8)
      ) {
        if (get(slot, 'slotTime') >= config.nextDayOpeningIfBookedAfterClosingWindow) {
          filteredSlots.push(slot)
        }
      } else {
        filteredSlots.push(slot)
      }
    }
    return filteredSlots
  }

  onSlotClick = (slot) => {
    this.setState({
      selectedTime: get(slot, 'slotTime')
    })
  }

  isBookedSlot = (slot, bookedSlotTime) => get(slot, 'slotTime') === bookedSlotTime && !this.state.selectedTime

  render() {
    const calenderDates =
      this.props.slots.slice(0 + (4 * (this.state.currentPage - 1)), (4 * (this.state.currentPage)))
    const totalCalendarPages = Math.floor(this.props.slots.length / 4) + 1
    const slotsUntouched = get(this.props.slots.find(slot => get(slot, 'date') === this.props.selectedDate), 'slots', []) || []
    const slots = this.filterSlots(slotsUntouched)
    const slotTimeKey = this.props.country === 'india' ? 'slotTime' : 'intlSlotTime'
    const morningSlots = slots.filter(s => get(s, slotTimeKey) < 12) || []
    const noonSlots = slots.filter(s => get(s, slotTimeKey) > 11 && get(s, slotTimeKey) < 19) || []
    const nightSlots = slots.filter(s => get(s, slotTimeKey) > 18) || []
    const shouldArrows = this.props.slots.length > 4
    const shouldLeftArrowDisable = this.state.currentPage === 1
    const shouldRightArrowDisable = this.state.currentPage === totalCalendarPages

    const breakPoint = 900
    const isDesktop = window.innerWidth > breakPoint
    const isEmpty = !(calenderDates && calenderDates.length > 0)
    const bookedSlotTime = this.props.country === 'india'
      ? get(this.props.bookSessionProps, 'slotTime')
      : get(this.props.bookSessionProps, 'intlSlotTime')
    return (
      <div
        className='book-session-body'
        style={{
          pointerEvents: this.props.visible ? 'auto' : 'none',
          position: 'relative'
        }}
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
      }}>
        <div className={cx('book-session-loading-container', this.props.loading && 'show')}>
          <div className='book-session-loading-bar-container'>
            <div />
          </div>
        </div>
        <div className='book-session-absolute-form relative'>
          {/* {(!isDesktop && this.state.shouldProgressBar) ? this.renderNavigation() : <></>} */}
          <div className='book-session-demo-slot-container'>
            {/* {!isDesktop && this.renderHeader()} */}
            <div style={{ display: 'flex', justifyContent: 'space-between',width: '100%', alignItems: 'center'  }}>
              <div className='book-session-student-title' style={{ position: 'relative', textAlign: isEmpty ? 'center' : 'initial' }}>
                {calenderDates && calenderDates.length > 0 ? 'Choose your slot' : 'There are no sessions available. Check again in some time.'}
              </div>
              {(calenderDates && calenderDates.length > 0 && this.props.country !== 'india') && (
                <Select
                  options={getTimezones()}
                  value={{ label: this.props.timezone, value: this.props.timezone }}
                  onChange={(timezone) => this.props.updateTimezone(timezone.value)}
                  isSearchable
                  className='book-session-grade-select'
                  classNamePrefix='book-session'
                  theme={theme => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary: '#00ADE6'
                    },
                  })}
                />
              )}
            </div>
            {calenderDates && calenderDates.length > 0 && (
                <>
                <div className='book-session-calender-date-container'>
                  {shouldArrows && (
                      <div className={cx('book-session-calender-arrow-wrapper', shouldLeftArrowDisable && 'disable')} onClick={() => {
                        if (!shouldLeftArrowDisable) {
                          this.setState({ currentPage: this.state.currentPage - 1 })
                        }
                      }}>
                        <div className='book-session-calender-arrow-container'></div>
                      </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'row', flex: 1, alignItems: 'center' }}>
                    {calenderDates.map((calenderDate, i) => (
                        <>
                          <div className='book-session-calender-date-wrapper' id="session-book-date" key={i} onClick={() => {
                            this.props.onDateChange(get(calenderDate, 'bookingDate'))
                          }}>
                            <div className={cx('book-session-calender-date-text', get(calenderDate, 'date') === this.props.selectedDate && 'active')}>
                              {get(calenderDate, 'date')}
                            </div>
                            <div className={cx('book-session-calender-day-text', get(calenderDate, 'date') === this.props.selectedDate && 'active')}>
                              {isDesktop
                                  ? get(calenderDate, 'day')
                                  : ['Today', 'Tomorrow'].includes(get(calenderDate, 'day'))
                                      ? get(calenderDate, 'day')
                                      : get(calenderDate, 'day').slice(0, 3)
                              }
                            </div>
                          </div>
                          {calenderDates.length - 1 !== i && (
                              <div className='book-session-calender-date-line'></div>
                          )}
                        </>
                    ))}
                  </div>
                  {shouldArrows && (
                      <div className={cx('book-session-calender-arrow-wrapper reverse', shouldRightArrowDisable && 'disable')} onClick={() => {
                        if (!shouldRightArrowDisable) {
                          this.setState({ currentPage: this.state.currentPage + 1 })
                        }
                      }}>
                        <div className='book-session-calender-arrow-container' style={{ transform: 'scale(-1)' }}></div>
                      </div>
                  )}
                </div>
                </>
            )}
              {morningSlots.length > 0 && (
                <div className='book-session-slots-container'>
                  <div className='book-session-icon-container morning-icon'></div>
                  <div className='book-session-slot-time-container'>
                    {morningSlots.map(slot => (
                      <div
                        key={get(slot, 'slotTime') + this.props.selectedDate} 
                        onClick={() => this.onSlotClick(slot)}
                        className={cx(
                          'book-session-slot-time-button',
                          (
                            (get(slot, 'slotTime') === this.state.selectedTime) ||
                            this.isBookedSlot(slot, bookedSlotTime)
                          ) && 'active',
                          (!get(slot, 'showSlot') && !this.isBookedSlot(slot, bookedSlotTime)) && 'disabled')}>
                        {(get(slot, 'slotTime') === this.state.selectedTime) || this.isBookedSlot(slot, bookedSlotTime)
                          ? <div className='book-session-slot-time-check'></div>
                          : <div className='book-session-slot-hole'></div>
                        }
                        <div
                          className={
                            cx(
                              'book-session-slot-time-text',
                              (get(slot, 'slotTime') === this.state.selectedTime || this.isBookedSlot(slot, bookedSlotTime)) && 'active'
                            )
                          }>
                            {getTimeLabel(
                              get(slot, 'time.startTime', ''),
                              slot
                            )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              )}
              {noonSlots.length > 0 && (
                <div className='book-session-slots-container'>
                  <div className='book-session-icon-container afternoon-icon'></div>
                  <div className='book-session-slot-time-container'>
                    {noonSlots.map(slot => (
                      <div
                        key={get(slot, 'slotTime') + this.props.selectedDate} 
                        onClick={() => this.onSlotClick(slot)}
                        className={cx(
                          'book-session-slot-time-button',
                          (
                            (get(slot, 'slotTime') === this.state.selectedTime) ||
                            this.isBookedSlot(slot, bookedSlotTime)
                          ) && 'active',
                          (!get(slot, 'showSlot') && !this.isBookedSlot(slot, bookedSlotTime)) && 'disabled')}>
                        {(get(slot, 'slotTime') === this.state.selectedTime) || this.isBookedSlot(slot, bookedSlotTime)
                          ? <div className='book-session-slot-time-check'></div>
                          : <div className='book-session-slot-hole'></div>
                        }
                        <div
                          className={
                            cx(
                              'book-session-slot-time-text',
                              (get(slot, 'slotTime') === this.state.selectedTime || this.isBookedSlot(slot, bookedSlotTime)) && 'active'
                            )
                          }>
                            {getTimeLabel(
                              get(slot, 'time.startTime', ''),
                              slot
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {nightSlots.length > 0 && (
                <div className='book-session-slots-container'>
                  <div className='book-session-icon-container night-icon'></div>
                  <div className='book-session-slot-time-container'>
                    {nightSlots.map(slot => (
                      <div
                        key={get(slot, 'slotTime') + this.props.selectedDate} 
                        onClick={() => this.onSlotClick(slot)}
                        className={cx(
                          'book-session-slot-time-button',
                          (
                            (get(slot, 'slotTime') === this.state.selectedTime) ||
                            this.isBookedSlot(slot, bookedSlotTime)
                          ) && 'active',
                          (!get(slot, 'showSlot') && !this.isBookedSlot(slot, bookedSlotTime)) && 'disabled')}>
                        {(get(slot, 'slotTime') === this.state.selectedTime) || this.isBookedSlot(slot, bookedSlotTime)
                          ? <div className='book-session-slot-time-check'></div>
                          : <div className='book-session-slot-hole'></div>
                        }
                        <div
                          className={
                            cx(
                              'book-session-slot-time-text',
                              (get(slot, 'slotTime') === this.state.selectedTime || this.isBookedSlot(slot, bookedSlotTime)) && 'active'
                            )
                          }>
                            {getTimeLabel(
                              get(slot, 'time.startTime', ''),
                              slot
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button id='success-submit-session' title={isEmpty ? 'Okay' : 'Confirm Slots'} className={cx('confirm-slot-button', (!(this.state.selectedTime) && this.state.selectedTime !== 0 && !isEmpty) && 'disabled')} onClick={() => {
                if (isEmpty) {
                  this.props.close()
                } else {
                  this.props.onConfirm(this.state.selectedTime, this.props.selectedDate, this.state.bookingDate)
                }
              }} />
          </div>
        </div>
      </div>
    )
  }
}
