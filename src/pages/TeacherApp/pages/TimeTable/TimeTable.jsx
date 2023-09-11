import { get, sortBy } from 'lodash'
import React, { useState, useEffect, useRef } from 'react'
import Calendar from '../../../../components/FullCalendar'
import '../../../../components/FullCalendar/fullcalendarTeacherApp.scss'
import getClassroomSessions from '../../../../queries/teacherApp/getClassroomSessions'
import mapQueryResponseToFullCalendarEvents from '../../../../utils/teacherApp/mapQueryResponseToFullCalendarEvents'
import Button from '../../components/Button/Button'
import { GRADES, SECTIONS, SESSION_STATUS, COURSE } from '../../constants/timeTable/filterBy'
import AppliedFiltersList from './components/AppliedFiltersList/AppliedFiltersList'
import FilterModal from './components/FilterModal/FilterModal'
import SessionModal from './components/SessionModal/SessionModal'
import CreateSessionModal from './components/CreateSessionModal/CreateSessionModal'
import LoadingSpinner from '../../components/Loader/LoadingSpinner'
import './timeTable.scss'
import { AddIcon, Exclamation, FilterIcon, Monitor, SearchIcon } from '../../../../constants/icons'
import ReScheduleSessionModal from '../TimeTable/components/ReScheduleSessionModal/ReScheduleSessionModal'
import Input from '../../components/Input/Input'
import { getToasterBasedOnType, Toaster } from '../../../../components/Toaster'
import getThemeColor from '../../../../utils/teacherApp/getThemeColor'
import ClassroomFilter from './components/ClassroomFilter/ClassroomFilter'
import getCalendarTimeGridRange from '../../../../queries/teacherApp/getCalendarTimeGridRange'
import qs from "query-string"
import { Redirect, useHistory, useLocation } from 'react-router'
import endBatchSession from '../../../../queries/teacherApp/endBatchSession'
import requestToGraphql from '../../../../utils/requestToGraphql'
import gql from 'graphql-tag'
import { getTimeRangeFromSession } from '../../../../utils/teacherApp/mapQueryResponseToFullCalendarEvents'
import { HomeworkSvg } from '../../components/svg'
import { isSomeSessionInProgress } from './utils'


const CALENDAR_LAYOUTS = {
    teacherApp: 'teacherApp',
    studentApp: 'studentApp',
}

const FORCE_ADMIN_PRIV_COUNT = 5;

const filterOptions = [GRADES, SECTIONS, SESSION_STATUS, COURSE]
const filterByCollection = {
    [GRADES]: [{ id: '1', label: 'Select all', isChecked: false }, { id: '2', label: 'Grade 1', isChecked: false }, { id: '3', label: 'Grade 2', isChecked: false }, { id: '4', label: 'Grade 3', isChecked: false }, { id: '5', label: 'Grade 4', isChecked: false }, { id: '6', label: 'Grade 5', isChecked: false }, { id: '7', label: 'Grade 6', isChecked: false }, { id: '8', label: 'Grade 7', isChecked: false }, { id: '9', label: 'Grade 8', isChecked: false }, { id: '10', label: 'Grade 9', isChecked: false }, { id: '11', label: 'Grade 10', isChecked: false }, { id: '12', label: 'Grade 11', isChecked: false }, { id: '13', label: 'Grade 12', isChecked: false }],
    [SECTIONS]: [{ id: '111', label: 'Select all', isChecked: false }, { id: '21', label: 'A', isChecked: false }, { id: '322', label: 'B', isChecked: false }, { id: '432', label: 'C', isChecked: false }, { id: '53', label: 'D', isChecked: false }, { id: '446', label: 'E', isChecked: false }, { id: '743', label: 'F', isChecked: false }],
    [SESSION_STATUS]: [{ id: '1656', label: 'Select all', isChecked: false }, { id: '356', label: 'Yet to start', isChecked: false, tagColor: '#504F4F' }, { id: '255', label: 'Unattended', isChecked: false, tagColor: "#FF5744" }, { id: '43544', label: 'In progress', isChecked: false, tagColor: "#FAAD14" }, { id: '65685', label: 'Completed', isChecked: false, tagColor: '#01AA93' }],
    // [COURSE]: [{ label: 'Select all', isChecked: false }, { label: 'Computer', isChecked: false }, { label: 'Programming', isChecked: false }],
    [COURSE]: [],
}

