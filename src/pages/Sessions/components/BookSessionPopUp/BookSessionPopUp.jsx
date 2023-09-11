import React, { Component } from 'react'
import cx from 'classnames'
import Select from 'react-select'
import PopUp from '../../../../components/PopUp/PopUp'
import Modal from '../../../../components/Modal'
import BookingCalendar from '../../../../components/Calendar'
import styles from './BookSessionPopUp.module.scss'
import { getToasterBasedOnType } from '../../../../components/Toaster'
import { noSlotsMessage } from '../../../../constants/sessions/messages'
import config from '../../../../config'
import offsetDate from '../../../../utils/date-utils/date-offset'
import {
    minutesParser,
    getAction,
    getSlotLabelWithMinutes,
    getSelectedHrsWithOffset
} from '../../../../utils/date-utils/parse-intl-time'
import { hs, hsm } from "../../../../utils/size";
import SimpleButtonLoader from "../../../../components/SimpleButtonLoader";
import { get } from 'lodash'
import getTimezones from '../../../../utils/time-zones'
import './selectableInput.css'
import moment from 'moment'

const noSlotSelectedErrorToastProps = {
    type: 'error',
    message: 'No slot selected!'
}

const colourStyles = {
    dropdownIndicator: styles => ({
        ...styles,
        padding: `0px ${hs(8)}px 0px 0px`,
    }),
    input: styles => ({
        ...styles,
        fontFamily: 'Nunito',
    }),
    indicatorSeparator: styles => ({
        ...styles,
        display: 'none',
        padding: '0px'
    }),
    control: styles => ({
        ...styles, backgroundColor: 'white',
        borderColor: '#00ade6',
        borderRadius: '6px',
        width: `${hs(320)}px`,
        minHeight: `${hs(37)}px`,
        height: `${hs(50)}px`,
        color: 'rgba(0, 0, 0, 0.6)',
        '&:hover': {
            borderColor: '#00ade6'
        }
    }),
    singleValue: (provided) => ({
        ...provided,
        color: 'rgba(0, 0, 0, 0.6)',
        minHeight: `${hs(37)}px`,
        position: 'relative',
        top: `${hs(21)}px`
    }),
    option: (styles, { isDisabled, isFocused, isSelected }) => {
        return {
            ...styles,
            width: `${hs(320)}px`,
            backgroundColor: isDisabled
                ? null
                : isSelected
                    ? '#ffffff'
                    : isFocused
                        ? '#e7fbfd'
                        : '#ffffff',
            color: isDisabled
                ? '#ccc'
                : isSelected
                    ? 'rgba(0, 0, 0, 0.6)'
                    : 'rgba(0, 0, 0, 0.6)',
            cursor: isDisabled ? 'not-allowed' : 'default',
            '&:hover': {
                backgroundColor: !isDisabled && '#e7fbfd',
            },
            ':active': {
                ...styles[':active'],
                backgroundColor: !isDisabled && (isSelected ? '#e7fbfd' : '#504f4f'),
            },
        };
    },
};

class BookSessionPopUp extends Component {
    constructor(props) {
        super(props);
        const defaultTimezone = localStorage.getItem('timezone') && localStorage.getItem('timezone') !== null && localStorage.getItem('timezone').length
            ? localStorage.getItem('timezone')
            : moment.tz.guess()
        this.state = {
            statusArray: this.props.availableSlotStatusWithLabel,
            width: window.innerWidth,
            dateSelected: this.props.selectedDate,
            offsetDateBy: 0,
            updatingTimezone: false,
            selectedTimezone: {
                value: defaultTimezone,
                label: defaultTimezone
            }
        }
    }

    componentDidMount() {
        window.addEventListener('resize', () => {
            const { innerWidth } = window
            if (this.state.width !== innerWidth) {
                this.setState({
                    width: innerWidth
                })
            }
        })
    }

