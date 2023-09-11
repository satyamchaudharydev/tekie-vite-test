import { get } from 'lodash';
import React, { useState } from 'react'
import { useHistory } from 'react-router'
import { useSwipeable } from 'react-swipeable';
import EventBanner from '../EventDescBanner/EventBanner';
import isMobile from '../../../../utils/isMobile';
import './eventWebBanner.scss'
import moment from 'moment'
import getSlotLabel from '../../../../utils/slots/slot-label';
import getIntlDateTime from '../../../../utils/time-zone-diff';


const CarouselItem = ({ children, width, margin }) => {
  return (
    <div style={{ width: "100%", margin }}>
      {children}
    </div>
  );
};

const Carousel = ({ children, limitShow, forBanner, forWinner, numInvisible = 1, minus, childNums }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeButton, setActiveButton] = useState('right')

  const updateIndex = (newIndex) => {
    let varIndex = React.Children.count(children) / limitShow;
    if (newIndex < 0) {
      newIndex = varIndex - 1;
    } else if (newIndex >= varIndex) {
      newIndex = 0;
    }
    setActiveIndex(newIndex);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => updateIndex(activeIndex + 1),
    onSwipedRight: () => updateIndex(activeIndex - 1)
  });
  return (
    <div
      {...handlers}
      className='eventBanner-section-carousel-main'
    >
      <div
        className="eventBanner-section-carousel"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {React.Children.map(children, (child, index) => {
          return React.cloneElement(child, {
            width: '100%'
          });
        })}
      </div>
      <div className="eventBanner-section-indicator">
        <div className={forWinner ? "winner_carousel_navs" : forBanner ? "banner_carousel_navs" : "carousel_navs"}>
          {React.Children.map(children, (child, index) => {
            if (index < childNums || forBanner) {
              return (
                <button
                  className={`eventBanner-dot-button ${index === activeIndex && "active-event"}`}
                  onClick={() => {
                    updateIndex(index);
                  }}
                  style={{ display: `${React.Children.count(children) === 1 && 'none'}` }}
                >
                </button>
              );
            }
          })}
        </div>
        <div className='eventBanner-section-action-btns'>
          <span
            onClick={() => {
              updateIndex(activeIndex - 1);
              setActiveButton('left')
            }}
            className={`eventBanner-section-prev-btn ${activeButton === 'left' && 'leftActive'}`}
            style={{ display: `${React.Children.count(children) === 1 && 'none'}` }}
          >
            {isMobile() ? <svg className='mobileSvg' xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="16" fill="#DCDCDC"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M20.7057 8.4545C21.145 8.89384 21.145 9.60616 20.7057 10.0455L14.7511 16L20.7057 21.9545C21.145 22.3938 21.145 23.1062 20.7057 23.5455C20.2663 23.9848 19.554 23.9848 19.1147 23.5455L12.3647 16.7955C11.9253 16.3562 11.9253 15.6438 12.3647 15.2045L19.1147 8.4545C19.554 8.01517 20.2663 8.01517 20.7057 8.4545Z" fill="white"/>
              </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="#504F4F" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M38.9508 19.4242C39.6831 20.1564 39.6831 21.3436 38.9508 22.0758L29.0267 32L38.9508 41.9242C39.6831 42.6564 39.6831 43.8436 38.9508 44.5758C38.2186 45.3081 37.0314 45.3081 36.2992 44.5758L25.0492 33.3258C24.3169 32.5936 24.3169 31.4064 25.0492 30.6742L36.2992 19.4242C37.0314 18.6919 38.2186 18.6919 38.9508 19.4242Z" fill="white" />
            </svg>}
          </span>
          <span
            className={`eventBanner-section-next-btn ${activeButton === 'right' && 'rightActive'}`}
            onClick={() => {
              updateIndex(activeIndex + 1);
              setActiveButton('right')
            }}
            style={{ display: `${React.Children.count(children) === 1 && 'none'}` }}
          >
            {isMobile() ? <svg className='mobileSvg' xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 33 33" fill="none">
                <rect x="32.3477" y="32.1719" width="32" height="32" rx="16" transform="rotate(180 32.3477 32.1719)" fill="#00ADE6"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M11.642 23.7174C11.2027 23.278 11.2027 22.5657 11.642 22.1264L17.5965 16.1719L11.642 10.2174C11.2027 9.77803 11.2027 9.06572 11.642 8.62638C12.0813 8.18704 12.7937 8.18704 13.233 8.62638L19.983 15.3764C20.4223 15.8157 20.4223 16.528 19.983 16.9674L13.233 23.7174C12.7937 24.1567 12.0813 24.1567 11.642 23.7174Z" fill="white"/>
              </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle r="32" transform="matrix(-1 0 0 1 32 32)" fill="#504F4F" />
              <path fill-rule="evenodd" clip-rule="evenodd" d="M25.0492 19.4242C24.3169 20.1564 24.3169 21.3436 25.0492 22.0758L34.9733 32L25.0492 41.9242C24.3169 42.6564 24.3169 43.8436 25.0492 44.5758C25.7814 45.3081 26.9686 45.3081 27.7008 44.5758L38.9508 33.3258C39.6831 32.5936 39.6831 31.4064 38.9508 30.6742L27.7008 19.4242C26.9686 18.6919 25.7814 18.6919 25.0492 19.4242Z" fill="white" />
            </svg>}
          </span>
        </div>
      </div>
    </div>
  );
};

