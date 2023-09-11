import React from 'react'
import { at, get } from 'lodash'
import cx from 'classnames';
import styles from './sessionEmbed.module.scss'
import { Link } from 'react-router-dom'
import LoadingSpinner from '../../components/Loader/LoadingSpinner'
import Button from '../../components/Button/Button'
import { Power, TeacherManualIcon, UsersGroupRounded } from '../../../../constants/icons'
import hs, { hsFor1280 } from '../../../../utils/scale'
import EndSessionModal from '../TimeTable/components/EndSessionModal/EndSessionModal'
import fetchComponents from '../../../../queries/fetchComponents'
import { HOMEWORK_COMPONENTS } from '../../../../constants/topicComponentConstants'
import { getDataFromLocalStorage } from '../../../../utils/data-utils'
import fetchBatchSession from '../../../../queries/teacherApp/fetchBatchSession'
import store from '../../../../store'
import AttendanceModal from './AttendanceModal'
import { ArrowLeft } from '../../../../components/UpdatedSideNavBar/mainSideBarIcons'
import ClassOtpModal from './ClassOtpModal'
import { getBaseRedirectRoute } from '../../../../utils/teacherApp/goBackToTeacherApp'
import { backToPageConst } from '../../constants'
import { isAccessingTeacherTraining } from '../../../../utils/teacherApp/checkForEmbed';
import { countriesAllowed } from '../../../../config';
import ViewDetailsModal from '../ClassroomCourseListing/components/ViewDetailsModal';
import { API_CALL_TIME, UPDATE_SUB_SESSION_TIME } from '../../../Signup/schoolLiveClassLogin/constants/constants';
import getMe from '../../../../utils/getMe';
import { fireGtmEvent } from '../../../../utils/analytics/gtmActions';
import { gtmEvents } from '../../../../utils/analytics/gtmEvents';
import { getUserParams } from '../../../../utils/getUserParams';
import { gtmUserParams } from '../../../../components/UpdatedSideNavBar/utils';
import updateSubSession from '../../../../queries/subSessions/updateSubSession';