    componentDidUpdate(prevProps, prevState) {
        const country = this.props.loggedInUser && get(this.props.loggedInUser.toJS(), 'parent.country')
            ? get(this.props.loggedInUser.toJS(), 'parent.country')
            : 'india'
        const userId = this.props.mentee && this.props.mentee.toJS().id
        if (
            prevProps.availableSlotStatusWithLabel !== this.props.availableSlotStatusWithLabel &&
            !this.props.showLoader &&
            !this.state.updatingTimezone
        ) {
            this.setState({
                statusArray: this.props.availableSlotStatusWithLabel
            })
        }

        if (
            new Date(prevProps.selectedDate).setHours(0, 0, 0, 0) !==
            new Date(this.props.selectedDate).setHours(0, 0, 0, 0)
        ) {
            this.setState({
                dateSelected: new Date(this.props.selectedDate)
            })
        }

        if (this.state.selectedTimezone !== prevState.selectedTimezone && country !== 'india') {
            this.props.updateSelectedTimezone(get(this.state.selectedTimezone, 'value'))
        }

        if (this.props.showPopup && !prevProps.showPopup) {
            const defaultTimezone = localStorage.getItem('timezone') && localStorage.getItem('timezone') !== null && localStorage.getItem('timezone').length
                ? localStorage.getItem('timezone')
                : moment.tz.guess()
            this.setState({
                selectedTimezone: {
                    value: defaultTimezone,
                    label: defaultTimezone
                }
            }, () => {
                if (country !== 'india') {
                    this.props.updateSelectedTimezone(this.state.selectedTimezone.value)
                }
            })
        }
    }

    toggleStatusOfSlotClicked = (event, slot) => {
        const selectedSlotId = event.target.id
        const currentStatusArray = this.state.statusArray
        const selectedSlotNumber = selectedSlotId.substring(selectedSlotId.indexOf('t') + 1, selectedSlotId.length)
        for (let i = 0; i < currentStatusArray.length; i += 1) {
            if (parseInt(selectedSlotNumber) === i && slot.quantity > 0) {
                currentStatusArray[i].status = !currentStatusArray[i].status
                this.setState({
                    statusArray: currentStatusArray
                })
            } else if (currentStatusArray[i].status) {
                currentStatusArray[i].status = !currentStatusArray[i].status
            }
        }
    }

    getSlotTimeContainerStyle = (quantity) => {
        if (quantity > 0) {
            return styles.slotTimeContainer
        }

        return (
            cx(
                styles.slotTimeContainer,
                styles.emptySession
            )
        )
    }

