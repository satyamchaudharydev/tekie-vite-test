import React from 'react'
import Calendar from '../../components/FullCalendar'
import "../../components/FullCalendar/fullcalendar.scss";
import { get } from 'lodash'
import { isPast } from 'date-fns'
import Select from './components/Select'
import fetchBatchSessions from '../../queries/schoolDashboard/fetchBatchSessions'
import fetchSchoolClasses from '../../queries/schoolDashboard/fetchSchoolClasses'
import ClassDetailsModal from './components/ClassDetailsModal/ClassDetailsModal'
import { getSlotTime, getSchoolId, courses, getCourseObject } from './utils'
import './SchoolDashboard.scss'
import './SchoolDashboard.common.scss'
import renderChats from '../../utils/getChatTags'
import ChatWidget from '../../components/ChatWidget'

const isMobile = typeof window === 'undefined' ? false : window.innerWidth < 700

class SchoolDashboard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeCalendarView: null,
            isFetching: false,
            isClassDetailsModalVisible: false,
            fetchedEvents: [],
            gradeFilter: 'all',
            courseFilter: 'all'
        }
    }

    componentDidMount() {
        const schoolId = getSchoolId(this.props.loggedInUser)
        fetchSchoolClasses(`{school_some:{id: "${schoolId}"}}`, 0, 0).call()
    }

    componentDidUpdate = async () => {
        const { isLoggedIn, loggedInUserArray } = this.props
        if (window && window.fcWidget) {
            window.fcWidget.on("widget:opened", () => {
                renderChats({
                    isLoggedIn,
                    studentCurrentStatus: 'paidUser',
                    loggedInUser: loggedInUserArray
                })
            })
        }
    }

    getTimeRangeFromSession = (bookingDate, session) => {
        bookingDate = new Date(bookingDate).toDateString()
        const startTime = `${bookingDate}, ${get(getSlotTime(session), 'startTime')}`
        const fetchedEndTime = get(getSlotTime(session), 'endTime')
        let endTime = `${bookingDate}, ${fetchedEndTime}`
        if (fetchedEndTime === '12:00 AM') {
            const today = new Date(bookingDate)
            today.setDate(today.getDate() + 1)
            endTime = `${today.toDateString()}, ${fetchedEndTime}`
        }
        return { startTime, endTime }
    }

    mapSessionsToEventObject = (title, startTime, endTime, backgroundColor,
    borderColor, record) => (
        {
            title,
            allDay: false,
            date: startTime,
            end: endTime,
            backgroundColor,
            borderColor,
            extendedProps: {
                record,
            }
        }
    )

    fetchSchoolSessions = async () => {
        const events = []
        const { value: gradeValue } = this.state.gradeFilter
        const { value: courseValue } = this.state.courseFilter
        const { bookingDate_gt, bookingDate_lt } = this.state
        const schoolId = getSchoolId(this.props.loggedInUser)
        let filters = `{school_some:{id: "${schoolId}"}}`
        let datesFilter = ''
        this.setState({
            isFetching: true
        })
        if (gradeValue && gradeValue !== 'all') {
            filters += `,{classes_some: { grade:${gradeValue.split('-')[0]}}}`
            filters += `,{classes_some: { section:${gradeValue.split('-')[1]}}}`
        }
        if (courseValue && courseValue !== 'all') {
            filters += `,{course_some:{title_contains:"${courseValue}"}}`
        }
        if (bookingDate_gt) {
            datesFilter += `{bookingDate_gte: "${new Date(new Date(bookingDate_gt).setHours(0, 0, 0, 0)).toISOString()}"},`
        }
        if (bookingDate_lt) {
            datesFilter += `{bookingDate_lte: "${new Date(new Date(bookingDate_lt).setHours(0, 0, 0, 0)).toISOString()}"},`
        }
        await fetchBatchSessions(`${datesFilter}{batch_some:{and:[${filters}]}}`).call()
        const sessions = this.props.schoolSessions && this.props.schoolSessions.toJS()
        const adhocSessions = this.props.adhocSessions && this.props.adhocSessions.toJS()
        const combinedSessions = sessions.concat(adhocSessions)
        combinedSessions.forEach(session => {
            const colorMapping = get(getCourseObject(get(session, 'batch.course.id')), 'course.color')
            const { startTime, endTime } = this.getTimeRangeFromSession(session.bookingDate, session)
            events.push(this.mapSessionsToEventObject(
                get(session, 'batch.course.title'),
                new Date(startTime),
                new Date(endTime),
                colorMapping.secondary,
                colorMapping.primary,
                session
            ))
        });
        this.setState({
            fetchedEvents: events,
            isFetching: false,
        })
    }

    setSessionGradeFilters = (value) => {
        this.setState({
            gradeFilter: value
        }, async () => {
            await this.fetchSchoolSessions()
        })
    }

    getSchoolGradeAndSection = (classDetails) => {
        if (get(classDetails, 'batch')
            && get(classDetails, 'batch.classes')
            && get(classDetails, 'batch.classes').length > 0) {
            return `${get(classDetails.batch.classes[0], 'grade').replace('Grade','')}${get(classDetails.batch.classes[0], 'section')}`
        }
        return '-'
    }

    customEventContentRender = (args) => {
        const isTimeGridWeekView = args.view.type !== 'dayGridMonth'
        const isListMonthView = args.view.type === 'listMonth'
        const TimeGridDayViewStyles = args.view.type === 'timeGridDay' ? {
            display: 'flex',
            flexDirection: 'column-reverse',
            justifyContent: 'flex-end'
        } : {}
        const isListViewOrDayView = isListMonthView || args.view.type === 'timeGridDay'
        const topic = get(args.event.extendedProps.record, 'previousTopic')
            ? get(args.event.extendedProps.record, 'previousTopic.title', '')
            : get(args.event.extendedProps.record, 'topic.title', '')
        return (
            <div className='event-container'
                style={{
                    background: args.backgroundColor,
                    justifyContent: `${isListViewOrDayView ? 'flex-start' : 'space-between'}`,
                    opacity: `${args.isPast ? .5 : 1 }`
                }}
                title={args.event.title + ` • ` + topic}
            >
                <div className='event-details'
                    style={{
                        alignItems: `${!isTimeGridWeekView ? 'center' : 'flex-start'}`,
                        flexDirection: `${!isTimeGridWeekView ? 'row-reverse' : ''}`,
                        display: `${isTimeGridWeekView ? 'block' : 'display-inline'}`,
                        ...TimeGridDayViewStyles
                    }}
                >
                <div className='event-title'>
                    {args.event.title} {isTimeGridWeekView && (<>&bull; {topic}</>)}
                </div>
                {!isListMonthView && (
                    <div className='event-date-indicator'>
                    {new Date(args.event.start).toLocaleTimeString('en', {
                        hour: '2-digit',
                    }).replace(' ', '')}
                    {isTimeGridWeekView && (` - ` +
                        new Date(args.event.end).toLocaleTimeString('en', {
                        hour: '2-digit',
                        }).replace(' ', ''))}
                    </div>
                )}
                </div>
                <div className='event-noOfStudent-indicator'
                style={{
                    fontWeight: '600',
                    backgroundColor: args.borderColor,
                    alignSelf: `${isListViewOrDayView ? 'center' : ''}`,
                    margin: `${isListViewOrDayView ? '0px 6px' : ''}`
                }}
                >
                {`G${this.getSchoolGradeAndSection(args.event.extendedProps.record)}`}
                </div>
            </div>
        )
    }

    handleEventClick = (args) => {
        this.setState({
            isClassDetailsModalVisible: true,
            classDetails: {
                ...get(args.event, 'extendedProps.record', null),
                startTime: get(args.event, 'start'),
                endTime: get(args.event, 'end'),
                isPast: isPast(get(args.event, 'start'))
            }
        })
    }

    render() {
        const session = get(this.props, 'schoolSessions', null) && this.props.schoolSessions.toJS()[0]
        const schoolClasses = this.props.schoolClasses && this.props.schoolClasses.toJS()
        return (
            
            <div id='school-dashboard-calender-container'>
                {this.state.isFetching ? (
                <>
                    <div className='loading-container show'>
                        <div className='loading-bar-container'>
                            <div />
                        </div>
                    </div>
                </>
                ) : (null)}
                <div className='school-dashboard-heading-text school-dashboard-marginLeft-mobileOnly'>Calendar</div>
                <ChatWidget />
                <Calendar
                    source='default'
                    customButtons={{
                        Courses: {
                            text: (
                                <Select
                                    options={
                                            [{value: 'all', label: 'All'}].concat(courses.map(course => ({
                                            value: course,
                                            label: course
                                        })) || [])
                                    }
                                    placeholder='Courses'
                                    value={this.state.courseFilter}
                                    className={'school-dashboard-dropdown'}
                                    onChange={(course) => {
                                        this.setState({
                                            courseFilter: course
                                        }, async () => {
                                            await this.fetchSchoolSessions()
                                        })
                                    }}
                                    isSearchable={false}
                                />
                            )
                        },
                        Grades: {
                            text: (
                                <Select
                                    options={
                                            [{value: 'all', label: 'All'}].concat(schoolClasses.map(classObj => ({
                                            value: `${classObj.grade}-${classObj.section}`,
                                            label: `${classObj.grade}-${classObj.section}`
                                        })) || [])
                                    }
                                    placeholder='Grades'
                                    value={this.state.gradeFilter}
                                    className={'school-dashboard-dropdown'}
                                    onChange={(grade) => {
                                        this.setSessionGradeFilters(grade)
                                    }}
                                    isSearchable={false}
                                />
                            )
                        }
                    }}
                    customHeaderToolBar={{
                        start: isMobile ? 'prev title today next' : 'prev next title timeGridWeek,dayGridMonth,timeGridDay,listMonth',
                        right: isMobile ? 'timeGridWeek,dayGridMonth,timeGridDay,listMonth' : 'Courses Grades'
                    }}
                    datesSet={(args) => {
                        const { bookingDate_gt, bookingDate_lt } = this.state
                        if (bookingDate_gt !== args.startStr || bookingDate_lt !== args.endStr) {
                            this.setState({
                                activeCalendarView: get(args, 'view.type', 'timeGridWeek'),
                                bookingDate_gt: args.startStr,
                                bookingDate_lt: args.endStr,
                            }, () => {
                                this.fetchSchoolSessions()
                            })
                        }
                    }}
                    handleEventClick={this.handleEventClick}
                    customEventContentRender={this.customEventContentRender}
                    fetchedEvents={this.state.fetchedEvents || []}
                />
                <ClassDetailsModal
                    isModalVisible={this.state.isClassDetailsModalVisible}
                    classDetails={this.state.classDetails}
                    closeClassDetailsModal={(value) => {
                        this.setState({
                            isClassDetailsModalVisible: value,
                        })
                    }}
                />
            </div>
        )
    }
}

export default SchoolDashboard