class SessionEmbed extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isDataFetching: false,
            sessionDetails: null,
            isEndSessionModalVisible: false,
            batchSessionData: {},
            isAttendanceModalOpen: false,
            isLoading: true,
            showOtpModal: false,
            isOtpModalReOpened: false,
            showTeacherManualModal: false,
        }
        this.attendanceModalRef = React.createRef()
        this.otpModalRef = React.createRef()
        this.fetchBatchSessionInterval = null;
        this.timer = null;
        this.tabSwitchedAt = null;
        this.updateBatchSubSessionInterval = null;
        this.broadcastChannel = new BroadcastChannel('sessionTimerChannel');
    }
    componentDidMount = async () => {
        const sessionDetails = getDataFromLocalStorage("classroomSessionsData")
        if (sessionDetails) {
            const courseId = get(sessionDetails, 'courseId')
            const topicId = get(sessionDetails, 'topicId')
            const componentName = get(sessionDetails, 'componentName')
            // await fetchMenteeCourseSyllabus()
            const isViewingHomework = componentName && [...HOMEWORK_COMPONENTS].includes(componentName)
            if (!isViewingHomework) {
                await fetchComponents(
                    topicId,
                    courseId
                ).classwork()
            } else {
                await fetchComponents(
                    topicId,
                    courseId
                ).homework()
            }
        } else {
            this.props.history.goBack()
        }
        const sessionId = get(sessionDetails, 'sessionId')
        const isRevisit = get(sessionDetails, 'isRevisit', false)
        const isRevisitingSession = ['true', 'True', true].includes(isRevisit)
        const componentName = get(sessionDetails, 'componentName')
        const isViewingHomework = componentName && [...HOMEWORK_COMPONENTS].includes(componentName)
        const inInLiveSession = (!isRevisitingSession && sessionId && !isViewingHomework)
        const backToPage = get(sessionDetails, 'backToPage')
        const otpModalShown = localStorage.getItem("otpModalShown") || false;
        if ([false, 'false', 'False'].includes(otpModalShown) && backToPage === backToPageConst.classroom) {
            this.setState({
                showOtpModal: true,
            });
            localStorage.setItem("otpModalShown", "true");
        }
        if (inInLiveSession && backToPage === backToPageConst.classroom) {
            await fetchBatchSession(sessionId);
            this.fetchBatchSessionInterval = setInterval(async()=>await fetchBatchSession(sessionId),API_CALL_TIME)
        }
        if (inInLiveSession) window.addEventListener('click', this.endClassModalHandler)
        // set sub session in localstorage if not there
        // set starttime if new sub session else update time spent
        if (inInLiveSession) {
            let storedSubSession = this.getCurrentSubSessionObj()
            const latestSubSession = this.getLatestSubSession()
            if (!storedSubSession) {
                storedSubSession = {
                    id: get(latestSubSession, 'id'),
                    timeElapsed: null,
                    startTime: null,
                }
            }
            const startTime = get(storedSubSession, 'startTime')
            if (startTime) {
                const currentTime = Date.now();
                const elapsedTime = currentTime - startTime;
                if (elapsedTime) {
                    const timeElapsed = elapsedTime ? Math.floor(elapsedTime / 1000) : 0
                    storedSubSession.timeElapsed = timeElapsed
                } else {
                    storedSubSession.timeElapsed = 0
                }
            } else {
                const currentTime = Date.now();
                storedSubSession.startTime = currentTime
                this.broadcastChannel.postMessage(currentTime);
            }
            const subSessions = this.getStoredSubSessions() || []
            if (subSessions.length) {
                await this.updateStoredSubSessions(storedSubSession)
            } else {
                const subSessionsToStore = [storedSubSession]
                localStorage.setItem('subSessions', JSON.stringify(subSessionsToStore))
            }
            document.addEventListener('visibilitychange', this.handleVisibilityChange);
            // update time of subsession every second
            this.timer = setInterval(() => {
                if (!document.hidden) {
                    let storedSubSession = this.getCurrentSubSessionObj()
                    if (!storedSubSession) {
                        storedSubSession = {
                            id: get(latestSubSession, 'id'),
                            timeElapsed: null,
                            startTime: Date.now(),
                        }
                    }
                    let elapsedTime = Date.now() - get(storedSubSession, 'startTime');
                    if (elapsedTime) {
                        elapsedTime = elapsedTime ? Math.floor(elapsedTime / 1000) : 0
                        storedSubSession.timeElapsed = elapsedTime
                    } else {
                        storedSubSession.timeElapsed = 0
                    }
                    this.updateStoredSubSessions(storedSubSession)
                } else {
                    this.tabSwitchedAt = Date.now();
                }
            }, 1000);
            // if session is running in two different tabs, need to send current time to make time in sync
            this.broadcastChannel.addEventListener('message', this.handleBroadcastMessage);
            this.updateSubSessionInterval()
        }
    }
    componentDidUpdate = (prevProps) => {
        if (prevProps.batchSessionDataFetchStatus !== this.props.batchSessionDataFetchStatus) {
            const loadingState = this.props.batchSessionDataFetchStatus && this.props.batchSessionDataFetchStatus.toJS()
            if(!get(loadingState,'loading') && get(loadingState,'success')){
                this.setState({isLoading:false})
            }
        }
    }
    endClassModalHandler = () =>{
        if (!this.state.isEndSessionModalVisible) {
            const shouldEndClass = localStorage.getItem('shouldEndClass')
            if (shouldEndClass && ['true', true].includes(shouldEndClass)) this.setIsEndSessionModalVisible()
        }
    }
    componentWillUnmount = () => {
        const sessionDetails = getDataFromLocalStorage("classroomSessionsData")
        const sessionId = get(sessionDetails, 'sessionId')
        const isRevisit = get(sessionDetails, 'isRevisit', false)
        const isRevisitingSession = ['true', 'True', true].includes(isRevisit)
        const componentName = get(sessionDetails, 'componentName')
        const isViewingHomework = componentName && [...HOMEWORK_COMPONENTS].includes(componentName)
        const inInLiveSession = (!isRevisitingSession && sessionId && !isViewingHomework)
        window.clearInterval(this.fetchBatchSessionInterval)
        window.clearInterval(this.updateBatchSubSessionInterval)
        window.removeEventListener("click", this.endClassModalHandler())
        clearInterval(this.timer);
        if (inInLiveSession) {
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
            this.broadcastChannel.removeEventListener('message', this.handleBroadcastMessage);
            //set time when leaving this session
            const currentTime = Date.now();
            let storedSubSession = this.getCurrentSubSessionObj()
            const timeElapsed = storedSubSession.timeElapsed
            const timeToSet = currentTime - timeElapsed
            storedSubSession.startTime = timeToSet
            this.updateStoredSubSessions(storedSubSession)
        }
    }

    updateStoredSubSessions = async (obj) => {
        const subSessions = this.getStoredSubSessions() || []
        const isSubSessionThere = subSessions.find(item => get(item, 'id') === get(obj, 'id'))
        if (!isSubSessionThere) {
            subSessions.push(obj)
        }
        const updatedSubSessions = subSessions.map(item => get(item, 'id') === get(obj, 'id') ? { ...item, timeElapsed: get(obj, 'timeElapsed'), startTime: get(obj, 'startTime') } : item)
        localStorage.setItem('subSessions', JSON.stringify(updatedSubSessions))
    }

    getCurrentSubSessionObj = () => {
        const subSessions = JSON.parse(localStorage.getItem('subSessions')) || []
        const latestSubSession = this.getLatestSubSession()
        return subSessions.find(item => get(item, 'id') === get(latestSubSession, 'id'))
    }

    getStoredSubSessions = () => {
        return JSON.parse(localStorage.getItem('subSessions')) || []
    }
    
    updateSubSessionInterval = () => {
        this.updateBatchSubSessionInterval = setInterval(() => {
            const latestSubSession = this.getLatestSubSession()
            const subSessionId = get(latestSubSession, 'id')
            let storedSubSession = this.getCurrentSubSessionObj()
            const timeSpent = get(storedSubSession, 'timeElapsed')
            if (timeSpent >= (UPDATE_SUB_SESSION_TIME/1000 - 1)) { //time spent is greater than interval then call api
                let duration = get(latestSubSession, 'duration')
                if (duration) {
                    duration = Number(duration) + timeSpent
                } else {
                    duration = timeSpent
                }
                const inputToSend = {
                    duration
                }
                updateSubSession(subSessionId, inputToSend)
                storedSubSession.startTime = Date.now()
                this.updateStoredSubSessions(storedSubSession)
            }
        }, UPDATE_SUB_SESSION_TIME)
    }

    handleVisibilityChange = () => {
        if (document.hidden) {
            clearInterval(this.timer);
            this.tabSwitchedAt = Date.now();
            localStorage.setItem('lastActiveTime', this.tabSwitchedAt); // save lastActiveTime in local storage
        } else {
            // update time every second when session is visible
            const lastActiveTime = parseInt(localStorage.getItem('lastActiveTime')) || 0;
            const elapsedTime = Date.now() - Math.max(this.tabSwitchedAt, lastActiveTime);
            if (elapsedTime < 0) {
                // negative elapsed time, skipping this visibility change.
                return;
            }
            let storedSubSession = this.getCurrentSubSessionObj();
            const storedStartTime = get(storedSubSession, 'startTime', 0);
            const adjustedStartTime = storedStartTime + elapsedTime;
            if (adjustedStartTime >= 0) { // make sure startTime is not set to a negative value
                storedSubSession.startTime = adjustedStartTime;
                this.updateStoredSubSessions(storedSubSession);
            }
            let storedSubSessionTemp = this.getCurrentSubSessionObj();
            const latestSubSession = this.getLatestSubSession()
            if (!storedSubSessionTemp) {
                storedSubSessionTemp = {
                    id: get(latestSubSession, 'id'),
                    timeElapsed: null,
                    startTime: Date.now(),
                }
            }
            const currentTime = Date.now();
            let elapsedTimeTemp = currentTime - adjustedStartTime;
            elapsedTimeTemp = elapsedTimeTemp ? Math.floor(elapsedTimeTemp / 1000) : 0;
            if (elapsedTimeTemp >= 0) {
                storedSubSessionTemp.timeElapsed = elapsedTimeTemp;
            } else {
                storedSubSessionTemp.timeElapsed = 0;
            }
            this.updateStoredSubSessions(storedSubSessionTemp);
            this.broadcastChannel.postMessage(currentTime);
            clearInterval(this.timer);
            this.timer = setInterval(() => {
                let storedSubSession = this.getCurrentSubSessionObj();
                const latestSubSession = this.getLatestSubSession()
                if (!storedSubSession) {
                    storedSubSession = {
                        id: get(latestSubSession, 'id'),
                        timeElapsed: null,
                        startTime: Date.now(),
                    }
                }
                let elapsedTime = Date.now() - get(storedSubSession, 'startTime');
                if (elapsedTime >= 0) {
                    elapsedTime = elapsedTime ? Math.floor(elapsedTime / 1000) : 0;
                    storedSubSession.timeElapsed = elapsedTime;
                } else {
                    storedSubSession.timeElapsed = 0;
                }
                this.updateStoredSubSessions(storedSubSession);
                this.broadcastChannel.postMessage(currentTime);
            }, 1000);
        }
    };

    handleBroadcastMessage = (event) => {
        const receivedStartTime = event.data;
        let storedSubSession = this.getCurrentSubSessionObj()
        const storedStartTime = get(storedSubSession, 'startTime');
        if (receivedStartTime > storedStartTime) {
            storedSubSession.startTime = receivedStartTime
            this.updateStoredSubSessions(storedSubSession)
        }
    };

    getLatestSubSession = () => {
        const batchSessionData = store.getState().data.getIn(['batchSessionData', 'data']).toJS()
        const subSessions = get(batchSessionData, 'subSessions', []);
        let latestSubSession;
        if (subSessions.length) {
          const tempSubSessions = [...subSessions];
          tempSubSessions.sort((a, b) => new Date(get(b, 'createdAt')) - new Date(get(a, 'createdAt')));
          latestSubSession = tempSubSessions[0];
        }
        return latestSubSession;
    };

    setIsEndSessionModalVisible = () =>{
        this.setState(prevState =>({
            isEndSessionModalVisible: !prevState.isEndSessionModalVisible
        }), () =>{
            if (this.state.isEndSessionModalVisible) {
                localStorage.removeItem("shouldEndClass")
            }
        })
    }
    endSession = () => {
        const sessionDetails = getDataFromLocalStorage("classroomSessionsData")
        const courseId = get(sessionDetails, 'courseId')
        const batchId = get(sessionDetails, 'batchId')
        const topicId = get(sessionDetails, 'topicId')
        const sessionId = get(sessionDetails, 'sessionId')
        const documentType = get(sessionDetails, 'documentType')
        const backToPage = get(sessionDetails, 'backToPage')
        const baseRedirectRoute =  getBaseRedirectRoute({ batchId, backToPage });
        window.location.replace(`${baseRedirectRoute}?endCurrentSession=true&batchId=${batchId}&courseId=${courseId}&topicId=${topicId}&sessionId=${sessionId}&documentType=${documentType}`)
    }
    markAsIncompleteSession = () => {
        const sessionDetails = getDataFromLocalStorage("classroomSessionsData")
        const courseId = get(sessionDetails, 'courseId')
        const batchId = get(sessionDetails, 'batchId')
        const topicId = get(sessionDetails, 'topicId')
        const sessionId = get(sessionDetails, 'sessionId')
        const documentType = get(sessionDetails, 'documentType')
        const backToPage = get(sessionDetails, 'backToPage')
        const baseRedirectRoute =  getBaseRedirectRoute({ batchId, backToPage });
        window.location.replace(`${baseRedirectRoute}?inCompleteSession=true&batchId=${batchId}&courseId=${courseId}&topicId=${topicId}&sessionId=${sessionId}&documentType=${documentType}`)
    }
    closeModal = () => {
        this.setState({isAttendanceModalOpen:false})
    }
    closeOtpModal = () => {
        this.setState({ showOtpModal: false })
    }

    handleAttendenceButtonClicked = () => {
        if (!this.state.isLoading) {
            this.setState({isAttendanceModalOpen: !this.state.isAttendanceModalOpen})
        }
    }
    buddyLoginStudentStatus = (batchSessionData) => {
        let userLogggedInStatus = get(batchSessionData,'loggedInUserStatus',[])
        const attendance =  get(batchSessionData,'attendance',[])
        if(userLogggedInStatus.length > 0){
            userLogggedInStatus= userLogggedInStatus.filter((item) => {
            // check if the user is in attendance with status absent , then filter
            const userId = get(item,'user.id')
            const isUserAbsent = attendance.filter((item) => {
                const attendanceUserId = get(item,'student.user.id')
                return attendanceUserId === userId && get(item,'status') !== 'present'
            })
            if(isUserAbsent.length > 0){
                return false
            }
            return true
        })
    
    }
        
        const newPresentStudents = []
        const presentStudentsMap = {}
        const uniquePresentStudentsMap = {}
        if(userLogggedInStatus.length > 0){

        // // create unique present students with system id and user id
        // userLogggedInStatus.forEach((item,index) =>{
        //     const {student} = item
        //     const userId = get(item,'user.id')
        //     const systemId = get(item,'systemId')
        //     // filter the userid from userLogggedInStatus
        //     const presentUser = userLogggedInStatus.filter((item) => get(item,'user.id') === userId)

        //     const isAllLogin = presentUser.every((item) => get(item,'isLoggedIn', false))
        //     // const isSingleLogin = userLogggedInStatus.filter(item => get(item,'user.id') === userId && get(item,"systemId") === systemId).length === 1
        //     if(isAllLogin){
        //         uniquePresentStudentsMap[`${userId}-${systemId}`] = item
        //     }
        //     else{
        //         uniquePresentStudentsMap[userId] = item
        //     }
        // })
        const uniquePresentStudents = userLogggedInStatus
        const newPresentStudentMap = {}
        if(uniquePresentStudents.length > 0){
            uniquePresentStudents.forEach((item,index) =>{
                const {student} = item
                const userId = get(item,'user.id')
                const systemId = get(item,'systemId')
                const isLoggedIn = get(item,'isLoggedIn', false)
                if(isLoggedIn){
                    if(presentStudentsMap[systemId]){
                        // check if userid exist in presentStudentsMap
                        const isUserExist = presentStudentsMap[systemId].filter((item) => get(item,'user.id') === userId).length > 0
                        if(!isUserExist){
                            presentStudentsMap[systemId].push(item)
                        }
                    }
                    else{
                        presentStudentsMap[systemId] = [item]
    
                    }
                }
                else{
                   presentStudentsMap[index] = [item]
                }
            })
            // create map from presentStudentMap key as value 
            Object.keys(presentStudentsMap).forEach((key,index) =>{
                const student = presentStudentsMap[key]
            
                if(student.length === 1){
                    const studentDetail = student[0]
                    const userId = get(studentDetail,'user.id')
                    const isLoggedIn = get(studentDetail,'isLoggedIn', false)
                    // check if student exist in buddy group
                    const isBuddyUser = Object.values(presentStudentsMap).filter((item) => {
                    const isStudentBuddy = item.length > 1
                    if(isStudentBuddy){
                        const buddyUser = item.filter((item) => get(item,'user.id') === userId)
                        return buddyUser.length > 0
                    }
                    else{
                        return false
                    }
                    })
                    const isBuddy = isLoggedIn ? [] : isBuddyUser
                    if(!isBuddy.length > 0){
                        newPresentStudentMap[get(student[0],'user.id')] = student
                    }
                    
                }
                else{
                    newPresentStudentMap[`${index}`] = student

                }
                
            }
            )
        }
        Object.entries(newPresentStudentMap).forEach(([key,value],index) =>{
            const students = []
            value.forEach((item) => {
                    const userId = get(item,'user.id')
                    const isLoggedIn = get(item,'isLoggedIn')
                    const systemId = get(item,'systemId')
                    const userAttendance = attendance.filter((item) => get(item,'student.user.id') === userId)
                    const student = get(userAttendance[0],'student')
                    const duplicateStudents = userLogggedInStatus.filter((item) => get(item,'user.id') === userId && get(item,'systemId') !== systemId)
                    let duplicate = false
                    duplicate = duplicateStudents.some((item) => get(item,'isLoggedIn', false) === true)
                    
                    students.push(
                        {
                            ...student,
                            isLoggedIn,
                            duplicate
                        }
                    )
                
            })
            if(students.length > 0){
                newPresentStudents.push({
                    student: students,
                })
            }
        })
    }
        return newPresentStudents
      
        }
    render() {
        const { isDataFetching, isEndSessionModalVisible, isLoading, isOtpModalReOpened, showTeacherManualModal} = this.state
        const sessionDetails = getDataFromLocalStorage("classroomSessionsData")
        const componentName = get(sessionDetails, 'componentName')
        const sessionId = get(sessionDetails, 'sessionId')
        const isRevisit = get(sessionDetails, 'isRevisit', false)
        const isRevisitingSession = ['true', 'True', true].includes(isRevisit)
        const isViewingHomework = componentName && [...HOMEWORK_COMPONENTS].includes(componentName)
        const batchId = get(sessionDetails, 'batchId');
        const backToPage = get(sessionDetails, 'backToPage');
        const baseRedirectRoute =  getBaseRedirectRoute({ batchId, backToPage });
        const batchSessionData = store.getState().data.getIn(['batchSessionData', 'data']).toJS()
        const referenceContent = get(sessionDetails, 'referenceContent')
        const attendanceData = batchSessionData && get(batchSessionData,'attendance',[])
        const presentStudents =  this.buddyLoginStudentStatus(batchSessionData)
        const totalPresentStudents = attendanceData.filter(student => student.status === 'present').length
        const absentStudents = attendanceData && attendanceData.filter(student => student.status !== 'present')
        const sessionOtp = get(batchSessionData, 'schoolSessionsOtp[0].otp')
        const isInLiveSession = !isRevisitingSession && sessionId && !isViewingHomework
        if (isAccessingTeacherTraining()) {
            return (
                <>
                    {isEndSessionModalVisible && <EndSessionModal endSession={this.endSession} setIsEndSessionModalVisible={this.setIsEndSessionModalVisible} markAsIncompleteSession={this.markAsIncompleteSession} newFlow fromSessionEmbed />}
                    <div className={cx(styles.iframeContainer, isAccessingTeacherTraining() && styles.trainingIframeContainer)}>
                        {this.props.children}
                    </div>
                </>
            )
        }
        return (
        <>
            {this.state.isAttendanceModalOpen && <AttendanceModal totalPresentStudents={totalPresentStudents} attendanceData={attendanceData} closeModal={this.closeModal} absentStudentsData={absentStudents} presentStudentsData={presentStudents} modalRef={this.attendanceModalRef}/>}
            {this.state.showOtpModal && isInLiveSession && <ClassOtpModal otp={sessionOtp} isLoading={isLoading} totalPresentStudents={totalPresentStudents} closeOtpModal={this.closeOtpModal} otpModalRef={this.otpModalRef} presentStudents={presentStudents} attendanceData={attendanceData} isOtpModalReOpened={isOtpModalReOpened} />}
            {isEndSessionModalVisible && <EndSessionModal endSession={this.endSession} setIsEndSessionModalVisible={this.setIsEndSessionModalVisible} markAsIncompleteSession={this.markAsIncompleteSession} newFlow fromSessionEmbed />}
            {isDataFetching && <div className={styles.timetableCalendarLoaderBackdrop}>
                <LoadingSpinner
                    height='40vh'
                    position='absolute'
                    left='50%'
                    top='50%'
                    borderWidth='6px'
                    transform='translate(-50%, -50%)'
                    showLottie
                >
                </LoadingSpinner>
            </div>}
            <div className={styles.embedPageContainer}>
                {!isAccessingTeacherTraining() ? (
                    <div className={styles.embedPageHeader}>
                    <div className={styles.linkContainer} >
                        {
                            baseRedirectRoute ? (
                                <Link to={baseRedirectRoute}
                                onClick={() => {
                                    const userParams =  gtmUserParams()
                                    fireGtmEvent(gtmEvents.backIconCTAClickedOnInSessionPage,{userParams})
                                }}
                                className={styles.routerLink}><Button leftIcon type={'ghost'}>
                                    <ArrowLeft height='28' width='28' color='#858585' />
                                </Button>
                                </Link>
                            ) : null
                        }
                        {isInLiveSession ? (
                            <div className={styles.attendance} onClick={() => {
                                const userParams =  gtmUserParams()
                                fireGtmEvent(gtmEvents.attendanceCTAClickedOnInSessionPage,{userParams})
                                this.handleAttendenceButtonClicked()}}>
                                {this.state.isLoading ? <LoadingSpinner height='16px' width='16px' left='50%'/>:
                                <>
                                    <div className={styles.groupIcon}>
                                        <UsersGroupRounded height={hsFor1280(16)} width={hsFor1280(16)} fill='#858585'/>
                                    </div>
                                    <p>{presentStudents && totalPresentStudents}/{attendanceData && attendanceData.length} <span className={styles.joinedText}>joined</span></p>
                                </>
                                }
                            </div>
                        ) : null}
                    </div>
                    <div className={styles.ctaContainer}>
                    {referenceContent ? (
                        <div
                            onClick={() => {
                                this.setState({ showTeacherManualModal: true })
                                const userParams =  gtmUserParams()
                                fireGtmEvent(gtmEvents.teacherManualOnSessionsPageClicked,{userParams})
                            }}
                            className={styles.viewTeacherManualContainer}
                        >
                            <TeacherManualIcon />
                            <p>View Teacher Manual</p>
                        </div>
                    ) : null}
                    {isInLiveSession && backToPage === backToPageConst.classroom ? (
                        <div className={styles.otpButtonContainer} onClick={() => {
                            const userParams = gtmUserParams()
                            fireGtmEvent(gtmEvents.continueCTAClickedOnClassOTPModal,{userParams})
                            this.setState({ showOtpModal: true, isOtpModalReOpened: true })
                        }
                        }>
                            <h3>OTP:</h3>
                            {isLoading ? <LoadingSpinner height='16px' width='16px'/> : <span>{sessionOtp}</span>}
                        </div>
                    ) : null}
                    {isInLiveSession && <div className={styles.endClassCtaContainer}>
                        <div 
                            className={styles.endClassLink} 
                            onClick={()=> {
                                const userParams = gtmUserParams()
                                fireGtmEvent(gtmEvents.endClassCTAClickedOnInSessionPage,{userParams})
                                this.setIsEndSessionModalVisible(true)
                            }}
                        >
                            <Power height={hs(22)} width={hs(22)}/>
                            <p className={styles.endClassBtn}>
                                End Class
                            </p>
                        </div>
                    </div>}
                    </div>
                </div>
                ) : null}
                <div className={cx(styles.iframeContainer, isAccessingTeacherTraining() && styles.trainingIframeContainer)}>
                    {this.props.children}
                </div>
            </div>
            {showTeacherManualModal ? (
                <ViewDetailsModal
                    title={`Teacher Manual - Lab ${get(sessionDetails, 'prevTopicOrder')+1}. ${get(sessionDetails, 'title')}`}
                    body={referenceContent}
                    showFooter={true}
                    onClose={() => this.setState({ showTeacherManualModal: false })}
                    visible={showTeacherManualModal}
                    >
                </ViewDetailsModal>
            ) : null}
        </>
    )
    }
}

export default SessionEmbed;