    shouldRenderSlot = (slotTime, topicId) => {
        const { selectedDate, topics, loggedInUser } = this.props
        const { selectedTimezone } = this.state
        const country = loggedInUser && get(loggedInUser.toJS(), 'parent.country')
            ? get(loggedInUser.toJS(), 'parent.country')
            : 'india'
        const lag = country !== 'india' ? config.usaTimeLag : config.timeLag
        const firstTopicId = topics[0] && topics[0].id
        const slotId = slotTime.id

        //Disable all slots on old dates.
        if (
            new Date(selectedDate).setHours(0, 0, 0, 0) <
            new Date().setHours(0, 0, 0, 0)
        ) {
            return false
        }

        //Disable slots for next 4 hours from any time for indian users.
        if (
            new Date(selectedDate).setHours(0, 0, 0, 0) ===
            new Date().setHours(0, 0, 0, 0) &&
            topicId === firstTopicId &&
            (country === 'india' || this.state.selectedTimezone.value === 'Asia/Kolkata')
        ) {
            const currentHr = new Date().getHours()
            const currentMin = new Date().getMinutes()
            const addExtra = currentMin > 30 ? 1 : 0
            if ((currentHr + addExtra + config.timeLag) >= slotTime.id) {
                return false
            }
        }

        //Disable slots for next 24 hours from any time for usa users.
        if (country === 'usa' && this.state.selectedTimezone.value !== 'Asia/Kolkata') {
            let dateAfterTimeLagOffset = new Date(new Date().getTime() + (config.usaTimeLag * 60 * 60 * 1000))
            let hoursAfterTimeLagOffset = dateAfterTimeLagOffset.getHours()
            if (new Date(dateAfterTimeLagOffset).getMinutes() >= 30) {
                dateAfterTimeLagOffset = new Date(dateAfterTimeLagOffset.getTime() + (30 * 60 * 1000))
                hoursAfterTimeLagOffset = dateAfterTimeLagOffset.getHours()
            }
            //Disabling the slots on days which are earlier than the offsetted date.
            if (new Date(selectedDate).setHours(0, 0, 0, 0) < dateAfterTimeLagOffset.setHours(0, 0, 0, 0)) {
                return false
            }
            //Disabling slots on next day that are on the offsetted date and before the offsetted time.
            if (
                new Date(selectedDate).setHours(0, 0, 0, 0) === dateAfterTimeLagOffset.setHours(0, 0, 0, 0) &&
                get(slotTime, 'intlId') < hoursAfterTimeLagOffset
            ) {
                return false
            }
        }

        //Disable the old slots in the selected timezones. 
        if (country !== 'india' && moment.tz.guess() !== this.state.selectedTimezone.value) {
            const isOldSlotInSelectedTimezone =
                moment().tz(this.state.selectedTimezone.value).format('DD/MM/YYYY') < moment(selectedDate).format('DD/MM/YYYY') || (
                    moment().tz(this.state.selectedTimezone.value).format('DD/MM/YYYY') === moment(selectedDate).format('DD/MM/YYYY') &&
                    get(slotTime, 'intlId') > moment().tz(this.state.selectedTimezone.value).hours()
                )

            return isOldSlotInSelectedTimezone
        }

        //If a user comes at or after 8pm, then disable slots at 8am, 9am, and 10am in the next morning for indian users.
        if (
            new Date(selectedDate).setHours(0, 0, 0, 0) ===
            offsetDate(new Date(), 1, 'ADD').setHours(0, 0, 0, 0) &&
            new Date().getHours() >= 20 &&
            topicId === firstTopicId &&
            (slotId === 8 || slotId === 9 || slotId === 10) &&
            (country === 'india' || this.state.selectedTimezone.value === 'Asia/Kolkata')
        ) {
            return false
        }

        //If a user comes at or after 12am, then disable slots at 8am, 9am, and 10am for indian users.
        if (
            new Date(selectedDate).setHours(0, 0, 0, 0) ===
            new Date().setHours(0, 0, 0, 0) &&
            new Date().getHours() <= 5 &&
            topicId === firstTopicId &&
            (slotId === 8 || slotId === 9 || slotId === 10) &&
            (country === 'india' || this.state.selectedTimezone.value === 'Asia/Kolkata')
        ) {
            return false
        }

        return true
    }

    renderSlots = (availableSlotStatusWithLabel) => {
        if (availableSlotStatusWithLabel.length > 0) {
            return availableSlotStatusWithLabel.map((slot, index) => {
                if (!this.shouldRenderSlot(slot, this.props.topicId)) {
                    slot.quantity = 0
                }
                return (
                    <div
                        id={`slot${index}`}
                        className={cx(
                            this.getSlotTimeContainerStyle(slot.quantity),
                            slot.status
                                ? styles.sessionSelected
                                : styles.sessionNotSelected
                        )}
                        onClick={(event) => this.toggleStatusOfSlotClicked(event, slot)}
                    >
                        {slot.label}
                    </div>
                )
            })
        }

        return (
            <div className={styles.noSlotsMessage}>{
                noSlotsMessage.split(' ').map((word) => (
                    <div>{`${word}`}&nbsp;</div>
                ))}
            </div>
        )
    }

    getCurrentDate = () => {
        const date = new Date(this.props.selectedDate)
        return `${date.toLocaleString('default', { month: 'long' })} 
        ${date.getDate()}, ${date.getFullYear()}`
    }

    checkIfSlotSelected = (statusArray) => {
        for (let i = 0; i < statusArray.length; i += 1) {
            if (statusArray[i].status) {
                return true
            }
        }

        return false
    }

    getSelectedSlot = (statusArray) => {
        for (let i = 0; i < statusArray.length; i += 1) {
            if (statusArray[i].status) {
                return get(statusArray[i], 'id')
            }
        }
    }

    getSelectedSlotObj = (statusArray) => {
        for (let i = 0; i < statusArray.length; i += 1) {
            if (statusArray[i].status) {
                return statusArray[i]
            }
        }
    }