const legend=[{label:'Next Class',value:'nextClass'},{label:'Upcoming',value:'upcoming'},{label:'Completed',value:'completed'},{label:'Unattended',value:'unattended'}]
const iconsLegend=[{label:'- Theory Class',value:<HomeworkSvg color='#403F3F'/>},{label:'- Lab Class',value:<Monitor color='#403F3F'/>},{label:'- Incomplete Class',value:<Exclamation width='1.2em' height='1.2em' color='#403F3F' fill='none'/>}]

const Legend=()=>{
    return <div className='legendContainer'>
       {
           legend.map(item=><div className={'legend'}><div className={item.value}></div><p>{item.label}</p></div>)
       }
    </div>
}

const IconsLegend=()=>{
    return <div className='legendContainer'>
    {
        iconsLegend.map(item=><div className={'legend'}><div className='legendIcon '>
            {item.value}
            </div><p>{item.label}</p></div>)
    }
 </div>
}

const TimeTable = (props) => {
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false)
    const [filterOptionsCollection, setFilterOptionsCollection] = useState(filterByCollection)
    const [isSessionDetailsModalVisible, setIsSessionDetailsModalVisible] = useState(false)
    const [isCreateSessionModalVisible, setIsCreateSessionModalVisible] = useState(false)
    const [isDeleteSessionModalVisible, setIsDeleteSessionModalVisible] = useState(false)
    const [isRescheduleModalVisible, setIsRescheduleModalVisible] = useState(false)
    const [isEndSessionModalVisible, setIsEndSessionModalVisible] = useState(false)
    const [classEvents, setClassEvents] = useState({
        allEvents: [],
        filteredEvents: []
    })
    const [sessionDetails, setSessionDetails] = useState(null)
    const [searchInput, setSearchInput] = useState('')
    const [sessionsInADay, setSessionsInADay] = useState([])
    const [isUpcomingSession, setIsUpcomingSession] = useState(null)
    const [calendarTimeRange, setCalendarTimeRange] = useState({ minTime: "07:00:00", maxTime: "23:00:00" })
    const [filterClassroomSessionQuery, setFilterClassroomSessionQuery] = useState({
        startDate: ``,
        endDate: ``,
        grades: [],
        sections: [],
        courses: [],
        sessionStatus: []
    })
    const [classroomFilter, setClassroomFilter] = useState(null)
    const [forceAllowCount, setForceAllowCount] = useState(0)
    const [isFromSessionEmbed, setIsFromSessionEmbed] = useState(false)
    const [hasFetchedStartedSessions, setHasFetchedStartedSessions] = useState(false)
    const location = useLocation()
    const firstMount = useRef(true)
    const isSessionDetailsModalOpenedRef = useRef(false)
    const history = useHistory()
    const CURRENT_DATE=new Date(new Date().setHours(0, 0, 0, 0)).toISOString()

    const { endCurrentSession, sessionId, documentType, batchId } = qs.parse(location.search)

    const isUpdateBatchSessionStatusLoading = props.updateBatchSessionQueryStatus && get(props.updateBatchSessionQueryStatus.toJS(), 'loading')
    const isUpdateBatchSessionStatusSuccess = props.updateBatchSessionQueryStatus && get(props.updateBatchSessionQueryStatus.toJS(), 'success')
    const isUpdateBatchSessionStatusFailure = props.updateBatchSessionQueryStatus && get(props.updateBatchSessionQueryStatus.toJS(), 'failure')
    const isUpdateAdhocSessionStatusLoading = props.updateAdhocSessionQueryStatus && get(props.updateAdhocSessionQueryStatus.toJS(), 'loading')
    const isUpdateAdhocSessionStatusSuccess = props.updateAdhocSessionQueryStatus && get(props.updateAdhocSessionQueryStatus.toJS(), 'success')
    const isUpdateAdhocSessionStatusFailure = props.updateAdhocSessionQueryStatus && get(props.updateAdhocSessionQueryStatus.toJS(), 'failure')
    const hasFetchedClassroomSessions = props.hasFetchedClassroomSessions
  
    const handleEventClick = (arg) => {
        if (get(arg, 'event') && (get(arg, 'event.extendedProps.documentType') !== 'event')) {
            setSessionDetails(arg.event)
            setIsSessionDetailsModalVisible(true)
            isSessionDetailsModalOpenedRef.current=true
        }
    }
    const filterEventsHandler = ({ allEvents }) => {
        return allEvents.filter(singleEvent => {
            if (!['batchSession', 'adhocSession'].includes(get(singleEvent, 'extendedProps.documentType'))) return singleEvent
            if (singleEvent.title.toLowerCase().includes(searchInput.toLowerCase())) return singleEvent
            return false
        })
    }
    const filterHandler = () => {
        if (!searchInput || !searchInput.trim().length) {
            setClassEvents({ ...classEvents, filteredEvents: classEvents.allEvents })
            return
        }

        setClassEvents(prevClassEvents => ({
            ...prevClassEvents,
            filteredEvents: filterEventsHandler(prevClassEvents)
        }))
    }
    const getCalendarHeaderLayout = () => {
        if (props.loggedInUser.toJS().secondaryRole === 'schoolTeacher') {
            //DO NOT REMOVE ANY SPACES BELOW
            return { start: 'classroomFilter', center: 'prev title next', right: 'timeGridDay,timeGridWeek,dayGridMonth' }
            // return { start: 'classroomFilter', center: 'prev title next      timeGridDay,timeGridWeek,dayGridMonth', right: 'legend' }
        }
        return { start: 'prev,next title today', center: 'filterBtn timeGridDay,timeGridWeek,dayGridMonth searchBox', right: 'filterLabels' }
    }
    // useEffect(() => {
    //     filterHandler()
    // }, [searchInput])

    const callBackToDatesSet = async (arg) => {
        setFilterClassroomSessionQuery(prev => ({ ...prev, startDate: arg.startStr, endDate: arg.endStr }))
    }

    function closestSessionToCurrentTimerChecker() {
        const diffBetweenSessionTimeAndCurrentTimeIs = (seconds = 0, session) => {
            let trueSlot
            for (let i = 0; i < 24; i++) {
                if (session[`slot${i}`]) {
                    trueSlot = i;
                    break
                }

            }
            const currentTime = new Date()
          const {startTime}= getTimeRangeFromSession(session.bookingDate,session)
          const difference = startTime.getTime()-currentTime.getTime()

            if (Math.floor(difference / 1000) >= 0 && Math.floor(difference / 1000) <= seconds) return true
            return false
        }

        const found = sessionsInADay.find(session => diffBetweenSessionTimeAndCurrentTimeIs(600, session) && session.sessionStatus==='allotted')

        const extractGradeAndSection = (str = '', extract = 'grade') => {
            const strCopy = str
            if(strCopy.includes('-')){
                const [grade, section] = strCopy.split("-")
                if (extract === 'grade') return [grade.replaceAll(' ', '')]
                if (section) return [section[0]]
            }else{
                const [grade, section] = strCopy.split(" ")
                if (extract === 'grade') return [`Grade${section.slice(0,section.length-1)}`]
                if (section) return [section[section.length-1]]
            }
        }
        //How to get thumbnail??
        if (found) {
            const {startTime,endTime}=getTimeRangeFromSession(found.bookingDate,found)
            
            if (found.id === localStorage.getItem('sessionId')){
                setTimeout(closestSessionToCurrentTimerChecker, 60000)
                return
            }
            if(!isSessionDetailsModalOpenedRef.current){
            //so if user is viewing some sessionDetailsModal, then we prevent opening of the reminder sessionDetailsModal
            localStorage.setItem('sessionId', found.id)
            setSessionDetails({ id: get(found, 'id'), start: startTime, end: endTime, extendedProps: { title: get(found, 'topicData.title') || get(found, 'previousTopic.title'), order: get(found, 'documentType') === 'batchSession' ? get(found, 'topicData.order') : get(found, 'previousTopic.order'), grades: extractGradeAndSection(found.classroom.classroomTitle, 'grade'), sections: extractGradeAndSection(found.classroom.classroomTitle, 'section'),course: get(found, 'courseData'),topicComponentRule: get(found, 'topicData.topicComponentRule'), bookingDate: found.bookingDate, sessionMode: found.sessionMode, sessionStatus: found.sessionStatus, sessionRecordingLink: found.sessionRecordingLink, documentType: found.documentType, classroom: found.classroom, totalStudents: get(found, 'attendance.length'), attendance: found.attendance, previousTopic: found.previousTopic, sessionType: found.sessionType, sessionOtp: get(found, 'sessionOtp[0].otp') } })
            setIsSessionDetailsModalVisible(true)
            }
        }
    setTimeout(closestSessionToCurrentTimerChecker,60000); //60000ms because check every 1 minutes
    }

    const calculateCalendarTimeRange = (slotRangeObject={}) => {
        
        let minTime, maxTime
        for (const key in slotRangeObject) {
            if (key.includes('slot')) {
                if (slotRangeObject[key]) {
                    if (minTime === undefined) {
                        minTime = key
                    }
                    if(minTime){
                        maxTime=key
                    }
                }
            }
        }
        if(minTime && maxTime){
            return { minTime: `${minTime.substring(4)}:00:00`, maxTime: `${maxTime.substring(4)}:00:00` } // for removing the word 'slot'
        }
    }

    const getPrevTopicDetails=(allSessions=[],openedSessionModalDetails)=>{
        const orderOfOpenedTopic= get(openedSessionModalDetails,'extendedProps.topic.order')

        const labSessionsOfSameBatch = (allSessions || []).length>0 && allSessions.filter(session=>get(session,'topicData.classType')!=='theory' && get(openedSessionModalDetails,'extendedProps.classroom.id')===get(session,'classroom.id'))
        
        const openedLabSessionIndex=sortBy(labSessionsOfSameBatch,'topicData.order').findIndex(session=>get(session,'topicData.order')===orderOfOpenedTopic)

        const prevOrderLabSession=labSessionsOfSameBatch[openedLabSessionIndex-1]

        return {courseId:get(prevOrderLabSession,'courseData.id',''),topicId:get(prevOrderLabSession,'topicData.id',''),topicComponentRule:get(prevOrderLabSession,'topicData.topicComponentRule',[])}
    }

    // const checkIfTimeTableEnabled = () => {
    //     const { loggedInUser } = props
    //     let loggedInUserData = (loggedInUser && loggedInUser.toJS()) || {}
    //      return get(loggedInUserData, 'mentorProfile.schools[0].isTimeTableEnabled', false)
    //          || get(loggedInUserData, 'rawData.mentorProfile.schools[0].isTimeTableEnabled')
    // }
    // const isTimeTableEnabled = checkIfTimeTableEnabled()
    // if (!isTimeTableEnabled) {
    //     return  <Redirect to='/teacher/classrooms' />
    // }
    useEffect(() => {
        (async function () {
            try {
                if (filterClassroomSessionQuery.startDate && filterClassroomSessionQuery.endDate) {
                    const allSessions = await getClassroomSessions(filterClassroomSessionQuery, props.loggedInUser.toJS())
                   const sessionsOnCurrentDate = get(allSessions,'classroomSessions',[]).filter(session=>get(session,'bookingDate')===CURRENT_DATE)
                    setSessionsInADay(sessionsOnCurrentDate|| [])

                    if(props.schoolTiming && props.schoolTiming.toJS() && !props.schoolTiming.toJS().length){
                        const res = await getCalendarTimeGridRange(filterClassroomSessionQuery, props.loggedInUser.toJS())
                        const timeValues = calculateCalendarTimeRange(get(res, 'timetableSchedules[0]'))
                        if(timeValues){
                            setCalendarTimeRange({ minTime:get(timeValues,'minTime'), maxTime:get(timeValues,'maxTime') })
                        }
                    }
                    
                }
            } catch (err) {
                console.log(err)
            }
        })()
    }, [filterClassroomSessionQuery])


    useEffect(() => {
        if (classroomFilter) {
            const filteredFetchedClassroomSessions = props.fetchedClassroomSessions.toJS().filter(singleClassroom => get(singleClassroom, 'classroom.id') === classroomFilter)
            const modifiedArr = mapQueryResponseToFullCalendarEvents(filteredFetchedClassroomSessions)
            setClassEvents({ allEvents: modifiedArr, filteredEvents: modifiedArr })
        } else {
            const modifiedArr = mapQueryResponseToFullCalendarEvents(props.fetchedClassroomSessions.toJS())
            setClassEvents({ allEvents: modifiedArr, filteredEvents: modifiedArr })
        }

    }, [filterClassroomSessionQuery, props.fetchedClassroomSessions.toJS().length,!props.isFetchingClassroomSessions])

    useEffect(() => {
        if (props.loggedInUser.toJS().secondaryRole === 'schoolTeacher') {
            let fcToolbarChunk = document.getElementsByClassName('fc-toolbar-chunk')
            fcToolbarChunk[0].setAttribute('style', 'width:auto !important')
            fcToolbarChunk[1].setAttribute('style', 'width:auto !important')
            fcToolbarChunk[2].setAttribute('style', 'width:auto !important')
        }
    }, [])

    useEffect(() => {
        if (classroomFilter) {
            const filteredFetchedClassroomSessions = props.fetchedClassroomSessions.toJS().filter(singleClassroom => get(singleClassroom, 'classroom.id') === classroomFilter)
            const modifiedArr = mapQueryResponseToFullCalendarEvents(filteredFetchedClassroomSessions)
            setClassEvents({ allEvents: modifiedArr, filteredEvents: modifiedArr })
        } else {
            const modifiedArr = mapQueryResponseToFullCalendarEvents(props.fetchedClassroomSessions.toJS())
            setClassEvents({ allEvents: modifiedArr, filteredEvents: modifiedArr })
        }

    }, [classroomFilter])

    useEffect(() => {
        setTimeout(closestSessionToCurrentTimerChecker, 0);
    }, [sessionsInADay.length])


    const isFilterApplied = () => {
        for (const key in filterOptionsCollection) {
            let filterAppliedFlag
            filterOptionsCollection[key].forEach(option => {
                if (option.isChecked === true) filterAppliedFlag = true
            })
            if (filterAppliedFlag) return true
        }
        return false
    }

    useEffect(() => {
        if (firstMount.current) return

        if (isUpdateAdhocSessionStatusSuccess && isFromSessionEmbed) {
            getToasterBasedOnType({
                className: 'teacher-app-theme',
                type: "success",
                message: "Session ended successfully!"
            });
            setClassEvents((prevState) => ({
                ...prevState, allEvents: prevState.allEvents.map(classroom => classroom.id !== batchId ? classroom : { ...classroom, sessionStatus: 'completed' }), filteredEvents: prevState.filteredEvents.map(classroom => classroom.id !== batchId ? classroom : { ...classroom, sessionStatus: 'completed' })
            }))

            setIsEndSessionModalVisible(false)
        }
    }, [isUpdateAdhocSessionStatusLoading])
    useEffect(() => {
        if (firstMount.current) return
        if (isUpdateBatchSessionStatusSuccess && isFromSessionEmbed) {
            getToasterBasedOnType({
                className: 'teacher-app-theme',
                type: "success",
                message: "Session ended successfully!"
            });
            setClassEvents((prevState) => ({
                ...prevState, allEvents: prevState.allEvents.map(classroom => classroom.id !== batchId ? classroom : { ...classroom, sessionStatus: 'completed' }), filteredEvents: prevState.filteredEvents.map(classroom => classroom.id !== batchId ? classroom : { ...classroom, sessionStatus: 'completed' })
            }))
            const someSessionIsInProgress = isSomeSessionInProgress(get(classEvents,'allEvents',[]))
            if(!someSessionIsInProgress){
                localStorage.removeItem('someSessionIsInProgress')
            }
            setIsEndSessionModalVisible(false)
        }
        if (isUpdateBatchSessionStatusFailure) {
            getToasterBasedOnType({
                className: 'teacher-app-theme',
                type: "success",
                message: "Error ending session!"
            });
        }
    }, [isUpdateBatchSessionStatusLoading])

    useEffect(() => {
        const transformBatchSessionResponseLikeSessionDetails = (batchSessionObj) => {
            const { id, topic, course, schoolSessionOtp, batch, sessionStatus,
                sessionRecordingLink,
                sessionMode,
                bookingDate,
                startMinutes,
                endMinutes,
                attendance,
                sessionStartDate,
                sessionEndDate } = batchSessionObj
                 
            return {
                id: id,
                start: new Date(getTimeRangeFromSession(bookingDate, batchSessionObj, 'batchSession').startTime),
                end: new Date(getTimeRangeFromSession(bookingDate, batchSessionObj, 'batchSession').endTime),
                extendedProps: {
                    title: get(topic, 'title'),
                    topic: topic,
                    course: course,
                    order: get(topic, 'order'),
                    grades: [`${get(batch, 'classes[0].grade')}`],
                    sections: [`${get(batch, 'classes[0].section')}`],
                    sessionStatus: sessionStatus,
                    sessionRecordingLink: sessionRecordingLink,
                    sessionMode: sessionMode,
                    bookingDate: bookingDate,
                    thumbnail: get(topic, 'thumbnailSmall.uri'),
                    documentType: 'batchSession',
                    classroom: batch,
                    sessionStartTime: sessionStartDate,
                    sessionEndTime: sessionEndDate,
                    startMinutes: startMinutes,
                    endMinutes: endMinutes,
                    totalStudents: (get(batch, 'students', []) || []).length,
                    attendance: attendance,
                    sessionType: get(topic, 'classType'),
                    // sessionOtp: schoolSessionOtp && get(schoolSessionOtp[0], 'otp'),
                    sessionOtp:null,
                    classType: get(topic, 'classType'),
                    topicComponentRule: get(topic, 'topicComponentRule')
                }
            }
        }
        (async function () {
            if (endCurrentSession && hasFetchedClassroomSessions) {
                const res = await requestToGraphql(
                    gql`
                        query {
                            batchSession(id:"${sessionId}"){
                                id
                              topic{
                                  id
                                title
                                order
                                thumbnailSmall{
                                  uri
                                }
                                description
                                classType
                                topicComponentRule{
                                    order
                                    componentName
                                  }
                              }
                              course{
                               id
                                title
                                defaultLoComponentRule{
                                  order
                                  componentName
                                }
                              }
                              schoolSessionsOtp{
                                otp
                              }
                              batch{
                                classes{
                                  grade
                                  section
                                }
                                students{
                                  id
                                }
                                id
                              }
                              sessionStatus
                              sessionRecordingLink
                              sessionMode
                              bookingDate
                              startMinutes
                              endMinutes
                              sessionStartDate
                              sessionEndDate
                              attendance{
                                isPresent
                                student{
                                  id
                                  name
                                }
                              }
                                slot0
                                slot1
                                slot2
                                slot3
                                slot4
                                slot5
                                slot6
                                slot7
                                slot8
                                slot9
                                slot10
                                slot11
                                slot12
                                slot13
                                slot14
                                slot15
                                slot16
                                slot17
                                slot18
                                slot19
                                slot20
                                slot21
                                slot22
                                slot23
                            }
                          }
                    `
                )
                await endBatchSession(sessionId)
                const sessionObj = transformBatchSessionResponseLikeSessionDetails(get(res, 'data.batchSession'))
                //finding order as below coz api giving Incorrect order in response
                const session = props.fetchedClassroomSessions.toJS().find(session=>get(session,'id')===get(res, 'data.batchSession.id'))
 
                setIsFromSessionEmbed('true')
                setSessionDetails({...sessionObj,extendedProps:{...sessionObj.extendedProps,order:get(session,'topicData.order')}})
                setClassEvents((prevState) => ({
                    ...prevState, allEvents: prevState.allEvents.map(session => session.id !== sessionId ? session : { ...session, sessionStatus: 'completed' }), filteredEvents: prevState.filteredEvents.map(session => session.id !== sessionId ? session : { ...session, sessionStatus: 'completed' })
                }))
                setIsSessionDetailsModalVisible(true)
                isSessionDetailsModalOpenedRef.current=true
                localStorage.removeItem('someSessionIsInProgress')
                history.replace()
            }
        })()
    }, [endCurrentSession,hasFetchedClassroomSessions])

    useEffect(()=>{
        if(props.hasCreatedSession){
            (async function () {
                try {
                    if (filterClassroomSessionQuery.startDate && filterClassroomSessionQuery.endDate) {
                        await getClassroomSessions(filterClassroomSessionQuery, props.loggedInUser.toJS())
                    }
                } catch (err) {
                    console.log(err)
                }
            })()
        }
    },[props.hasCreatedSession])

    useEffect(()=>{
        const loggedInUserData=props.loggedInUser && props.loggedInUser.toJS();
            (async function(){
               try{
                const res =await requestToGraphql(`{
                    batchSessions(filter:{
                      and:[
                        {
                          batch_some:{
                            allottedMentor_some:{
                              id:"${get(loggedInUserData,'id')}"
                            }
                          }
                        }
                        {
                          sessionStatus:started
                        }
                        {
                            sessionStartedByMentorAt_exists:true
                        }
                      ]
                    }
                    orderBy:createdAt_DESC
                    first:1
                    ){
                      id
                      sessionStatus
                        topic {
                        id
                        title
                      }
                    }
                  }`)
                setHasFetchedStartedSessions(true)
                  if(get(res,'data.batchSessions',[]).length){
                    localStorage.setItem('someSessionIsInProgress',true)
                  }else{
                    localStorage.removeItem('someSessionIsInProgress')
                  }
               }catch(err){
                console.log(err)
                setHasFetchedStartedSessions(false)
               }
            })()
    },[])
    //KEEP BELOW USEFFECT AT THE BOTTOM
    useEffect(() => {
        firstMount.current = false
        return () => firstMount.current = true
    }, [])

    const updateSessionLocally = (updateType, sessionId, updatedData) => {
        const findSessionIndexInFilteredEvent = classEvents.filteredEvents.findIndex(session => get(session, 'id') === sessionId)
        if (findSessionIndexInFilteredEvent !== -1) {
            const findSessionDetail = classEvents.filteredEvents[findSessionIndexInFilteredEvent]
            const newSessionDetail = {
                ...findSessionDetail,
                extendedProps: {
                    ...findSessionDetail.extendedProps,
                    ...updatedData
                },
            }
            const newFilteredEvents = classEvents.filteredEvents.filter(session => get(session, 'id') !== sessionId)
            setClassEvents({ ...classEvents, filteredEvents: [...newFilteredEvents, newSessionDetail] })
        }
    }

    // const checkIfTimeTableEnabled = () => {
    //     const { loggedInUser } = props
    //     let loggedInUserData = (loggedInUser && loggedInUser.toJS()) || {}
    //     return get(loggedInUserData, 'mentorProfile.schools[0].isTimeTableEnabled', false)
    // }
    // const isTimeTableEnabled = checkIfTimeTableEnabled()
    // if (!isTimeTableEnabled) {
    //     return  <Redirect to='/teacher/classrooms' />
    // }

    return <div id='teacherApp-dashboard-calender-container' className='timeTable-calendar-container'>
        {isCreateSessionModalVisible && <CreateSessionModal loggedInUser={props.loggedInUser.toJS()}
            isCreatingSession={props.isCreatingSession} hasCreatedSession={props.hasCreatedSession} filterClassroomSessionQuery={filterClassroomSessionQuery} hasCreateSessionFailed={props.hasCreateSessionFailed} fetchedCourses={props.fetchedCourses} fetchedClassrooms={props.fetchedClassrooms.toJS()} fetchedCourseTopics={props.fetchedCourseTopics.toJS()} fetchedClassroomSessions={props.fetchedClassroomSessions} setFilterOptionsCollection={setFilterOptionsCollection} setIsCreateSessionModalVisible={setIsCreateSessionModalVisible} fetchSessionErrorMessage={props.fetchClassRoomSessionErrorMessage} addClassRoomSessionErrorMessage={props.addClassRoomSessionErrorMessage} addClassroomSessionErrorList={props.addClassroomSessionErrorList}
        />
        }

        {isSessionDetailsModalVisible && <SessionModal previousTopicDetails={getPrevTopicDetails(props.fetchedClassroomSessions.toJS(),sessionDetails)} loggedInUser={props.loggedInUser.toJS()} setIsSessionDetailsModalVisible={setIsSessionDetailsModalVisible} sessionDetails={sessionDetails} setIsRescheduleModalVisible={setIsRescheduleModalVisible} isEndSessionModalVisible={isEndSessionModalVisible} setIsEndSessionModalVisible={setIsEndSessionModalVisible} isDeleteSessionModalVisible={isDeleteSessionModalVisible} filterClassroomSessionQuery={filterClassroomSessionQuery} setIsDeleteSessionModalVisible={setIsDeleteSessionModalVisible} updateBatchSessionQueryStatus={props.updateBatchSessionQueryStatus && props.updateBatchSessionQueryStatus.toJS()} updateAdhocSessionQueryStatus={props.updateAdhocSessionQueryStatus && props.updateAdhocSessionQueryStatus.toJS()} isUpcomingSession={isUpcomingSession} setClassEvents={setClassEvents} isFromSessionEmbed={isFromSessionEmbed} liveAttendanceData={props.fetchLiveAttendance} fetchLiveAttendanceStatus={props.fetchLiveAttendanceStatus && props.fetchLiveAttendanceStatus.toJS()} isSessionDetailsModalOpenedRef={isSessionDetailsModalOpenedRef} updateSessionLocally={updateSessionLocally} classEvents={classEvents} />}


        {isRescheduleModalVisible && <ReScheduleSessionModal sessionDetails={sessionDetails} isCreatingSession={props.isCreatingSession} hasCreatedSession={props.hasCreatedSession} loggedInUser={props.loggedInUser.toJS()} addClassRoomSessionErrorMessage={props.addClassRoomSessionErrorMessage} addClassroomSessionErrorList={props.addClassroomSessionErrorList}
            filterClassroomSessionQuery={filterClassroomSessionQuery} classroomId={sessionDetails.id} documentType={sessionDetails.extendedProps.documentType} isDeleteSessionModalVisible={isDeleteSessionModalVisible} setIsRescheduleModalVisible={setIsRescheduleModalVisible} />}

        {isFilterModalVisible && <FilterModal setIsFilterModalVisible={setIsFilterModalVisible} filterOptions={filterOptions} filterOptionsCollection={filterOptionsCollection} setFilterOptionsCollection={setFilterOptionsCollection} fetchedCourses={props.fetchedCourses} setFilterClassroomSessionQuery={setFilterClassroomSessionQuery} filterClassroomSessionQuery={filterClassroomSessionQuery} />}

        
        {props.isFetchingClassroomSessions &&
            <div className='timetable-calendar-loader-backdrop'>
                <LoadingSpinner
                    height='40vh'
                    position='absolute'
                    left='50%'
                    top='50%'
                    borderWidth='6px'
                    transform='translate(-50%, -50%)'
                    showLottie
                >
                    <span className='timetable-loading-text'>Loading Classes</span>
                </LoadingSpinner>
            </div>
        }
        <Calendar isSessionDetailsModalOpenedRef={isSessionDetailsModalOpenedRef} source='teacherApp' layoutStyle={CALENDAR_LAYOUTS.teacherApp} initialCalendarView='timeGridWeek' customButtons={{
            searchBox: {
                text: (
                    <Input icon={<SearchIcon />} setInput={setSearchInput} input={searchInput} debounce inputVal />
                ),
                hint: ' '
            },
            classroomFilter: {
                text: (
                    <ClassroomFilter loggedInUser={props.loggedInUser.toJS()} fetchedClassrooms={props.fetchedClassrooms.toJS()} setClassroomFilter={setClassroomFilter} />
                ),
                hint: ' '
            },
            legend:{
                text: (
                    <Legend />
                ),
                hint: ' '
            },
            filterBtn: {
                text: (
                    <div className={`filter-btn ${isFilterApplied() && 'filter-active-btn'}`} onClick={() => setIsFilterModalVisible(true)} role={'button'}><FilterIcon color={getThemeColor(props.loggedInUser.toJS())} />Filter</div>
                ),
                hint: 'Filter'
            },
            filterLabels: {
                text: (
                    <AppliedFiltersList filterOptionsCollection={filterOptionsCollection} setFilterOptionsCollection={setFilterOptionsCollection} filterClassroomSessionQuery={filterClassroomSessionQuery} setFilterClassroomSessionQuery={setFilterClassroomSessionQuery} />
                ),
                hint: ' '
            }
        }} customHeaderToolBar={getCalendarHeaderLayout()}
            handleEventClick={handleEventClick}
            fetchedEvents={classEvents.filteredEvents}
            datesSet={callBackToDatesSet}
            setIsSessionDetailsModalVisible={setIsSessionDetailsModalVisible}
            setSessionDetails={setSessionDetails}
            sessionDetails={sessionDetails}
            sessionsInADay={sessionsInADay}
            setIsUpcomingSession={setIsUpcomingSession}
            isUpcomingSession={isUpcomingSession}
            slotTimeRange={calendarTimeRange}

        />
        <div className='legendsContainer'>
         <IconsLegend/>
        <Legend />
        </div>
        {((get(props.loggedInUser.toJS(), 'secondaryRole') !=='schoolTeacher') || (forceAllowCount >= FORCE_ADMIN_PRIV_COUNT ) ) ?
              <Button text={<AddIcon />} textClass='addIcon' posAbsolute height={'56px'} width={'56px'} rounded onBtnClick={() => setIsCreateSessionModalVisible(true)} />
              : <div
                className='add_Session_Button_Overlay'
                onClick={() => {
                    setForceAllowCount(forceAllowCount+1)
                }}
              />
            }
        
    </div>

}


export default TimeTable
