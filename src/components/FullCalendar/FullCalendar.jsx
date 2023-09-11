/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import ClassCard from '../../pages/TeacherApp/pages/TimeTable/components/ClassCard/ClassCard'
import MoreSessionDetails from '../../pages/TeacherApp/pages/TimeTable/components/MoreSessionDetails/MoreSessionDetails'
import { get } from 'lodash'
import moment from 'moment'

const Calendar = ({
  fetchedEvents,
  handleEventClick = () => null,
  datesSet = () => null,
  slotTimeRange = { minTime: "08:00:00", maxTime: "23:00:00" },
  initialCalendarView = 'timeGridWeek',
  calendarHeight = '100%',
  customDateToNavigate = null,
  customEventContentRender = '',
  customButtons = {},
  layoutStyle = 'default',
  // isSessionClosestToCurrentTime=false,
  sessionDetails,
  sessionsInADay,
  customHeaderToolBar = {
    start: 'prev,next title today',
    right: layoutStyle === 'teacherApp' ? 'timeGridDay,timeGridWeek,dayGridMonth' : 'timeGridWeek,dayGridMonth,timeGridDay,listMonth'
  },
  setIsSessionDetailsModalVisible,
  setSessionDetails,
  setIsUpcomingSession,
  isUpcomingSession,
  source = 'default',
  isSessionDetailsModalOpenedRef
}) => {
  const [MoreSessions, setMoreSessions] = useState([])
  const calendarComponentRef = React.createRef()
  const closestSessionToCurrentTimeRef = useRef(null)

  const getStartTime = (session) => {
    let trueSlot
    for (let i = 0; i < 24; i++) {
      if (session[`slot${i}`]) {
        trueSlot = i;
        break
      }
    }
    return new Date(session.bookingDate).setHours(trueSlot, 0, 0)
  }

  const isSessionEarliestAmongAllUpcomingSessions = (eventId) => {
    return closestSessionToCurrentTimeRef.current === eventId;
  }

  useEffect(() => {
    
    if(!closestSessionToCurrentTimeRef.current){
      const currentTime = new Date()
      if(source==='teacherApp'){
        const sortedFetchedEvents=[...fetchedEvents].sort((a,b)=>{
          return get(a,'start').getTime()-get(b,'start').getTime()
        })
        for (let i = 0; i < sortedFetchedEvents.length; i++) {
          if (currentTime.getTime() <= sortedFetchedEvents[i].start.getTime()) {
            closestSessionToCurrentTimeRef.current = sortedFetchedEvents[i].id
            break
          }
        }
      }
    }

  }, [fetchedEvents.length])

  const isSessionClosestToCurrentTime = (eventStartTime, eventId) => {

    const currentTime = new Date()
    if (eventStartTime.getTime() >= currentTime.getTime()) {
      if (isSessionEarliestAmongAllUpcomingSessions(eventId)) {
        setIsUpcomingSession(eventId)
        return { earliest: true, isFuture: true }
      }
      return { earliest: false, isFuture: true }

    }
    return { earliest: false, isFuture: false }
  }
  /** Use this to set Custom Date in Calendar */
  React.useEffect(() => {
    if (calendarComponentRef && calendarComponentRef.current) {
      const calendarApi = calendarComponentRef.current.getApi()
      if (calendarApi && customDateToNavigate) {
        calendarApi.gotoDate(customDateToNavigate)
      }
    }
  }, [customDateToNavigate])

  const customEventRender = (arg) => {
    if (source === 'teacherApp') {
      const { extendedProps: { title, grades, sections, sessionStatus, documentType, bookingDate,classType,startMinutes,endMinutes }, start, end,id} = arg.event
    return <ClassCard key={id} id={id} isSessionClosestToCurrentTime={isSessionClosestToCurrentTime(start, arg.event.id)}
      title={title} grades={grades} sections={sections} startMinutes={startMinutes} endMinutes={endMinutes} start={start} end={end} sessionStatus={sessionStatus} documentType={documentType} classType={classType} view={get(arg, 'view.type')} />
    }
    return customEventContentRender(arg)
  }

  const showMoreSessions = (arg) => {
    setMoreSessions(arg.allSegs)
  }
 

  return (
    <>
      <FullCalendar
        ref={calendarComponentRef}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        views={{
          timeGridWeek: {
            dayHeaderFormat: { weekday: "short", day: "numeric" },
            displayEventTime: true,
            eventTimeFormat: {
              hour: "numeric",
              minute: "2-digit",
              omitZeroMinute: true,
              hour12: false,
              meridiem: false,
            },
            dayHeaderContent: ({ date }) => {
              return (
                <>
                  <div className="fullcalendar-timeGrid-header-weekday">
                    {date.toLocaleDateString("en", { weekday: "short" })}
                  </div>
                  <div className="fullcalendar-timeGrid-header-date">
                    {date.getDate()}
                  </div>
                </>
              );
            },
          },
          timeGridDay: {
            dayHeaderFormat: { weekday: "short", day: "numeric" },
            eventTimeFormat: {
              hour: "numeric",
              minute: "2-digit",
              omitZeroMinute: true,
              meridiem: false,
            },
            dayHeaderContent: ({ date }) => {
              if (layoutStyle !== "teacherApp") {
                return (
                  <div className="fullcalendar-timeGrid-header-date">
                    {date.toLocaleDateString("en", { weekday: "long" })}{" "}
                    {date.getDate()}
                  </div>
                );
              }
            },
          },
        }}
        customButtons={customButtons}
        headerToolbar={customHeaderToolBar}
        firstDay={1}
        format
        navLinks
        slotMinTime={slotTimeRange.minTime}
        slotMaxTime={slotTimeRange.maxTime}
        datesSet={datesSet}
        initialView={initialCalendarView}
        height={calendarHeight}
        nowIndicator
        stickyFooterScrollbar
        selectable={layoutStyle !== 'teacherApp'}
        dayMaxEvents={2}
        events={fetchedEvents}
        moreLinkClick={showMoreSessions}
        eventClick={handleEventClick}
        eventContent={customEventRender}
        expandRows={true}
        allDaySlot={false}
      />
      {MoreSessions.length ? <MoreSessionDetails setIsSessionDetailsModalVisible={setIsSessionDetailsModalVisible} setSessionDetails={setSessionDetails} MoreSessions={MoreSessions} setIsModalVisible={setMoreSessions} isUpcomingSession={isUpcomingSession} isSessionDetailsModalOpenedRef={isSessionDetailsModalOpenedRef} /> : <></>}
    </>
  );
}

export default Calendar