    onSaveClicked = async () => {
        const { editingSession, onBookClicked, onEditClicked, loggedInUser } = this.props
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        const isSlotSelected = this.checkIfSlotSelected(this.state.statusArray)
        if (isSlotSelected) {
            const bookingDetails = {
                date: this.state.dateSelected,
                time: this.getSelectedSlot(this.state.statusArray),
                istDate: country !== 'india'
                    ? get(this.getSelectedSlotObj(this.state.statusArray), 'date')
                    : this.state.dateSelected
            }
            if (editingSession) {
                this.setState({
                    updatingTimezone: false
                })
                onEditClicked(this.state.statusArray, bookingDetails)
            } else {
                this.setState({
                    updatingTimezone: false
                })
                onBookClicked(this.state.statusArray, this.props.topicId, bookingDetails)
            }
        } else {
            getToasterBasedOnType(noSlotSelectedErrorToastProps)
        }
    }

    getWeekDay = (day) => {
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat']
        return weekDays[day]
    }

    renderDateTablets = () => {
        let startDate
        if (this.props.editingSession) {
            startDate = this.props.calendarStartDate
        } else {
            startDate = this.props.defaultDate
        }
        const days = []
        for (let i = 0; i < config.bookingDaysCutOff; i += 1) {
            days.push(offsetDate(new Date(startDate), i, 'ADD'))
        }
        return days.map((day) => (
            <div className={cx(
                styles.dateTablet,
                new Date(this.state.dateSelected).setHours(0, 0, 0, 0) ===
                    new Date(day).setHours(0, 0, 0, 0)
                    ? styles.selectedDateTablet
                    : ''
            )}
                onClick={() => this.setState({
                    dateSelected: day
                }, () => {
                    this.props.onDateChange(new Date(day))
                })}
            >
                <div className={styles.dateText}>
                    {
                        this.getWeekDay(day.getDay())
                            ? this.getWeekDay(day.getDay()).toUpperCase()
                            : ''
                    }
                </div>
                <div className={styles.dateText}>
                    {day.getDate()}
                </div>
            </div>
        ))
    }

    getSelectedSlotWithOffset = () => {
        const { statusArray } = this.state
        let offsetHrs = (new Date().getTimezoneOffset() + 330) / 60
        let action = getAction(offsetHrs)
        offsetHrs = Math.abs(offsetHrs)
        let selectedSlot = 0
        statusArray.forEach(slot => {
            if (slot.status) {
                selectedSlot = slot.id
            }
        })
        const selectedMin = minutesParser(offsetHrs - Math.floor(offsetHrs))
        const selectedHrs = getSelectedHrsWithOffset(selectedSlot, action, offsetHrs, selectedMin)
        /*if (action == 'ADD' && selectedHrs < selectedSlot) {
            this.setState({
                offsetDateBy: 1
            })
        } else if (action == 'SUBTRACT' && selectedHrs > selectedSlot) {
            this.setState({
                offsetDateBy: -1
            })
        }*/

        return getSlotLabelWithMinutes(selectedHrs, selectedMin)
    }

