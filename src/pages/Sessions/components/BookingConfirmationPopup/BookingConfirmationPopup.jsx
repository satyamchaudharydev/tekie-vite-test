import React from 'react'
import cx from 'classnames'
import moment from 'moment'
// import { Button } from '../../../../photon';
import getSlotLabel from '../../../../utils/slots/slot-label'
import './BookingConfirmationPopup.scss'
import { get } from 'lodash';
import getIntlDateTime from '../../../../utils/time-zone-diff';

const BookingConfirmationPopup = ({ visibility = false, sessionDetails, country, timezone, closeConfirmModal }) => {
  const { intlDateObj, intlSlot } = getIntlDateTime(
                    get(sessionDetails, 'sessionDate'),
                    new Date(get(sessionDetails, 'sessionDate')).getHours(),
                    timezone
  )
  const getDate = () => {
        if (get(sessionDetails, 'sessionDate')) {
            if (country !== 'india') {
                return moment(new Date(intlDateObj)).format('dddd, Do MMMM, YYYY')
            } else {
                return moment(new Date(get(sessionDetails, 'sessionDate'))).format('dddd, Do MMMM, YYYY')
            }
        }
        return ''
  }
  const getTime = () => {
    const slotTime = new Date(get(sessionDetails, 'sessionDate')).getHours()
    if (country !== 'india') {
          return getSlotLabel(intlSlot).startTime
      } else {
          return getSlotLabel(slotTime).startTime
      }
    }
    const handleOnClick = (event) => {
        if (event.target === event.currentTarget) {
            closeConfirmModal()
        }
    }
    const renderCheckMark = () => (
        <svg className='booking-confirmation-radiostreet-checkmark' viewBox='0 0 80 80' fill="none">
            <circle cx={40} cy={40} r={40} fill="url(#prefix__paint0_linear_radiostreet_checkmark)" />
            <path
            d="M55.008 28.005l-21 24-9-9"
            stroke="#fff"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            />
            <defs>
            <linearGradient
                id="prefix__paint0_linear_radiostreet_checkmark"
                x1={-8.5}
                y1={85}
                x2={89}
                y2={-13.5}
                gradientUnits="userSpaceOnUse"
            >
                <stop stopColor="#DEF167" />
                <stop offset={1} stopColor="#01AA93" />
            </linearGradient>
            </defs>
        </svg>
    )

    return (
        <div className={cx('booking-confirmation-modal-container',  visibility && 'show' )} onClick={handleOnClick}>
          <div
            className={'booking-confirmation-modal-wrapper'}
          >
            {/* <div className='booking-confirmation-close-btn'>
              <div>x</div>
            </div> */}
            {renderCheckMark()}
            <div className='booking-confirmation-congrats'>Congratulations!</div>
          <div className='booking-confirmation-spy-text'>Your session has been confirmed for {getDate()} at {getTime()}<br/></div> 
            {/* <a href="/" style={{ textDecoration: 'none', color: 'unset' }}>
              <Button 
                title='Explore Tekie'
              />
            </a> */}
          </div>
        </div>
    )
}

export default BookingConfirmationPopup
