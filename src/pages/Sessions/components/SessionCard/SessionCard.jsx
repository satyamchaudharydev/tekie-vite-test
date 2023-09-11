import React, { Component } from 'react'
import cx from 'classnames'
import { get } from 'lodash'
import styles from './SessionCard.module.scss'
import ActionButton from '../../../../components/Buttons/ActionButton'
import formatDate from '../../../../utils/date-utils/formateDate'
import getPath from '../../../../utils/getPath'
import getSlotLabel from '../../../../utils/slots/slot-label'
import { getToasterBasedOnType } from '../../../../components/Toaster'
import { slotBookMessage } from '../../../../constants/sessions/messages'
import getIntlDateTime from '../../../../utils/time-zone-diff'

const bookSessionButtonProps = {
    isSmallButton: true,
    hoverToCursor: true,
    hideIconContainer: true
}

const noBookingAllowedToastrProps = {
    type: 'loading',
    message: `${slotBookMessage}`
}

class SessionCard extends Component {
    getSlotTimeLabel = (slotTime) => {
        const { loggedInUser, bookingDate } = this.props
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        const timezone = localStorage.getItem('timezone')
        let slotLabel
        if (country !== 'india' && timezone !== 'Asia/Kolkata') {
            const intlDateTime = getIntlDateTime(
                bookingDate,
                slotTime,
                timezone
            )
            slotLabel = intlDateTime.intlTimeLabel
        } else {
            slotLabel = getSlotLabel(slotTime)
        }

        return `${slotLabel.startTime} - ${slotLabel.endTime}`
    }

    getActionButtonTitle = () => {
        const { isBookedSession, isCompletedSession } = this.props
        let title = ''
        if (isBookedSession) {
            title = 'Book Session'
        } else if (isCompletedSession) {
            title = 'Revisit Session'
        }
        else {
            title = 'Edit Session'
        }

        return title
    }

    handleOnClick = () => {
        const { id, isBookedSession, isActive, showBookPopup, showEditPopup,
            topicTitle, topicId, bookingDate, slotTime, handleSessionRevisit,
            showBookingNotAllowedToastr, isCompletedSession } = this.props
        if (isActive) {
            if (showBookingNotAllowedToastr && isBookedSession) {
                getToasterBasedOnType(noBookingAllowedToastrProps)
            } else if (isBookedSession) {
                showBookPopup(topicTitle, topicId)
            } else if (isCompletedSession) {
                handleSessionRevisit(topicId)
            }
            else {
                showEditPopup(id, topicId, topicTitle, bookingDate, slotTime)
            }
        }
    }

    getDate = (bookingDate, isCompletedSession) => {
        if (isCompletedSession) {
            return formatDate(bookingDate)
        } else {

        }
    }

    renderCardContent = () => {
        const {
            topicTitle,
            topicThumbnail,
            bookingDate,
            slotTime,
            loggedInUser
        } = this.props
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        const timezone = localStorage.getItem('timezone')
        let date, slotTimeLabel
        if (country !== 'india' && timezone !== 'Asia/Kolkata') {
            const intlDateTime = getIntlDateTime(
                bookingDate,
                slotTime,
                timezone
            )
            date = get(intlDateTime, 'intlDate')
            slotTimeLabel = get(intlDateTime, 'intlTimeLabel')
        } else {
            date = formatDate(new Date(bookingDate)).date
            slotTimeLabel = `${getSlotLabel(slotTime).startTime} - ${getSlotLabel(slotTime).endTime}`
        }

        return (
            <div>
                <div className={styles.topicNameContainer}>
                    <div className={styles.topicName}>{topicTitle}</div>
                </div>
                <div className={styles.thumbnailContainer}
                    style={{
                        backgroundImage: `url("${topicThumbnail && getPath(topicThumbnail.uri)}")`
                    }}
                >
                    <div className={styles.leftPanel}>
                        <div className={styles.dateTimeContainer}>
                            <div className={styles.iconAndTextContainer}>
                                <div className={
                                    cx(styles.iconContainer, styles.calendarImage)
                                } />
                                {
                                    bookingDate
                                        ? (
                                            <div className={
                                                cx(styles.textContainer,
                                                    styles.textContainerFullWidth
                                                )}>
                                                {
                                                    date
                                                }
                                            </div>
                                        ) :
                                        (
                                            <div className={
                                                cx(styles.emptyDateTimeText,
                                                    styles.textContainerFullWidth
                                                )}>
                                                Session Date
                                            </div>
                                        )
                                }
                            </div>
                            <div className={styles.iconAndTextContainer}>
                                <div className={
                                    cx(styles.iconContainer, styles.clockImage)
                                } />
                                {
                                    slotTime || slotTime === 0
                                        ? (
                                            <div className={
                                                cx(styles.textContainer,
                                                    styles.textContainerFullWidth
                                                )}>
                                                {
                                                    slotTimeLabel
                                                }
                                            </div>
                                        ) :
                                        (
                                            <div className={
                                                cx(styles.emptyDateTimeText,
                                                    styles.textContainerFullWidth
                                                )}>
                                                Session Time
                                            </div>
                                        )
                                }
                            </div>
                        </div>
                        <div className={styles.buttonContainer}>
                            <ActionButton
                                {...bookSessionButtonProps}
                                active={this.props.isActive}
                                hoverToCursor={this.props.isActive}
                                title={this.getActionButtonTitle()}
                                onClick={this.handleOnClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    renderLastCardInTheRow = (isLastRow) => {
        if (!isLastRow) {
            return (
                <div className={styles.lastCardContainer}>
                    {this.renderCardContent()}
                </div>
            )
        }

        return (
            <div className={styles.lastRowLastCardContainer}>
                {this.renderCardContent()}
            </div>
        )
    }

    renderCards = (isLastRow) => {
        if (!isLastRow) {
            return (
                <div
                    className={styles.cardContainer}
                >
                    {this.renderCardContent()}
                </div>
            )
        }

        return (
            <div className={styles.lastRowCardContainer}>
                {this.renderCardContent()}
            </div>
        )
    }

    render() {
        const { isLastCard, isLastRow } = this.props
        return (
            <div>
                {
                    isLastCard
                        ?
                        this.renderLastCardInTheRow(isLastRow)
                        :
                        this.renderCards(isLastRow)
                }
            </div>
        )
    }
}



export default SessionCard