    render() {
        const {
            availableSlotStatusWithLabel,
            salesOperationInfo,
            topicOrder,
            slotLoading,
            loggedInUser
        } = this.props
        const allottedMentor = salesOperationInfo && get(salesOperationInfo.toJS(), '0.allottedMentor.name')
        const country = loggedInUser && get(loggedInUser.toJS(), 'parent.country')
            ? get(loggedInUser.toJS(), 'parent.country')
            : 'india'
        return (
            <PopUp
                showPopup={this.props.showPopup}
                closePopUp={this.props.closeModal}
                ref={this.props.ref}
            >
                {
                    this.props.showBookSessionInfoFetchLoader
                        ? (
                            <div className={styles.fetchSessionInfoLoaderBox}>
                                Fetching Session Info
                                <div style={{ marginLeft: `${hs(20)}px`, display: 'flex' }}>
                                    <SimpleButtonLoader
                                        showLoader={this.props.showBookSessionInfoFetchLoader}
                                        style={{ backgroundImage: 'linear-gradient(to bottom, transparent, transparent)' }}
                                    />
                                </div>
                            </div>
                        ) : <div />
                }
                {
                    !this.props.showBookSessionInfoFetchLoader
                        ? (
                            <Modal
                                title={this.props.topicName}
                                onCancel={this.props.closeModal}
                                visible={this.props.showPopup}
                                actionButtonTitle={this.props.editingSession ? 'Edit Session' : 'Book Session'}
                                onSave={() => {
                                    if (!(this.props.showLoader || this.state.updatingTimezone)) {
                                        this.onSaveClicked()
                                    }
                                }}
                                showLoader={this.props.showLoader || this.state.updatingTimezone}
                                topicOrder={topicOrder}
                                updateSelectedTimezone={(timezone) => this.setState({ selectedTimezone: timezone })}
                                loggedInUser={this.props.loggedInUser}
                                allottedMentor={
                                    allottedMentor && allottedMentor.length
                                        ? allottedMentor.split(' ')[0]
                                        : allottedMentor
                                }
                            >
                                {
                                    this.state.width > 900
                                        ? (
                                            <div style={{ display: 'flex' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    marginLeft: '20px',
                                                    marginRight: '20px'
                                                }}>
                                                    <BookingCalendar
                                                        onDateChange={(date) => this.props.onDateChange(date)}
                                                        selectedDate={this.props.selectedDate}
                                                        defaultDate={this.props.defaultDate}
                                                        editingSession={this.props.editingSession}
                                                        lastSessionDate={this.props.lastSessionDate}
                                                        currTopicOrder={this.props.currTopicOrder}
                                                        calendarStartDate={this.props.calendarStartDate}
                                                    />
                                                </div>
                                                <div className={styles.horizontalLine} />
                                                <div className={styles.sessionTimeContainer}>
                                                    <div className={styles.dateContainer}>
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'row'
                                                            }}
                                                            className='searchableSelect'
                                                        >
                                                            <div>{this.getCurrentDate()}</div>
                                                            {
                                                                country !== 'india'
                                                                    ? (
                                                                        <div className={styles.timezoneSelect}>
                                                                            <Select
                                                                                options={getTimezones()}
                                                                                value={this.state.selectedTimezone}
                                                                                onChange={(value) => this.setState({ selectedTimezone: value })}
                                                                                isSearchable
                                                                                styles={colourStyles}
                                                                            />
                                                                        </div>
                                                                    ) : <div />
                                                            }
                                                        </div>
                                                        {
                                                            allottedMentor && allottedMentor.length && topicOrder !== 1 && country === 'india'
                                                                ? <div className={styles.mentorName}>{`(${allottedMentor.split(' ')[0]}'s availability)`}</div>
                                                                : <div />
                                                        }
                                                    </div>
                                                    <div>
                                                        {
                                                            slotLoading
                                                                ? (
                                                                    <div className={cx(styles.slotsContainer, styles.justifyStart)}>
                                                                        <div className={styles.slotsContainerLoader}>
                                                                            <SimpleButtonLoader showLoader={slotLoading} />
                                                                            <div style={{ fontFamily: 'Nunito', fontSize: `${hs(24)}px`, color: '#6b7897' }}>Loading slots...</div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                                : (
                                                                    <div className={
                                                                        cx(
                                                                            styles.slotsContainer,
                                                                            availableSlotStatusWithLabel.length > 0
                                                                                ? styles.justifyStart
                                                                                : styles.justifyCenterWithFixedHeight
                                                                        )
                                                                    }>
                                                                        {this.renderSlots(availableSlotStatusWithLabel)}
                                                                    </div>
                                                                )
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                <div className={styles.dateContainerHr}>
                                                    {this.renderDateTablets()}
                                                </div>
                                                {
                                                    <div className={styles.slotsContainer}>
                                                        {
                                                            slotLoading
                                                                ? (
                                                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', marginLeft: `${hsm(20)}px` }}>
                                                                        <SimpleButtonLoader showLoader={slotLoading} />
                                                                        <div style={{ fontFamily: 'Nunito', fontSize: `${hsm(14)}px`, color: '#6b7897' }}>Loading slots...</div>
                                                                    </div>
                                                                ) : this.renderSlots(availableSlotStatusWithLabel)
                                                        }
                                                    </div>
                                                }
                                            </div>
                                        )
                                }
                            </Modal>
                        ) : <div />
                }
            </PopUp>
        )
    }
}

export default BookSessionPopUp


