

import React, { useEffect, useState } from 'react';
import { get } from "lodash";
import Carousel, { CarouselItem } from "../Carousel/Carousel";
import "./mobileBanner.scss"
import moment from 'moment'
import getSlotLabel from '../../../../utils/slots/slot-label';
import getIntlDateTime from '../../../../utils/time-zone-diff';

function MobileBanner({ value ,userStudentProfileId,EventBanner }) {

  const [topUpcomingData, setTopUpcomingData] = useState([]);

  const { upcomingEvents ,isLoggedIn} = value
  const arrayofUpcomingEvents = upcomingEvents.toJS() || []
  const mlm =arrayofUpcomingEvents.length<5 ? arrayofUpcomingEvents.length :5
  useEffect(() => {
    function bannerData() {
      const array = []
      for (let i = 0; i < mlm; i++) {
        const element = arrayofUpcomingEvents[i]
        array.push(element)
      }
      setTopUpcomingData(array)
    }
    if (arrayofUpcomingEvents.length) {
      bannerData()
    }
  }, [upcomingEvents])
  return <>
    <div className='mobile_banner_container'>
      <Carousel limitShow={1} forBanner={true} minus={true} >
        {topUpcomingData.map(events => {
const getEventActions = () => {
            const isRegistered = isLoggedIn && (get(events, 'registeredUsers[0].id') === userStudentProfileId)
            let dateValue = get(events, 'sTimeTableRule.startDate')
            let slotValue = 0
            for (const slot in get(events, 'eventTimeTableRule')) {
              if (slot.startsWith('slot') && get(events, 'eventTimeTableRule')[slot]) {
                slotValue = slot.split('slot')[1]
              }
            }
            let eventStartDate = new Date(dateValue).setHours(slotValue, 0, 0, 0)
            let endDateTime = new Date(get(events, 'eventTimeTableRule.endDate')).setHours(slotValue, 0, 0, 0)
            let isSessionExist = get(events, 'eventSessions', []).find(session =>
              get(session, 'sessionDate') === moment().startOf('day').toISOString()
            )
            let sessionDateTime = new Date();
            if (!isSessionExist) {
              isSessionExist = get(events, 'eventSessions[0]')
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
            const disabledJoinButton = !moment().isBetween(moment(sessionDateTime).subtract(30, 'minutes'), moment(sessionDateTime).add(1, 'hour'))
            const onGoingEvent = moment().isBetween(moment(eventStartDate), moment(endDateTime))
            return {
              isRegistered,
              isSessionExist,
              // allowing to join session till 30 mins after sessionStarts
              isPastSession: moment(new Date()).isAfter(moment(sessionDateTime).add(1, 'hour')),
              eventDate: eventStartDate.toString() !== 'Invalid Date' ? moment(new Date(eventStartDate)).format('Do MMMM YYYY') : '',
              eventTime: eventStartDate.toString() !== 'Invalid Date' ? `${getSlotLabel(new Date(eventStartDate).getHours(), { appendMinutes: true }).startTime.toUpperCase()} Onwards` : '',
              disabledJoinButton,
              isCompletedEvent,
              sessionDateTime,
              stopRegiBeforeEvent,
              eventStartDate,
              onGoingEvent
            }
          }


        return <>
          <CarouselItem >
            <EventBanner fromWebBanner={true} data={events} getEventActions={getEventActions}/>
          </CarouselItem>
        </>

        })}
      </Carousel>

    </div>
  </>
}



export default MobileBanner