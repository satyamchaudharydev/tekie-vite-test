import React, { Component } from 'react'
import Calendar from 'react-calendar'
import config from '../../config'
import './Calendar.scss'
import styles from '../../pages/Sessions/components/BookSessionPopUp/BookSessionPopUp.module.scss'
import offsetDate from '../../utils/date-utils/date-offset'

class BookingCalendar extends Component {
    onClick = (date) => {
        this.props.onDateChange(date)
    }

    getDate = (date) => {
        return new Date(date).setHours(0, 0, 0, 0)
    }

    disableOldDates = (current) => {
        if (current) {
            const { currTopicOrder, editingSession, defaultDate } = this.props
            const calendarStartDate = this.getDate(new Date(this.props.calendarStartDate))
            // const defaultDate = this.getDate(new Date()) < this.getDate(new Date(this.props.defaultDate))
            //     ? this.getDate(new Date())
            //     : this.getDate(new Date(this.props.defaultDate))
            const date = this.getDate(current.date)
            let dateToOffsetFrom = new Date()
            let dateAfterOffset = this.getDate(offsetDate(dateToOffsetFrom, config.daysToBookFrom, 'ADD'))
            let startDate
            if (editingSession) {
                startDate = this.props.calendarStartDate
            } else {
                startDate = this.props.defaultDate
            }
            if (startDate && startDate != null) {
                dateToOffsetFrom = new Date(startDate)
                dateAfterOffset = offsetDate(dateToOffsetFrom, config.daysToBookFrom, 'ADD')
            }
            
            return (
                (date < calendarStartDate || (date < dateToOffsetFrom ||  date > dateAfterOffset)) &&
                this.getDate(defaultDate) !== date
            )
        }

        return false
    }

    render () {
        return (
            <div className={styles.calendarContainer}>
                <Calendar
                    onChange={(date) => this.onClick(date)}
                    tileDisabled={this.disableOldDates.bind(this)}
                    value={this.props.selectedDate}
                />
            </div>
        )
    }
}

export default BookingCalendar
