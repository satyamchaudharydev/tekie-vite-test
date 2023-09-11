import React, { Component } from 'react'
import cx from 'classnames'
import { format } from 'date-fns'
import { get } from 'lodash'
import PopUp from '../../../../components/PopUp/PopUp'
import styles from './OtpValidation.module.scss'
import slotLabel from '../../../../utils/slots/slot-label'
import SimpleButtonLoader from '../../../../components/SimpleButtonLoader'
import getIntlDateTime from '../../../../utils/time-zone-diff'

const buttonTextProps = {
    hideIconContainer: true,
    buttonTextCenterAligned: true
}

class OtpValidation extends Component {
    constructor(props) {
        super(props)
        this.state = {
            otpFirst: '',
            otpSecond: '',
            otpThird: '',
            otpFourth: ''
        }
    }

    componentDidUpdate(prevProps) {
        const { visible } = this.props
        if (visible && !prevProps.visible) {
            this.otpFirstInput.focus()
            this.setState({
                otpFirst: '',
                otpSecond: '',
                otpThird: '',
                otpFourth: ''
            })
        }
    }

    render() {
        const {
            visible,
            closeModal,
            loggedInUser,
            bookingDetails,
            confirm,
            showLoading,
            timezone
        } = this.props
        let date = new Date(get(bookingDetails, 'date'))
        let timeLabel = `${slotLabel(get(bookingDetails, 'time')).startTime} - ${slotLabel(get(bookingDetails, 'time')).endTime}`
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        if (timezone !== 'Asia/Kolkata' && country !== 'india') {
            const intlBookingDetails = getIntlDateTime(date, get(bookingDetails, 'time'), timezone)
            timeLabel = intlBookingDetails.intlTimeLabel
        }
        return (
            <PopUp
                style={{ position: 'fixed', zIndex: 9999, }}
                showPopup={visible}
                closePopUp={closeModal}
            >
                <div className={styles.mainContainer}>
                    <div className={styles.topContainer}>
                        <div className={styles.title}>Confirm Booking</div>
                    </div>
                    <div className={styles.middleContainer}>
                        <div style={{ display: 'flex', flexDirection: 'row' }}>
                            <div className={styles.text}>Verify your</div>
                            <div className={styles.text} style={{  marginLeft: '5px', marginRight: '5px', fontWeight: 'bold' }}>{(get(this.props, 'topicDetails.title'))}</div>
                            <div className={styles.text}>class for</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.calendar}></div>
                            <div className={styles.dateTimeText}>{
                                date && date.getDate &&
                                `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${country !== 'india' ? `(${timezone})` : ''}`
                            }</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.clock}></div>
                            <div className={styles.dateTimeText}>{timeLabel}</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.text}>Please enter the OTP sent to</div>
                            <div className={styles.mobileNumber}>{
                                loggedInUser &&
                                `${get(loggedInUser.toJS(), 'parent.phone.countryCode')} ${get(loggedInUser.toJS(), 'parent.phone.number')}`
                            }</div>
                        </div>
                        <div className={styles.row}>
                            <input
                                className={cx(styles.otpBox, this.state.otpFirst.length ? styles.filledOtpBox : styles.emptyOtpBox)}
                                onChange={(event) => {
                                    if (this.state.otpFirst.length === 0 || event.target.value.length === 0) {
                                        this.setState({ otpFirst: event.target.value }, () => {
                                            if (this.state.otpFirst.length === 1) {
                                                this.otpSecondInput.focus()
                                            }
                                        })
                                    }
                                }}
                                value={this.state.otpFirst}
                                type='text'
                                ref={(input) => { this.otpFirstInput = input }}
                            />
                            <input
                                className={cx(styles.otpBox, this.state.otpSecond.length ? styles.filledOtpBox : styles.emptyOtpBox)}
                                onChange={(event) => {
                                    if (this.state.otpSecond.length === 0 || event.target.value.length === 0) {
                                        this.setState({ otpSecond: event.target.value }, () => {
                                            if (this.state.otpSecond.length === 1) {
                                                this.otpThirdInput.focus()
                                            }
                                        })
                                    }
                                }}
                                value={this.state.otpSecond}
                                type='text'
                                ref={(input) => { this.otpSecondInput = input }}
                            />
                            <input
                                className={cx(styles.otpBox, this.state.otpThird.length ? styles.filledOtpBox : styles.emptyOtpBox)}
                                onChange={(event) => {
                                    if (this.state.otpThird.length === 0 || event.target.value.length === 0) {
                                        this.setState({ otpThird: event.target.value }, () => {
                                            if (this.state.otpThird.length === 1) {
                                                this.otpFourthInput.focus()
                                            }
                                        })
                                    }
                                }}
                                value={this.state.otpThird}
                                type='text'
                                ref={(input) => { this.otpThirdInput = input }}
                            />
                            <input
                                className={cx(styles.otpBox, this.state.otpFourth.length ? styles.filledOtpBox : styles.emptyOtpBox)}
                                onChange={(event) => {
                                    if (this.state.otpFourth.length === 0 || event.target.value.length === 0) {
                                        this.setState({ otpFourth: event.target.value }, () => {
                                            if (this.state.otpFourth.length === 1) {
                                                this.otpFourthInput.blur()
                                            }
                                        })
                                    }
                                }}
                                value={this.state.otpFourth}
                                type='text'
                                ref={(input) => { this.otpFourthInput = input }}
                            />
                        </div>
                    </div>
                    <div className={styles.bottomContainer}>
                        <div
                            className={cx(styles.button, styles.cancelButton)}
                            onClick={() => closeModal()}
                        >Cancel</div>
                        <div
                            className={cx(styles.button, styles.confirmButton)}
                            onClick={() => {
                                if (
                                    this.state.otpFirst.length &&
                                    this.state.otpSecond.length &&
                                    this.state.otpThird.length &&
                                    this.state.otpFourth.length
                                ) {
                                    confirm(`${this.state.otpFirst}${this.state.otpSecond}${this.state.otpThird}${this.state.otpFourth}`)
                                }
                            }}
                        >
                            <div>Confirm Booking</div>
                            <SimpleButtonLoader
                                showLoader={showLoading}
                                rightPositioned
                            />
                        </div>
                        {/* <ActionButton
                            {...buttonTextProps}
                            title='Confirm Booking'
                            showLoader={showLoading}
                            onClick={() => {
                                if (
                                    this.state.otpFirst.length &&
                                    this.state.otpSecond.length &&
                                    this.state.otpThird.length &&
                                    this.state.otpFourth.length
                                ) {
                                    confirm(`${this.state.otpFirst}${this.state.otpSecond}${this.state.otpThird}${this.state.otpFourth}`)
                                }
                            }}
                            isPadded
                            hoverToCursor
                            active
                        /> */}
                    </div>
                </div>
            </PopUp>
        )
    }
}

export default OtpValidation
