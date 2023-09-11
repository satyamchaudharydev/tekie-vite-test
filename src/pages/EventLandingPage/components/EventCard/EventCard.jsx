import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import '../EventLibrary/EventLibrary.styles.scss'
import testEventPic from '../../../../assets/testEventTag.png';
import calendar from '../../../../assets/calendar-outline.svg';
import clock from '../../../../assets/clock-outline.svg';
import { get } from "lodash"
import getIntlDateTime from '../../../../utils/time-zone-diff';
import moment from 'moment';
import getSlotLabel from '../../../../utils/slots/slot-label';
import getPath from "../../../../utils/getPath";
import { connect } from 'react-redux';
import { filterKey } from '../../../../utils/data-utils';
import { CompletedEventIcon, EventTime } from '../../../../constants/icons';

const EventCard = ({ events, isLoggedIn, userId, studentProfileId, selectedCategory, ...props }) => {
    const [showCategory, setShowCategory] = useState(true)
    useEffect(() => {
        let showCategoryValue = true
        if (selectedCategory && get(events, 'category.id') && showCategory) {
            if (selectedCategory === get(events, 'category.id')) {
                showCategoryValue = false
            }
        }
        setShowCategory(showCategoryValue)
    }, [get(events, 'id')])
    const getEventActions = () => {
      const { eventTimeTableRule: { startDate, endDate, ...slots }, registeredUsersMeta, name } = events;
      let blueButtonText = 'Register Now'
      if (startDate && endDate) {
        const userStudentProfileId = studentProfileId && studentProfileId.toJS() && get(studentProfileId.toJS(), 'id')
        const isRegistered = (isLoggedIn && userId && get(events, 'registeredUsers[0].id') === userStudentProfileId)
        let dateValue = startDate
        let slotValue = 0
        for (const slot in slots) {
            if (slot.startsWith('slot') && slots[slot]) {
            slotValue = slot.split('slot')[1]
            }
        }
        let eventStartDate = new Date(dateValue).setHours(slotValue, 0, 0, 0)
        let endDateTime = new Date(endDate).setHours(slotValue, 0, 0, 0)
        if (get(events, 'timeZone')) {
            const { intlDateObj, intlSlot } = getIntlDateTime(
                dateValue,
                slotValue,
                get(events, 'timeZone') || 'Asia/Kolkata'
            )
            eventStartDate = new Date(new Date(intlDateObj).setHours(intlSlot, 0, 0, 0))
            const { intlDateObj: endDateObj, intlSlot: endDateSlot } = getIntlDateTime(
                get(events, 'eventTimeTableRule.endDate'),
                slotValue,
                get(events, 'timeZone') || 'Asia/Kolkata'
            )
            endDateTime = new Date(new Date(endDateObj).setHours(endDateSlot, 0, 0, 0))
        }
        eventStartDate = new Date(eventStartDate)
        endDateTime = new Date(new Date(endDateTime).setHours(new Date(endDateTime).getHours() + 1, 0, 0, 0))
        const isCompletedEvent = moment().isAfter(new Date(endDateTime))
        const stopRegiBeforeEvent = moment().isBetween(moment(eventStartDate).subtract(30, 'minutes'), new Date(eventStartDate))
        const onGoingEvent = moment().isBetween(moment(eventStartDate), moment(endDateTime))
        if (isRegistered) blueButtonText = 'Join Now'
        if (isCompletedEvent) {
            if (get(events, 'momentFromEventLink')) blueButtonText = 'Watch Now'
            else blueButtonText = 'View Details'
        }
        return {
            isRegistered,
            eventDate: eventStartDate.toString() !== 'Invalid Date' ? moment(new Date(eventStartDate)).format('Do MMM') : '',
            eventTime: eventStartDate.toString() !== 'Invalid Date' ? `${getSlotLabel(new Date(eventStartDate).getHours(), { appendMinutes: true }).startTime} to ${getSlotLabel(new Date(eventStartDate).getHours(), { appendMinutes: true }).endTime}` : '',
            isCompletedEvent,
            stopRegiBeforeEvent,
            eventStartDate,
            onGoingEvent,
            registerCount: get(registeredUsersMeta, 'count', 0) > 15 ? `+${get(registeredUsersMeta, 'count', 0)}` : get(registeredUsersMeta, 'count', 0),
            eventName: name,
            listingImage: getPath(get(events, 'listingImage.uri')),
            blueButtonText,
            isLoggedIn: isLoggedIn && userId,
        }
      }
    }
    const getUrl = () => {
        let eventUrl = ''
        if (get(events, 'utm', []).length) {
            const { utmTerm, utmSource, utmMedium, utmContent, utmCampaign } = get(events, 'utm[0]')
            eventUrl = `/events/${get(events, 'id')}?${utmSource ? `utm_source=${utmSource}` : ''}${utmMedium ? `&utm_medium=${utmMedium}` : ''}${utmTerm ? `&utm_term=${utmTerm}` : ''}${utmCampaign ? `&utm_campaign=${utmCampaign}` : ''}${utmContent ? `&utm_content=${utmContent}` : ''}`
        } else {
            eventUrl = `/events/${get(events, 'id')}`
        }
        let eventDetailsUrl = eventUrl
        if (eventUrl.includes('?')) eventUrl = `${eventUrl}&register=true`
        else eventUrl = `${eventUrl}?register=true`
        return {
            eventDetailsUrl, eventUrl
        }
    }
    const history = useHistory()
    const onButtonClick = (e, type = 'details') => {
      const { isRegistered, isCompletedEvent, isLoggedIn } = getEventActions();
      if (isRegistered || isCompletedEvent) {
        history.push(`/events/${get(events, 'id')}`)
        return null;
      }
      if (!isLoggedIn || !isRegistered) {
        const { eventDetailsUrl, eventUrl } = getUrl()
        if (type === 'details') history.push(eventDetailsUrl)
        else {
            e.stopPropagation();
            history.push(eventUrl)
        }
      }
    }
    return(
        <div className='event-card' id='eventCard-component' onClick={(e) => onButtonClick(e)}>
            <div className='shadow-div' style={{ backgroundImage: `url(${get(getEventActions(), 'listingImage')})` }} >
                {/* <img className='event-image' src={get(getEventActions(), 'listingImage') || testEventPic} alt='Event Pic' /> */}
                {/* <div className='test-container-shaow'>
                    <CustomButton type={isLoggedIn ? 'join' : 'register'} clickEvent={() => onButtonClick('register')} content={get(getEventActions(), 'blueButtonText')} img={ForwardArrow} />
                    <CustomButton type='detail' clickEvent={() => onButtonClick('detail')} content="View Detail" img={blueArrow} />
                </div> */}
            </div>
            <div  className='test-container'>
                    {/* <div className='register-container'>
                        {get(getEventActions(), 'isRegistered') ? (
                          <div className='event-resgistered'>Registered</div>
                        ) : (
                          <div
                          className={'tag-button tag-card-button'}
                        >
                          <div
                            className={'tag-name'}
                          >
                            {getTrimmedText(get(events, 'tags[0].title'))}
                          </div>
                        </div>
                        )}
                        <div className='aman-container'>
                            <div className='event-registered-upper'>{get(getEventActions(), 'registerCount')}</div>
                            <img src={circleBackgroundPic} alt='girl-pic' className='event-registered-lower' />
                            <span className='event-participation'>Participants</span>
                        </div>
                    </div> */}
                    <div className='event-name'>{get(getEventActions(), 'eventName')}</div>
                    <div className='event-details'>
                        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            {/* <img src={calendar} alt='calendar' className='event-calendar' /> */}
                            <EventTime className='event-card-calendar' />
                            <div className='event-date'>{get(getEventActions(), 'eventDate')}</div>
                        </div>
                        {get(getEventActions(), 'isCompletedEvent') ? (
                            <div className='completed_event_tag' > <CompletedEventIcon /> Completed</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                <img src={clock} alt='calendar' className='event-clock' />
                                <div className='event-time'>{get(getEventActions(), 'eventTime')}</div>
                            </div>
                        )}
                    </div>
                    <div class="language-tag-container" style={{ visibility: showCategory ? 'visible' : 'hidden' }}>
                        <div className='event-tag-box'>{get(events, 'category.title')}</div>
                    </div>
                    <div
                        className={`event-registerButton-for-card ${get(getEventActions(), 'isCompletedEvent') && 'completed_event_btn'}`}
                        onClick={(e) => onButtonClick(e, 'register')}
                    >
                    <div>{get(getEventActions(), 'blueButtonText')}</div>{" "}
                    <div className="register-arrow-right">
                    <svg className='actionButtonSVG' viewBox="0 0 18 19" fill="none">
                        <path
                        d="M1.849 8.064H11.94l-4.41 4.41a.91.91 0 000 1.282.9.9 0 001.275 0l5.954-5.954a.9.9 0 000-1.274L8.815.565A.9.9 0 107.54 1.839l4.4 4.418H1.849a.906.906 0 00-.904.904c0 .497.407.903.904.903z"
                        fill="#fff"
                        />
                    </svg>
                    </div>
                    </div>
                </div>
        </div>
    )
}

const mapStateToProps = (state) => ({
    isLoggedIn: !!filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false) ||
        state.data.getIn(['userChildren', 'data']).size,
    userId: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').getIn([0, 'id'], false),
    hasMultipleChildren: state.data.getIn(['userChildren', 'data']).size > 1,
    studentProfileId: state.data.getIn(['studentProfile', 'data', 0]),
    eventsDetailsFetchStatus: state.data.getIn(['eventsDetails', 'fetchStatus']),
    eventsUpdateStatus: state.data.getIn(['events', 'updateStatus', 'events']),
    updateEventFailedMessage: state.data.getIn(['errors', 'events/update']),
})

export default connect(mapStateToProps)(EventCard)