const EventWebBanner = ({ upcomingEvents, status, userStudentProfileId }) => {
  let arrayofUpcomingEvents = (upcomingEvents && upcomingEvents.toJS()) || []
  arrayofUpcomingEvents = arrayofUpcomingEvents.filter(event => get(event, 'eventBanner.uri'))
  const upcomingEventsArray = []
  const arrayLength = arrayofUpcomingEvents && arrayofUpcomingEvents.length > 5 ? 5 : arrayofUpcomingEvents.length
  if (arrayofUpcomingEvents.length) {
    for (let i = 0; i < arrayLength; i++) {
      const element = arrayofUpcomingEvents[i]
      upcomingEventsArray.push(element)
    }
  }
  const { eventsDetailsFetchStatus, isLoggedIn } = status
  const bannerFetchStatus = (eventsDetailsFetchStatus && get(eventsDetailsFetchStatus.toJS(), "upcoming.loading", ""))
  const history = useHistory()
  if (bannerFetchStatus) return null;
  if (!upcomingEventsArray.length) return null;
  return (
    <div>
      <Carousel  limitShow={1} forBanner={true} minus={true}>
          {upcomingEventsArray.map(event => {
          const eventId = get(event, 'id')
          let isRegistered = isLoggedIn && (get(event, 'registeredUsers[0].id') === userStudentProfileId)
          const getEventActions = () => {
            let dateValue = get(event, 'eventTimeTableRule.startDate')
            let slotValue = 0
            for (const slot in get(event, 'eventTimeTableRule')) {
              if (slot.startsWith('slot') && get(event, 'eventTimeTableRule')[slot]) {
                slotValue = slot.split('slot')[1]
              }
            }
            let eventStartDate = new Date(dateValue).setHours(slotValue, 0, 0, 0)
            let endDateTime = new Date(get(event, 'eventTimeTableRule.endDate')).setHours(slotValue, 0, 0, 0)
            let isSessionExist = get(event, 'eventSessions', []).find(session =>
              get(session, 'sessionDate') === moment().startOf('day').toISOString()
            )
            let sessionDateTime = new Date();
            if (!isSessionExist) {
              isSessionExist = get(event, 'eventSessions[0]')
            }
            if (isSessionExist) {
              sessionDateTime = new Date(get(isSessionExist, 'sessionDate'))
              let slotTime = 0
              for (const slot in isSessionExist) {
                  if (slot.startsWith('slot') && isSessionExist[slot]) {
                      slotTime = slot.split('slot')[1]
                  }
              }
              sessionDateTime = new Date(new Date(sessionDateTime).setHours(slotTime, 0, 0, 0))
            }
            if (get(event, 'timeZone')) {
              const { intlDateObj, intlSlot } = getIntlDateTime(
                  dateValue,
                  slotValue,
                  get(event, 'timeZone') || 'Asia/Kolkata'
              )
              eventStartDate = new Date(new Date(intlDateObj).setHours(intlSlot, 0, 0, 0))
              const { intlDateObj: endDateObj, intlSlot: endDateSlot } = getIntlDateTime(
                  get(event, 'eventTimeTableRule.endDate'),
                  slotValue,
                  get(event, 'timeZone') || 'Asia/Kolkata'
              )
              endDateTime = new Date(new Date(endDateObj).setHours(endDateSlot, 0, 0, 0))
            }
            eventStartDate = new Date(eventStartDate)
            endDateTime = new Date(new Date(endDateTime).setHours(new Date(endDateTime).getHours() + 1, 0, 0, 0))
            const isCompletedEvent = moment().isAfter(new Date(endDateTime))
            const stopRegiBeforeEvent = moment().isBetween(moment(eventStartDate).subtract(30, 'minutes'), new Date(eventStartDate))
            const onGoingEvent = moment().isBetween(moment(eventStartDate), moment(endDateTime))
            return {
              isSessionExist,
              // allowing to join session till 30 mins after sessionStarts
              isPastSession: moment(new Date()).isAfter(moment(sessionDateTime).add(1, 'hour')),
              eventDate: eventStartDate.toString() !== 'Invalid Date' ? moment(new Date(eventStartDate)).format('Do MMMM YYYY') : '',
              eventTime: eventStartDate.toString() !== 'Invalid Date' ? `${getSlotLabel(new Date(eventStartDate).getHours(), { appendMinutes: true }).startTime.toUpperCase()} Onwards` : '',
              isCompletedEvent,
              sessionDateTime,
              stopRegiBeforeEvent,
              eventStartDate,
              onGoingEvent
            }
          }
          const handleActionButtonClick = async () => {
              if (!isRegistered) {
                history.push(`/events/${eventId}?register=true`)
              } else if (isRegistered) {
                history.push(`/events/${eventId}`)
              }
          }
          const renderActionButton = () => {
        if (!isRegistered) {
            return (
                <div
                    className="event-registerButton"
                    onClick={handleActionButtonClick}
                >
                    <div>Register Now</div>{" "}
                      <div className="register-arrow-right">
                      <svg className='actionButtonSVG' viewBox="0 0 18 19" fill="none">
                          <path
                          d="M1.849 8.064H11.94l-4.41 4.41a.91.91 0 000 1.282.9.9 0 001.275 0l5.954-5.954a.9.9 0 000-1.274L8.815.565A.9.9 0 107.54 1.839l4.4 4.418H1.849a.906.906 0 00-.904.904c0 .497.407.903.904.903z"
                          fill="#fff"
                          />
                      </svg>
                    </div>
                </div>
            )
        }
        if (isRegistered) {
            return (
                <div
                    className={`event-registerButton`}
                    onClick={() => handleActionButtonClick()}
                >
                    <>
                    <div>Join Now</div>{" "}
                    <div className="register-arrow-right">
                        <svg className='actionButtonSVG' viewBox="0 0 18 19" fill="none">
                        <path
                            d="M1.849 8.064H11.94l-4.41 4.41a.91.91 0 000 1.282.9.9 0 001.275 0l5.954-5.954a.9.9 0 000-1.274L8.815.565A.9.9 0 107.54 1.839l4.4 4.418H1.849a.906.906 0 00-.904.904c0 .497.407.903.904.903z"
                            fill="#fff"
                        />
                        </svg>
                    </div>
                    </>
                </div>
            )
        }
    }
          return <>
          <CarouselItem>
            <EventBanner 
            fromWebBanner={true} 
            data={event}
            renderActionButton={renderActionButton}
            getEventActions={getEventActions}
            ll="false"
            />
          </CarouselItem>
          </>
})}
      </Carousel>
    </div>
  )
}

export default EventWebBanner