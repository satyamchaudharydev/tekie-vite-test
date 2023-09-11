import React, { Component } from 'react'
import cx from 'classnames'
import { format } from 'date-fns'
import { get, toString } from 'lodash'
import ReactTooltip from 'react-tooltip'
import styles from './BookSession.module.scss'
import '../../SessionCoursePage.scss'
import { ActionButton } from '../../../../components/Buttons'
import getPath from '../../../../utils/getPath'
import getSlotLabel from '../../../../utils/slots/slot-label'
import formatDate from '../../../../utils/date-utils/formateDate'
import LoginForm from '../../../../components/LoginForm'
import login from '../../../../queries/login'
import fetchMentorSession from '../../../../queries/sessions/fetchMentorSession'
import fetchMenteeSession from '../../../../queries/sessions/fetchMenteeSession'
import addMentorMenteeSession from '../../../../queries/sessions/addMentorMenteeSession'
import fetchMentorMenteeSession from '../../../../queries/sessions/fetchMentorMenteeSession'
import updateMentorMenteeSession from '../../../../queries/sessions/updateMentorMenteeSession'
import updateAttendence from '../../../../queries/updateAttendance'
import { getToasterBasedOnType, Toaster } from '../../../../components/Toaster'
import BookSessionLoader from '../../components/BookSessionLoader'
import offsetDate from '../../../../utils/date-utils/date-offset'
import { rescheduleSessionMsg } from '../../../../constants/sessions/messages'
import { getPrevTopicId } from '../../../../utils/getPrevTopicId'
import {
    startSessionMessage,
    nextSessionStartMessage,
    bookFirstSessionMessage,
    paymentMsg,
    referralPaymentMsg
} from '../../../../constants/sessions/messages'
import { filterKey, getDataFromLocalStorage, minCap, setDataInLocalStorage } from "../../../../utils/data-utils";
import PopUp from "../../../../components/PopUp/PopUp";
import hs from '../../../../utils/scale'
import WifiConfetti from '../../../../assets/animations/wifi-animation.json'
import VideoBtn from '../VideoBtn/VideoBtn'
import Lottie from 'react-lottie'
import ContentLoader from 'react-content-loader'
import ContactSchoolAdminPopup from '../SchoolAdminPopup/ContactSchoolAdminPopup'
import fetchBatchSession from '../../../../queries/sessions/fetchBatchSessions'
import getIntlDateTime from '../../../../utils/time-zone-diff'
import moment from 'moment'
import requestToGraphql from '../../../../utils/requestToGraphql'
import getFetchMentorMenteeSessionWithMenteeTopicFilterQuery, { getMentorMenteeSessionQuery, updateMentorMenteeSessionQuery } from './fetchMentorMenteeSessionWithMenteeTopicFilter'
import store from '../../../../store'
import { fromJS } from 'immutable'
import { Button3D } from '../../../../photon'
import getCourseId, { getCourseName } from '../../../../utils/getCourseId'
import { PYTHON_COURSE } from '../../../../config'
import { getLORedirectKey } from '../../../UpdatedSessions/utils'
import isMobile from '../../../../utils/isMobile'
import mentorMenteeSessionAddOrDelete, { markAttendance } from '../../../../utils/mmSessionAddOrDelete'
import { getActiveBatchDetail } from '../../../../utils/multipleBatch-utils'
import { Clock3, ClockIcon, Figma, FolderIcon, Power } from '../../../../constants/icons'
import CoursePill from '../CoursePill'
import UpdatedButton from '../../../../components/Buttons/UpdatedButton/UpdatedButton'
import getMe from '../../../../utils/getMe'

const buttonTextProps = {
    hideIconContainer: true,
    buttonTextCenterAligned: true
}



const emptyEmailProps = {
    type: 'loading',
    message: 'Enter Email Id!'
}

const emptyPasswordProps = {
    type: 'loading',
    message: 'Enter Password!'
}

const somethingWentWrongProps = {
    type: 'error',
    message: 'Sorry, something went wrong.'
}

const loginFailedProps = {
    type: 'error',
    message: 'Login failed!'
}

const sessionOverProps = {
    type: 'loading',
    message: 'Session already completed!'
}

const noSessionFoundProps = {
    type: 'loading',
    message: 'Sorry, session does not exist.'
}

const oldSessionError = {
    type: 'loading',
    message: 'Session has already started!'
}

const sessionNotStarted = {
    type: 'error',
    message: 'Session has not started yet!'
}

const cannotDeleteOldSlots = {
    type: 'error',
    message: 'Cannot delete old slots!'
}

const confettiOption = {
    loop: true,
    autoplay: true,
    animationData: WifiConfetti,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice',
        viewBoxSize: '-5 16 60 60'
    }
}


const NextIcon = () => {
    return (
        <svg width='100%' height='100%' fill="none" viewBox="0 0 24 24">
            <path
                d="M12.308 15.748l3.72-3.75-3.72-3.75m3.204 3.75H7.966"
                stroke="#A8A7A7"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12 21c4.969 0 9-4.031 9-9s-4.031-9-9-9-9 4.031-9 9 4.031 9 9 9z"
                stroke="#A8A7A7"
                strokeWidth={1.8}
                strokeMiterlimit={10}
            />
        </svg>
    )
}

const CalendarIcon = () => (
    <svg width='100%' height='100%' fill="none" viewBox="0 0 35 35">
        <path
            d="M0 31.41V9.87h35V31.41A3.648 3.648 0 0131.316 35H3.684A3.649 3.649 0 010 31.41z"
            fill="#B9F6FF"
        />
        <path
            d="M35 6.282v5.389H0V6.282a3.648 3.648 0 013.684-3.59h27.631A3.648 3.648 0 0135 6.282z"
            fill="#FF5744"
        />
        <path
            d="M25.795 3.59a2.694 2.694 0 102.757 2.693 2.728 2.728 0 00-2.757-2.693zm-16.585 0a2.694 2.694 0 102.763 2.693A2.73 2.73 0 009.21 3.59z"
            fill="#B71C1C"
        />
        <path
            d="M25.79 0a1.825 1.825 0 00-1.842 1.795v4.488a1.842 1.842 0 003.684 0V1.795A1.825 1.825 0 0025.79 0zM9.212 0a1.825 1.825 0 00-1.843 1.795v4.488a1.843 1.843 0 003.684 0V1.795A1.825 1.825 0 009.212 0z"
            fill="#B0BEC5"
        />
        <path
            d="M7.37 15.256h3.683v3.59H7.369v-3.59zm5.525 0h3.684v3.59h-3.684v-3.59zm5.527 0h3.683v3.59h-3.683v-3.59zm5.526 0h3.684v3.59h-3.684v-3.59zM7.369 20.641h3.684v3.594H7.369V20.64zm5.526 0h3.684v3.594h-3.684V20.64zm5.527 0h3.683v3.594h-3.683V20.64zm5.526 0h3.684v3.594h-3.684V20.64zM7.369 26.025h3.684v3.59H7.369v-3.59zm5.526 0h3.684v3.59h-3.684v-3.59zm5.527 0h3.683v3.59h-3.683v-3.59zm5.526 0h3.684v3.59h-3.684v-3.59z"
            fill="#00ADE6"
        />
    </svg>
)

const TheoryIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" strokeWidth={0.5} stroke='#282828' d="M1.5 2.50001C3.52634 2.50928 4.93878 2.76402 5.88879 3.21791C6.81018 3.65813 7.30362 4.28714 7.51531 5.12279C7.57151 5.34463 7.77115 5.5 8 5.5C8.22885 5.5 8.42849 5.34463 8.48469 5.12279C8.69638 4.28714 9.18983 3.65813 10.1112 3.21791C11.0612 2.76402 12.4737 2.50927 14.5 2.5V11.5C10.891 11.5 9.11854 12.1469 7.99996 13.2528C6.88527 12.152 5.11044 11.5011 1.50936 11.5C1.5051 11.489 1.5 11.4695 1.5 11.4397V2.50001ZM1.1179 1.57526C1.23968 1.52509 1.37018 1.49951 1.50189 1.50001L1.50225 1.50001C3.58627 1.50935 5.17314 1.76772 6.31989 2.31561C7.06575 2.67197 7.62047 3.14907 8 3.74087C8.37954 3.14907 8.93426 2.67197 9.68012 2.31561C10.8269 1.76772 12.4137 1.50935 14.4978 1.50001L14.4981 1.50001C14.6298 1.49951 14.7603 1.52509 14.8821 1.57526C15.0039 1.62543 15.1145 1.69921 15.2077 1.79234C15.3008 1.88548 15.3746 1.99612 15.4247 2.1179C15.4748 2.2393 15.5003 2.36938 15.5 2.50069V11.5C15.5 11.7652 15.3946 12.0196 15.2071 12.2071C15.0196 12.3946 14.7652 12.5 14.5 12.5C10.5592 12.5 9.20449 13.2947 8.39045 14.3123C8.29554 14.431 8.15183 14.5 7.99989 14.5C7.84795 14.5 7.70428 14.4309 7.60942 14.3122C6.8009 13.3005 5.44051 12.5 1.5 12.5C1.19841 12.5 0.934482 12.3723 0.75352 12.1598C0.578866 11.9546 0.500004 11.6943 0.500004 11.4397V2.50079C0.499653 2.36945 0.525226 2.23934 0.575259 2.1179C0.625433 1.99612 0.699212 1.88548 0.792344 1.79234C0.885477 1.69921 0.996121 1.62543 1.1179 1.57526Z" fill="#282828" />
        <path fill-rule="evenodd" clip-rule="evenodd" strokeWidth={0.5} stroke='#282828' d="M8 4.5C8.27614 4.5 8.5 4.72386 8.5 5V14C8.5 14.2761 8.27614 14.5 8 14.5C7.72386 14.5 7.5 14.2761 7.5 14V5C7.5 4.72386 7.72386 4.5 8 4.5Z" fill="#282828" />
    </svg>
)

const ClockIcon2 = () => (
    <svg width={'100%'} height={'100%'} fill="none" viewBox="0 0 35 35">
        <path
            d="M17.258 33.988c9.385 0 16.994-7.608 16.994-16.994S26.643 0 17.258 0C7.872 0 .264 7.608.264 16.994s7.608 16.994 16.994 16.994z"
            fill="#B9F6FF"
        />
        <path
            d="M17.26.483a17.258 17.258 0 1017.257 17.259A17.277 17.277 0 0017.26.483zm0 31.599A14.341 14.341 0 1131.6 17.74 14.358 14.358 0 0117.26 32.08z"
            fill="#00ADE6"
        />
        <path
            d="M22.97 18.632h-5.56v-8.306a1.19 1.19 0 10-2.382 0v9.5a1.191 1.191 0 001.19 1.192h6.751a1.191 1.191 0 000-2.382v-.004z"
            fill="#00ADE6"
        />
    </svg>
)

const CourseBadge = ({ title, icon }) => {
    return <div className={styles.courseBadgeContainer}>
        <div className={styles.courseBadgeContentContainer}>
            {icon ? <div className={styles.courseBadgeIconContainer}>
                {/* <Figma height={hs(20)} width={hs(20)}/> */}
                <img style={{ height: hs(20) }} src={getPath(icon)} alt="course-icon" />
            </div> : null}
            <span>
                {title}
            </span>
        </div>
    </div>
}

const NewSessionCard = ({ topicTitle, course, topicDescription, thisRef, topicThumbnailSmall, sessionStatus, i, goToInSession, topicId, batchSessionId, studentProfileId }) => {
    return <div className={styles.newCardContainer}>
        <div className={styles.newCardTopicDetailsContainer}>
            <div className={styles.newCardTopicTextContainer}>
                <h3 className={styles.newCardUpcomingClass}><span className={styles.centerSvg}><Clock3 height={hs(24)} width={hs(24)} /></span> Your Upcoming Class</h3>
                <h1 className={styles.newCardTopicTitle}>{i} - {topicTitle}</h1>
                {(get(course, 'courseDisplayName') || get(course, 'title')) && (
                    <CourseBadge title={get(course, 'courseDisplayName') || get(course, 'title')} icon={get(course, 'thumbnailSmall.uri')} />
                )}
                <p className={styles.newCardTopicDescription}>{topicDescription}</p>
            </div>
            {get(topicThumbnailSmall, 'uri') ? <div className={styles.topicThumbnailContainer}>
                {/* <FolderIcon height={hs(200)} width={hs(150)}/> */}
                <img src={getPath(topicThumbnailSmall.uri)} height={'100%'} width={'100%'} alt="topic-icon" style={{ objectFit: 'contain' }} />
                {/* <img src={'https://via.placeholder.com/150x200'} height={'100%'} width={'100%'} alt="topic-icon" /> */}
            </div> : null}
        </div>
        <div className={styles.newCardCtaContainer}>
            <UpdatedButton
                text='Go to Class'
                isDisabled={!(
                    sessionStatus === 'completed' ||
                    sessionStatus === 'started'
                )}
                onBtnClick={() => {
                    markAttendance(batchSessionId, studentProfileId)
                    goToInSession(topicId)
                }}
            />
        </div>
    </div>
}

class BookSession extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showStartSessionPopup: false,
            sessionStartTime: null,
            slotNumber: null,
            bookDate: null,
            isTimeDiffZero: false,
            width: window.innerWidth,
            showContactSchoolPopup: false,
            showSpeedTestPopup: false,
            testingSpeed: false,
            speed: -1,
            showBatchPopup: false,
            showBatchSessionLoading: false,
            showLoader: false,
            isDesktop: typeof window === 'undefined' ? true : window.innerWidth > 900,
            fromVideoBtn: false,
            creatingSession: false,
        }
    }


    getTimeDifference = () => {
        const { bookingDate, slotTime, loggedInUser } = this.props
        const country = loggedInUser && get(loggedInUser.toJS(), 'parent.country')
            ? get(loggedInUser.toJS(), 'parent.country')
            : 'india'
        if (country === 'india') {
            const bookingDateWithTime = offsetDate(new Date(bookingDate), 0.23, 'ADD').setHours(slotTime, 0, 0, 0)
            const timeDiff = bookingDateWithTime - new Date().getTime()

            return timeDiff
        }

        const slotDateTime = getIntlDateTime(new Date(bookingDate), slotTime, moment.tz.guess())
        const bookingDateWithTime = offsetDate(new Date(get(slotDateTime, 'intlDateObj')), 0.23, 'ADD').setHours(get(slotDateTime, 'intlSlot'), get(slotDateTime, 'intlMin'), 0, 0)
        const timeDiff = bookingDateWithTime - new Date().getTime()

        return timeDiff
    }

    creatingSessionAction = () => {
        this.setState({ creatingSession: !this.state.creatingSession })
    }

    remoteControlTimer = (start, stop, setTime, getTime) => {
        const { bookingDate, slotTime, showBookOption } = this.props
        if (
            (this.getTimeDifference() <= 0) &&
            !this.state.isTimeDiffZero
        ) {
            this.setState({
                isTimeDiffZero: true
            })
        }

        if (!showBookOption &&
            ((this.state.bookDate !== bookingDate) || (this.state.slotNumber !== slotTime))) {
            stop()
            setTime(this.getTimeDifference())
            start()
            this.setState({
                slotNumber: slotTime,
                bookDate: bookingDate
            })
        }
    }

    downloadFile = (url, size, startTime, __this) => {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                const endTime = new Date().getTime()
                const time = (endTime - startTime) / 1000
                const speed = (size / time) / 1000000
                __this.setState({
                    testingSpeed: false,
                    speed
                })
            }
        }
        xmlHttp.open("GET", url, true); // true for asynchronous
        xmlHttp.send(null);
    }

    getSpeed = () => {
        // var xmlHttp = new XMLHttpRequest()
        // var __this = this
        // xmlHttp.onreadystatechange = function() {
        //     if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        //         const targets = JSON.parse(xmlHttp.responseText).targets
        //         __this.downloadFile(targets[0].url, 209715184, new Date().getTime(), __this)
        //     }
        // }
        // xmlHttp.open("GET", 'https://api.fast.com/netflix/speedtest/v2?https=true&token=YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm&urlCount=5', true); // true for asynchronous
        // xmlHttp.send(null);
    }

    markAttendence = () => {
        this.setState({ fromVideoBtn: true }, () => {
            this.handleOnClick()
        })
    }

    showVideoBtn = () => {
        const { bookingDate, studentProfile } = this.props
        const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile, '[0].batch'))
        return (studentProfile && get(batchDetail, 'type') === 'b2b' &&
            get(batchDetail, 'customSessionLink') &&
            bookingDate)
    }

    componentDidMount() {
        const { bookingDate, slotTime, sessionStatus, topicId } = this.props
        this.props.myFunctionRef.current = this.handleOnClick
        this.setState({
            slotNumber: slotTime,
            bookDate: bookingDate
        })
        window.addEventListener('resize', () => {
            const { innerWidth } = window
            if (this.state.width !== innerWidth) {
                this.setState({
                    width: innerWidth
                })
            }
        })

        this.setState({
            testingSpeed: true,
            speed: -1
        }, () => {
            this.getSpeed()
        })


        if (sessionStatus === 'completed' || sessionStatus === 'started') {
            this.props.fetchThisTopicData(topicId)
        }
    }

    routeToSession = (sessionStartDate, topicId, quizReportTopicId) => this.setState({
        showStartSessionPopup: false,
        sessionStartTime: sessionStartDate
    }, () => {
        if (getCourseName() === PYTHON_COURSE) {
            this.props.firstTopicId === topicId
                ? this.props.history.push({
                    pathname: `/sessions/video/${topicId}`,
                    state: {
                        quizReportTopicId: quizReportTopicId
                    }
                })
                : this.props.history.push({
                    pathname: `/sessions/quiz-report-latest/${topicId}`,
                    state: {
                        quizReportTopicId: quizReportTopicId
                    }
                })
        } else {
            this.routeToUpdatedSessions(topicId, { quizReportTopicId: quizReportTopicId })
        }
    })

    checkIfHomeworkExistsInPrevSession = () => {
        const { previousTopicObj } = this.props
        if (previousTopicObj && previousTopicObj.topicId) {
            const homeworkComponentRule = get(previousTopicObj, 'topicComponentRule', []).filter(rule => {
                if (['quiz'].includes(get(rule, 'componentName'))) {
                    return true
                }
                return false
            })
            return homeworkComponentRule.length ? true : false
        }
        return false
    }

    routeToUpdatedSessions = (topicId, state = {}) => {
        const { firstComponent, previousTopicObj } = this.props
        const componentName = get(firstComponent, 'componentName', null)
        const childComponentName = get(firstComponent, 'childComponentName', null)
        const isHomeworkExistsinPrevSession = false
        if (isHomeworkExistsinPrevSession) {
            if (get(previousTopicObj, 'topicId')) localStorage.setItem('previousTopicId', get(previousTopicObj, 'topicId'))
            if (firstComponent) localStorage.setItem('firstComponent', JSON.stringify(get(previousTopicObj, 'topicId')))
            this.props.history.push({
                pathname: `sessions/quiz-report-latest/${getCourseId(topicId)}/${topicId}`,
                state: {
                    quizReportTopicId: get(previousTopicObj, 'topicId'),
                    firstComponent
                }
            })
        } else {
            if (componentName === 'blockBasedProject') {
                this.props.history.push({
                    pathname: `sessions/project/${getCourseId(topicId)}/${topicId}/${get(firstComponent, 'componentId')}`,
                    state
                })
                return null
            } else if (componentName === 'blockBasedPractice') {
                this.props.history.push({
                    pathname: `sessions/practice/${getCourseId(topicId)}/${topicId}/${get(firstComponent, 'componentId')}`,
                    state
                })
                return null
            } else if (componentName === 'learningObjective') {
                /** Todo: route to different Lo based on LoComponent Rule from course  */
                this.props.history.push({
                    pathname: `sessions/${getLORedirectKey({ componentName: childComponentName })}/${getCourseId(topicId)}/${topicId}/${get(firstComponent, 'componentId')}`,
                    state
                })
                return null
            }
            if (get(firstComponent, 'componentId')) {
                this.props.history.push({
                    pathname: `sessions/video/${getCourseId(topicId)}/${topicId}/${get(firstComponent, 'componentId')}`,
                    state
                })
            } else {
                this.props.history.push({
                    pathname: `sessions/video/${getCourseId(topicId)}/${topicId}`,
                    state
                })
            }
        }
        return true
    }

    async componentDidUpdate(prevProps) {
        const { mentee, mentor, topicId, bookingDate, slotTime, loggedInUser } = this.props
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        if (this.props.mentorLoginStatus && prevProps.mentorLoginStatus) {
            if (this.props.mentorLoginStatus.get('success') &&
                !prevProps.mentorLoginStatus.get('success')) {
                await fetchMenteeSession(mentee.toJS().id, bookingDate, `slot${slotTime}`, null, true).call()
                await fetchMentorSession(mentor.toJS().id, bookingDate, `slot${slotTime}`, '', country, true).call()
            } else if (this.props.mentorLoginStatus.get('failure') &&
                !prevProps.mentorLoginStatus.get('failure')) {
                if (this.props.mentorLoginErrorReason) {
                    const errorMsg = this.props.mentorLoginErrorReason.last().getIn(['error', 'errors', 0, 'message']);
                    getToasterBasedOnType({
                        type: 'error',
                        message: errorMsg
                    })
                } else {
                    getToasterBasedOnType(loginFailedProps)

                }
            }
        }
        if (this.props.mentorSessionFetchStatus && prevProps.mentorSessionFetchStatus) {
            if (this.props.mentorSessionFetchStatus.get('success') !== prevProps.mentorSessionFetchStatus.get('success')
                && this.props.mentorSessionFetchStatus.get('success')) {
                const input = {
                    "sessionStatus": "started",
                    "internetSpeed": { speed: this.state.speed, unit: "Mbps" },
                    "startSessionByMentee": new Date()
                }
                if (this.props.mentorSession.getIn([0]) && this.props.menteeSession.getIn([0])) {
                    addMentorMenteeSession(this.props.mentorSession.getIn([0]).get('id'),
                        this.props.menteeSession.getIn([0]).get('id'), topicId, input, true).call()
                } else {
                    getToasterBasedOnType(somethingWentWrongProps)
                }
            }
        }

        if (
            this.props.mentorMenteeSessionAddStatus &&
            prevProps.mentorMenteeSessionAddStatus
        ) {
            if (
                this.props.mentorMenteeSessionAddStatus.getIn([`mentorMenteeSession/${topicId}`, 'success']) &&
                !prevProps.mentorMenteeSessionAddStatus.getIn([`mentorMenteeSession/${topicId}`, 'success'])
            ) {
                this.setState({
                    showStartSessionPopup: false
                })
                const quizReportTopicId = getPrevTopicId(this.props.topics, topicId)

                if ((this.state.width < 500) && (getCourseName() === PYTHON_COURSE)) {
                    getToasterBasedOnType({
                        type: 'loading',
                        message: 'Start the session in desktop'
                    })
                    return null
                }
                if (getCourseName() === PYTHON_COURSE) {
                    this.props.firstTopicId === topicId
                        ? this.props.history.push({
                            pathname: `/sessions/video/${topicId}`,
                            state: {
                                quizReportTopicId: quizReportTopicId
                            }
                        })
                        : this.props.history.push({
                            pathname: `/sessions/quiz-report-latest/${topicId}`,
                            state: {
                                quizReportTopicId: quizReportTopicId
                            }
                        })
                } else {
                    this.routeToUpdatedSessions(topicId)
                }
            } else {
                if (
                    this.props.mentorMenteeSessionAddStatus.getIn([`mentorMenteeSession/${topicId}`, 'failure']) &&
                    !prevProps.mentorMenteeSessionAddStatus.getIn([`mentorMenteeSession/${topicId}`, 'failure'])
                ) {
                    const { mentorMenteeAddSessionErrors } = this.props
                    const errorsCount = mentorMenteeAddSessionErrors && mentorMenteeAddSessionErrors.toJS().length
                    if (mentorMenteeAddSessionErrors && mentorMenteeAddSessionErrors.getIn([errorsCount - 1])) {
                        const error = mentorMenteeAddSessionErrors.getIn([
                            (errorsCount - 1), 'error', 'errors', 0, 'extensions', 'exception', 'name'
                        ])
                        if (error === 'SimilarDocumentAlreadyExistError') {
                            if (this.props.mentorSession.getIn([0]) && this.props.menteeSession.getIn([0])) {
                                fetchMentorMenteeSession(this.props.mentorSession.getIn([0]).get('id'),
                                    this.props.menteeSession.getIn([0]).get('id'), null,
                                    'mentorMenteeSessionFilter', 'withMenteeMentorToken', true, topicId).call()
                            }
                        }
                    }
                }
            }
        }

        if (
            this.props.mentorMenteeSessionFetchStatus &&
            prevProps.mentorMenteeSessionFetchStatus
        ) {
            if (
                this.props.mentorMenteeSessionFetchStatus.getIn([`mentorMenteeSession/${topicId}`, 'success']) &&
                !prevProps.mentorMenteeSessionFetchStatus.getIn([`mentorMenteeSession/${topicId}`, 'success'])
            ) {
                const { mentorMenteeSession, studentProfile } = this.props
                const session = filterKey(mentorMenteeSession, `mentorMenteeSession/${topicId}`)
                if (session && session.getIn([0, 'id'])) {
                    const sessionStartDate = session.getIn([0, 'sessionStartDate'])
                    const quizReportTopicId = getPrevTopicId(this.props.topics, topicId)
                    // const isBatchSession = studentProfile
                    //                         ? get(studentProfile.toJS(), '0.batch.id') &&
                    //                             (
                    //                                 get(studentProfile.toJS(), '0.batch.type') === 'b2b' ||
                    //                                 get(studentProfile.toJS(), '0.batch.type') === 'b2b2c'
                    //                             )
                    //                         : false
                    const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile.toJS(), '[0].batch'))
                    const isBatchSession = get(batchDetail, 'id')
                    if (
                        session.getIn([0, 'sessionStatus']) === 'started' ||
                        (session.getIn([0, 'sessionStatus']) === 'completed' && isBatchSession)
                    ) {
                        this.routeToSession(sessionStartDate, topicId, quizReportTopicId)
                    } else if (session.getIn([0, 'sessionStatus']) === 'allotted') {
                        updateMentorMenteeSession(
                            session.getIn([0, 'id']),
                            { "sessionStatus": "started", "internetSpeed": { speed: this.state.speed, unit: "Mbps" }, "startSessionByMentee": new Date(), "startSessionByMenteePlatform": this.state.isDesktop ? "laptop" : "mobile" },
                            topicId,
                            true
                        ).call()
                        this.routeToSession(sessionStartDate, topicId, quizReportTopicId)
                    } else {
                        getToasterBasedOnType(sessionOverProps)
                    }
                }
                // else {
                //     getToasterBasedOnType(noSessionFoundProps)
                // }
            }
        }

        if (
            prevProps.batchSessionStatus && this.props.batchSessionStatus &&
            !get(prevProps.batchSessionStatus.toJS(), `batchSession/${topicId}.success`) &&
            get(this.props.batchSessionStatus.toJS(), `batchSession/${topicId}.success`)
        ) {
            const { batchSession } = this.props
            const currBatchSession = filterKey(batchSession, `batchSession/${topicId}`)
            if (currBatchSession && get(currBatchSession.toJS(), '0.sessionStatus') !== 'allotted') {
                if (this.state.fromVideoBtn && this.props.studentProfile) {
                    updateAttendence(get(currBatchSession.toJS(), '[0].id'), get(this.props.studentProfile.toJS(), '[0].id')).call()
                    this.setState({ fromVideoBtn: false })
                    const batchDetail = getActiveBatchDetail(this.props.studentProfile && get(this.props.studentProfile.toJS(), '[0].batch'))
                    window.open(get(batchDetail, 'customSessionLink'), '_blank')
                }
                else if (mentee && topicId) {
                    if (get(this.props.studentProfile.toJS(), '[0].id')) {
                        // Query to mark attendance for the student
                        const { studentProfile } = this.props
                        const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile.toJS(), '[0].batch'))
                        markAttendance(get(currBatchSession.toJS(), '[0].id'), get(studentProfile.toJS(), '[0].id'))
                        const currentSessionId = getDataFromLocalStorage('currentSessionId')
                        if (get(batchDetail, 'type') === 'b2b' && get(batchDetail, 'documentType') === 'classroom' && (!currentSessionId || currentSessionId !== get(currBatchSession.toJS(), '[0].id'))) {
                            setDataInLocalStorage('currentSessionId', get(currBatchSession.toJS(), '[0].id'))
                        }
                    }
                    mentorMenteeSessionAddOrDelete(
                        get(mentee.toJS(), 'id'),
                        topicId,
                        get(currBatchSession.toJS(), '0.mentorSession.id'),
                        'started',
                        'BookSession', null, false, () => this.creatingSessionAction()
                    )
                } else {
                    getToasterBasedOnType(somethingWentWrongProps)
                }
            } else if (currBatchSession && get(currBatchSession.toJS(), '0.sessionStatus') === 'allotted') {
                this.creatingSessionAction()
                getToasterBasedOnType(sessionNotStarted)
            }
        }
    }

    shouldShowLoader = () => {
        const {
            mentorSessionFetchStatus, menteeSessionFetchStatus,
            mentorMenteeSessionAddStatus, mentorLoginStatus,
            isDeletingSession, batchSessionStatus, topicId
        } = this.props
        return (
            (this.state.showStartSessionPopup || this.state.showBatchSessionLoading) &&
            (
                (mentorLoginStatus && mentorLoginStatus.getIn(['loading'])) ||
                (mentorSessionFetchStatus && mentorSessionFetchStatus.getIn(['loading'])) ||
                (menteeSessionFetchStatus && menteeSessionFetchStatus.getIn(['loading'])) ||
                (
                    mentorMenteeSessionAddStatus[`mentorMenteeSession/${this.props.topicId}`] &&
                    (mentorMenteeSessionAddStatus[`mentorMenteeSession/${this.props.topicId}`]).getIn(['loading'])
                ) ||
                (batchSessionStatus && get(batchSessionStatus.toJS(), `batchSession/${topicId}.loading`))
            )
            && !isDeletingSession
        )
    }

    closeStartSessionPopup = () => {
        this.setState({
            showStartSessionPopup: false
        })
    }

    getSlotTimeLabel = (slotTime) => {
        const slotLabel = getSlotLabel(slotTime)
        const breakPoint = isMobile()
        if (breakPoint) {
            return `${getSlotLabel(slotTime, { appendMinutes: true }).startTime.toUpperCase()}`
        } else {
            return `${slotLabel.startTime} - ${slotLabel.endTime}`
        }
    }

    shouldAllow = () => {
        const { bookingDate, slotTime } = this.props
        return (
            this.getTimeDifference() <= 0 &&
            (!(format(new Date(), 'yyyy-MM-dd') > format(new Date(bookingDate), 'yyyy-MM-dd')) ||
                !(format(new Date(), 'yyyy-MM-dd') === format(new Date(bookingDate), 'yyyy-MM-dd') &&
                    new Date().getHours() > slotTime + 2))
        )
    }

    nextQueryToCall = async () => {
        const {
            mentor, topicId, loggedInUser,
            mentorSession, menteeSession,
            mentorMenteeSession, studentProfile
        } = this.props
        const session = filterKey(mentorMenteeSession, `mentorMenteeSession/${this.props.topicId}`)
        if (topicId !== localStorage.getItem('currTopicId')) {
            localStorage.setItem('currTopicId', topicId)
        }
        const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile.toJS(), '[0].batch'))
        //Handling batch users.
        if (studentProfile &&
            get(batchDetail, 'id') &&
            (get(batchDetail, 'type') === 'b2b' || get(batchDetail, 'type') === 'b2b2c'
                || get(batchDetail, 'type') === 'normal')
        ) {
            if (session && (session.getIn([0, 'sessionStatus']) === 'started' || session.getIn([0, 'sessionStatus']) === 'completed')) {
                return 'noQuery'
            }
            return 'batchQuery'
        }

        //Handling normal users.
        const menteeId = loggedInUser
            ? get(loggedInUser.toJS(), 'id')
            : ''
        const alreadyFetchSessionForNormalUsers = filterKey(
            mentorMenteeSession,
            `mentorMenteeSession/${menteeId}/${topicId}`
        )
        const alreadyAddedSessionForNormalUsers = filterKey(
            mentorMenteeSession,
            `mentorMenteeSession/${topicId}`
        )
        if (
            (
                alreadyFetchSessionForNormalUsers &&
                (get(alreadyFetchSessionForNormalUsers.toJS(), '0.sessionStatus') === 'started' || get(alreadyFetchSessionForNormalUsers.toJS(), '0.sessionStatus') === 'completed')
            ) ||
            (
                alreadyAddedSessionForNormalUsers &&
                (get(alreadyAddedSessionForNormalUsers.toJS(), '0.sessionStatus') === 'started' || get(alreadyAddedSessionForNormalUsers.toJS(), '0.sessionStatus') === 'completed')
            )
        ) {
            return 'noQuery'
        } else {
            this.setState({
                showLoader: true
            })
            const newlyFetchedMentorMenteeSession = await requestToGraphql(getFetchMentorMenteeSessionWithMenteeTopicFilterQuery(
                menteeId,
                topicId
            ))
            if (newlyFetchedMentorMenteeSession) {
                //Auto reducing the data fetched into the duck store.
                if (
                    get(newlyFetchedMentorMenteeSession, 'data.mentorMenteeSessions') &&
                    get(newlyFetchedMentorMenteeSession, 'data.mentorMenteeSessions').length
                ) {
                    store.dispatch({
                        type: 'mentorMenteeSession/fetch/success',
                        key: `mentorMenteeSession/${menteeId}/${topicId}`,
                        payload: fromJS({
                            extractedData: {
                                mentorMenteeSession: get(newlyFetchedMentorMenteeSession, 'data.mentorMenteeSessions'),
                                topic: get(newlyFetchedMentorMenteeSession, 'data.mentorMenteeSessions.0.topic')
                            }
                        }),
                        autoReducer: true
                    })
                }
                this.setState({
                    showLoader: false
                })
                //Checking conditions to allow or deny the session access.
                if (get(newlyFetchedMentorMenteeSession, 'data.mentorMenteeSessions.0.sessionStatus') === 'allotted') {
                    getToasterBasedOnType(sessionNotStarted)
                } else if (
                    get(newlyFetchedMentorMenteeSession, 'data.mentorMenteeSessions.0.sessionStatus') === 'started' ||
                    get(newlyFetchedMentorMenteeSession, 'data.mentorMenteeSessions.0.sessionStatus') === 'completed'
                ) {
                    return 'noQuery'
                } else if (mentor && mentor.getIn(['id'])) {
                    if (
                        (mentorSession && get(mentorSession.getIn([0]), 'id')) &&
                        (menteeSession && get(menteeSession.getIn([0]), 'id'))
                    ) {
                        if (session && session.getIn([0, 'id'])) {
                            return 'noQuery'
                        } else {
                            return 'mentorMenteeSessionQuery'
                        }
                    } else {
                        return 'mentorQuery'
                    }
                } else {
                    return 'mentorQuery'
                }
            }
        }
    }

    handleOnClick = async () => {
        const isChrome = true
        const {
            showBookOption, showBookPopup, topicTitle,
            topicId, showPurchaseOption, showPaymentProductModal,
            mentor, mentee, bookingDate, slotTime, schoolInfo,
            mentorSession, menteeSession, topicOrder, loggedInUser,
            studentProfile
        } = this.props
        const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile, '0.batch'))
        if (mentee.toJS().id && topicId &&
            !get(batchDetail, 'id')) {
            requestToGraphql(getMentorMenteeSessionQuery(mentee.toJS().id, topicId)).then(resp => {
                if (get(resp, 'data.mentorMenteeSessions[0].id') && !get(resp, 'data.mentorMenteeSessions[0].sessionJoinedByMenteeAt')
                    && get(resp, 'data.mentorMenteeSessions[0].sessionStatus') === 'started') {
                    requestToGraphql(updateMentorMenteeSessionQuery(get(resp, 'data.mentorMenteeSessions[0].id'), new Date().toISOString()))
                }
            })
        }
        if (loggedInUser && get(loggedInUser.toJS(), 'parent.phone.number') === '8827706789') {
            this.props.history.push({ pathname: '/revisit' })
        } else if (showPurchaseOption) {
            if (this.props.schoolName) {
                this.props.history.push(`/checkout?productName=Live%201:1%20Classes&schoolName=${this.props.schoolName}`)
            } else {
                showPaymentProductModal()
            }
        } else if (showBookOption) {
            if (loggedInUser && loggedInUser.getIn(['parent', 'source']) === 'school') {
                this.setState({
                    showContactSchoolPopup: true
                })
            } else if (schoolInfo && get(schoolInfo, 'source') === 'school') {
                this.setState({
                    showContactSchoolPopup: true
                })
            } else if (
                studentProfile &&
                get(batchDetail, 'id')
            ) {
                this.setState({
                    showBatchPopup: true
                })
            } else {
                showBookPopup(topicId, topicTitle, topicOrder)
            }
        } else {
            const queryToCall = await this.nextQueryToCall()
            switch (queryToCall) {
                case 'mentorQuery':
                    if (import.meta.env.REACT_APP_NODE_ENV === 'staging' || import.meta.env.REACT_APP_NODE_ENV === 'production' || this.shouldAllow()) {
                        if ((this.state.width < 500) && (getCourseName() === PYTHON_COURSE)) {
                            getToasterBasedOnType({
                                type: 'loading',
                                message: 'Start the session in desktop'
                            })
                        } else if (isChrome) {
                            this.setState({
                                showStartSessionPopup: true
                            })
                        } else {
                            getToasterBasedOnType({
                                type: 'loading',
                                message: 'Start the session in google chrome'
                            })
                        }
                    }
                    break
                case 'sessionQuery':
                    if (import.meta.env.REACT_APP_NODE_ENV === 'staging' || import.meta.env.REACT_APP_NODE_ENV === 'production' || this.shouldAllow()) {
                        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
                        await fetchMenteeSession(mentee.toJS().id, bookingDate, `slot${slotTime}`, null, true).call()
                        await fetchMentorSession(mentor.toJS().id, bookingDate, `slot${slotTime}`, '', country, true).call()
                    }
                    break
                case 'mentorMenteeSessionQuery':
                    if (import.meta.env.REACT_APP_NODE_ENV === 'staging' || import.meta.env.REACT_APP_NODE_ENV === 'production' || this.shouldAllow()) {
                        if (mentorSession && menteeSession) {
                            const input = {
                                "sessionStatus": "started",
                                "internetSpeed": { speed: this.state.speed, unit: "Mbps" },
                                "startSessionByMentee": new Date()
                            }
                            addMentorMenteeSession(
                                get(mentorSession.getIn([0]), 'id'),
                                get(menteeSession.getIn([0]), 'id'), topicId, input, true
                            ).call()
                        }
                    }
                    break
                case 'noQuery':
                    if (import.meta.env.REACT_APP_NODE_ENV === 'staging' || import.meta.env.REACT_APP_NODE_ENV === 'production' || this.shouldAllow()) {
                        const quizReportTopicId = getPrevTopicId(this.props.topics, topicId)
                        if ((this.state.width < 500) && (getCourseName() === PYTHON_COURSE)) {
                            getToasterBasedOnType({
                                type: 'loading',
                                message: 'Start the session in desktop'
                            })
                            return null
                        }
                        if (getCourseName() === PYTHON_COURSE) {
                            this.props.firstTopicId === topicId
                                ? this.props.history.push({
                                    pathname: `/sessions/video/${topicId}`,
                                    state: {
                                        quizReportTopicId: quizReportTopicId
                                    }
                                })
                                : this.props.history.push({
                                    pathname: `/sessions/quiz-report-latest/${topicId}`,
                                    state: {
                                        quizReportTopicId: quizReportTopicId
                                    }
                                })
                        } else {
                            this.routeToUpdatedSessions(topicId, { quizReportTopicId: quizReportTopicId })
                        }
                    }
                    break
                case 'batchQuery':
                    if (this.state.creatingSession) return;
                    this.creatingSessionAction()
                    fetchBatchSession(studentProfile && get(batchDetail, 'id'), topicId, true).call()
                    if (import.meta.env.REACT_APP_NODE_ENV === 'staging' || import.meta.env.REACT_APP_NODE_ENV === 'production' || this.shouldAllow()) {
                        if ((this.state.width < 500) && (getCourseName() === PYTHON_COURSE)) {
                            getToasterBasedOnType({
                                type: 'loading',
                                message: 'Start the session in desktop'
                            })
                        } else if (isChrome) {
                            this.setState({
                                showBatchSessionLoading: true
                            })
                        } else {
                            getToasterBasedOnType({
                                type: 'loading',
                                message: 'Start the session in google chrome'
                            })
                        }
                    }
                    break
                default:
                    break
            }
        }
    }

    handleLogin = (email, password) => {
        if (email.length === 0) {
            getToasterBasedOnType(emptyEmailProps)
        } else if (password.length === 0) {
            getToasterBasedOnType(emptyPasswordProps)
        } else if (email.length > 0 && password.length > 0) {
            login(email, password, 'loggedInMentor')
        }
    }

    handleEdit = (topicId, topicTitle, bookingDate, slotTime, showEditPopup, topicOrder, intlBookingDate) => {
        showEditPopup(null, topicId, topicTitle, bookingDate, slotTime, topicOrder, intlBookingDate)
    }

    isButtonActive = () => {
        const { showBookOption, showPurchaseOption } = this.props
        if (showPurchaseOption) {
            return true
        } else if (showBookOption) {
            return true
        }
        return this.shouldAllow()
    }

    getGoToPastSessionMsg = () => {
        const goToPastSessionMsg = [
            <div>This is a demo account. Please go to</div>,
            <div className={styles.pastSession} onClick={() => {
                this.props.history.push({ pathname: '/revisit' })
            }}>Past Sessions</div>,
            <div style={{ marginLeft: '5px' }}>and revisit a session to check our product.</div>
        ]

        return goToPastSessionMsg
    }

    getBannerMsg = () => {
        const {
            bookingDate,
            slotTime,
            showPurchaseOption,
            profile,
            loggedInUser,
            studentProfile,
            intlSlotTime
        } = this.props
        const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile.toJS(), '0.batch'))
        const country = loggedInUser && get(loggedInUser.toJS(), 'parent.country')
            ? get(loggedInUser.toJS(), 'parent.country')
            : 'india'
        const fromReferral = profile && profile.toJS() && profile.toJS().fromReferral
        // const isBatch = studentProfile
        //                     ? get(studentProfile.toJS(), '0.batch.id') &&
        //                         (
        //                             get(studentProfile.toJS(), '0.batch.type') === 'b2b' ||
        //                             get(studentProfile.toJS(), '0.batch.type') === 'b2b2c'
        //                         )
        //                     : false
        const isBatch = get(batchDetail, 'id')
        const batchPhone = studentProfile
            ? get(batchDetail, 'allottedMentor.phone.number')
            : ''

        if (this.props.isLoading) {
            return <div />
        } else {
            const intlDateTimeObj = getIntlDateTime(bookingDate, slotTime, moment.tz.guess())
            if (loggedInUser && get(loggedInUser.toJS(), 'parent.phone.number') === '8827706789') {
                return <div style={{ display: 'flex', flexDirection: 'row' }}>{this.getGoToPastSessionMsg()}</div>
            } else if (showPurchaseOption) {
                return <div>{fromReferral ? referralPaymentMsg : paymentMsg}</div>
            } else if (this.props.showBookOption && isBatch && batchPhone) {
                return <div>{`Reach out to your mentor at ${batchPhone} to book.`}</div>
            } else if (
                this.props.showBookOption &&
                !(this.props.completedSessions && this.props.completedSessions.length > 0)
            ) {
                return <div>{bookFirstSessionMessage}</div>
            } else if (
                (!this.props.showBookOption &&
                    bookingDate) ?
                    (
                        (country === 'india' && format(new Date(), 'yyyy-MM-dd') > format(new Date(bookingDate), 'yyyy-MM-dd')) ||
                        (country !== 'india' && moment().format('DD/MM/YYYY') > moment(get(intlDateTimeObj, 'intlDateObj')).format('DD/MM/YYYY'))
                    ) : (
                        (country === 'india' && bookingDate && format(new Date(), 'yyyy-MM-dd') === format(new Date(bookingDate), 'yyyy-MM-dd') && new Date().getHours() > slotTime) ||
                        (
                            country !== 'india' && bookingDate &&
                            moment(get(intlDateTimeObj, 'intlDateObj')).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY') &&
                            ((new Date().getHours() > (get(intlDateTimeObj, 'intlSlot') + 1) && get(intlDateTimeObj, 'intlMin') > new Date().getMinutes()) || new Date().getHours() > (get(intlDateTimeObj, 'intlSlot') + 2))
                        )
                    )
            ) {
                return <div className={styles.timerMsg}>{rescheduleSessionMsg}</div>
            } else if (!this.props.showBookOption) {
                return (
                    this.getTimeDifference() > 0
                        ? <div className={styles.timerMsg}>{nextSessionStartMessage}</div>
                        : <div className={styles.timerMsg}>{startSessionMessage}</div>
                )
            }

            return {}
        }
    }

    renderBanner = () => {
        const { loggedInUser } = this.props
        const country = loggedInUser && get(loggedInUser.toJS(), 'parent.country')
        return (
            (!this.props.showBookOption && !this.props.showPurchaseOption) ||
                (this.props.completedSessions && this.props.completedSessions.length > 0 && !this.props.showPurchaseOption)
                ? (
                    <div className={styles.timerBanner}>
                        <div style={{ display: 'flex', width: `${this.state.width >= 1000 ? '100%' : '100%'}`, justifyContent: 'center', position: 'relative' }}>
                            {
                                (
                                    this.getTimeDifference() &&
                                    Object.keys(this.getBannerMsg()).length &&
                                    !this.props.isLoading
                                )
                                    ? <div className={styles.timerIcon} />
                                    : <div />
                            }
                            {
                                Object.keys(this.getBannerMsg()).length
                                    ? this.getBannerMsg()
                                    : <div />
                            }
                            {
                                this.props.isLoading === false &&
                                    (this.getTimeDifference() > 0)

                                    ? (
                                        <div>
                                        </div>
                                    )
                                    : (
                                        <div />
                                    )
                            }
                        </div>
                        {/* {
                            this.state.width >= 1000
                                ? (
                                    <div
                                        className={cx(styles.speedTestIcon, (this.state.speed > 0 && this.state.speed < 2) ? styles.animateSpeedTestIcon : '')}
                                        onClick={() => this.setState({
                                            showSpeedTestPopup: true,
                                            testingSpeed: true,
                                            speed: -1
                                        }, () => this.getSpeed())}
                                    />
                                ) : <div />
                        } */}
                    </div>
                ) :
                (
                    <div className={styles.timerBanner}>
                        <div style={{ display: 'flex', width: `${this.state.width >= 1000 ? '100%' : '100%'}`, justifyContent: 'center', position: 'relative' }}>
                            {this.getBannerMsg()}
                        </div>
                        {/* {
                            this.state.width >= 1000
                                ? (
                                    <div
                                        className={cx(styles.speedTestIcon, (this.state.speed > 0 && this.state.speed < 2) ? styles.animateSpeedTestIcon : '')}
                                        onClick={() => this.setState({
                                            showSpeedTestPopup: true,
                                            testingSpeed: true,
                                            speed: -1
                                        }, () => this.getSpeed())}
                                    />
                                ) : <div />
                        } */}
                    </div>
                )
        )
    }

    handleCancel = (topicId, handleCancel) => {
        const { bookingDate, slotTime, loggedInUser } = this.props
        const country = loggedInUser && get(loggedInUser.toJS(), 'parent.country')
            ? get(loggedInUser.toJS(), 'parent.country')
            : 'india'
        const intlDatetimeObj = getIntlDateTime(bookingDate, slotTime, moment.tz.guess())
        const intlSlot = get(intlDatetimeObj, 'intlSlot')
        const intlBookingDateObj = get(intlDatetimeObj, 'intlDateObj')
        if (
            (country === 'india' && formatDate(new Date()).date === formatDate(new Date(bookingDate)).date) ||
            (country !== 'india' && moment().format('DD/MM/YYYY') === moment(intlBookingDateObj).format('DD/MM/YYYY'))
        ) {
            if (
                (country === 'india' && slotTime <= new Date().getHours()) ||
                (country !== 'india' && ((intlSlot === new Date().getHours() && get(intlDatetimeObj, 'intlMin') <= new Date().getMinutes()) || intlSlot < new Date().getHours()))
            ) {
                getToasterBasedOnType(cannotDeleteOldSlots)
            } else {
                handleCancel(topicId)
            }
        } else if (
            (country === 'india' && formatDate(new Date()).date > formatDate(new Date(bookingDate)).date) ||
            (country !== 'india' && moment().format('DD/MM/YYYY') > moment(intlBookingDateObj).format('DD/MM/YYYY'))
        ) {
            getToasterBasedOnType(cannotDeleteOldSlots)
        } else {
            handleCancel(topicId)
        }
    }

    renderActivities = (topicId, topicTitle, bookingDate, slotTime, showEditPopup, handleCancel, topicOrder, intlBookingDate) => {
        const { studentProfile } = this.props
        const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile.toJS(), '0.batch'))
        // const isBatch = studentProfile
        //     ? get(studentProfile.toJS(), '0.batch.id') &&
        //         (
        //             get(studentProfile.toJS(), '0.batch.type') === 'b2b' ||
        //             get(studentProfile.toJS(), '0.batch.type') === 'b2b2c'
        //         )
        //     : false
        const isBatch = get(batchDetail, 'id')
        const classroomTitle = studentProfile
            ? get(batchDetail, "classroomTitle")
            : "";
        const batchCode = studentProfile
            ? get(batchDetail, "code")
            : "";
        const documentType = studentProfile
            ? get(batchDetail, "documentType")
            : "batch";
        let batchName = '';
        if (documentType === 'classroom') {
            batchName = classroomTitle || batchCode
        } else {
            batchName = batchCode;
        }
        if (isBatch && batchName && batchName.length) {
            let trimmedName
            if (this.state.width >= 1100 && batchName.length > 20) {
                trimmedName = batchName.substr(0, 20) + '...'
            } else if (this.state.width < 1100 && batchName.length > 15) {
                trimmedName = batchName.substr(0, 15) + '...'
            } else {
                trimmedName = batchName
            }

            return (
                <div>
                    <div className={styles.batchNameContainer}>
                        <ReactTooltip
                            id='main'
                            place='top'
                            effect='float'
                            multiline={false}
                            className={styles.toolTip}
                            arrowColor='#bff7f9'
                            textColor='rgba(0, 0, 0, 0.8)'
                        />
                        <div style={{ fontWeight: 'bold' }}>Batch Name:</div>
                        <div
                            style={{ marginLeft: '5px' }}
                            data-for='main'
                            data-tip={batchName}
                            data-iscapture='true'
                        >
                            {trimmedName}
                        </div>
                    </div>
                </div>
            )
        }
        return (
            <div style={{ display: 'flex' }}>
                <div
                    className={styles.hover}
                    onClick={() => this.handleEdit(topicId, topicTitle, bookingDate, slotTime, showEditPopup, topicOrder, intlBookingDate)}
                >
                    <div className={
                        cx(
                            styles.activityIconContainer,
                            styles.editIcon
                        )
                    } />
                    <div className={
                        cx(
                            styles.activityText,
                            styles.editText
                        )
                    }>Reschedule</div>
                </div>
                <div className={
                    cx(
                        styles.separator,
                        styles.activitySeparator
                    )
                } />
                <div
                    className={styles.hover}
                    onClick={() => this.handleCancel(topicId, handleCancel)}
                >
                    <div className={
                        cx(
                            styles.activityIconContainer,
                            styles.cancelIcon
                        )
                    } />
                    <div className={
                        cx(
                            styles.activityText,
                            styles.cancelText
                        )
                    }>Cancel</div>
                </div>
            </div>
        )
    }

    getSpeedQualityAndStyling = () => {
        const { speed } = this.state
        const quality = {}
        if (speed === -1) {
            quality['message'] = "Checking connection..."
        } else if (speed < 2) {
            quality['text'] = 'Poor'
            quality['styles'] = styles.poorConnection
            quality['message'] = "Try another way."
        } else if (2 <= speed && speed < 5) {
            quality['text'] = 'Fair'
            quality['styles'] = styles.fairConnection
            quality['message'] = "You're good to go!"
        } else if (speed >= 5) {
            quality['text'] = 'Good'
            quality['styles'] = styles.goodConnection
            quality['message'] = "You're good to go!"
        }

        return quality
    }

    renderSpeedTestLoader = () => (
        <ContentLoader
            className={styles.speedTestLoader}
            speed={1}
            backgroundColor={'#ffffff'}
            foregroundColor={'#35E4E9'}
        >
            <rect x='10' y='16' width='20' height='20' />
        </ContentLoader>
    )

    getButtonTitle = () => {
        const { showPurchaseOption, showBookOption, loggedInUser, studentProfile } = this.props
        const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile.toJS(), '0.batch'))
        const isCoursePackageExists = studentProfile
            ? get(batchDetail, 'coursePackage.id')
            : false
        if (loggedInUser && get(loggedInUser.toJS(), 'parent.phone.number') === '8827706789') {
            return 'Go To Past Sessions'
        } else if (showPurchaseOption) {
            return 'Buy Now'
        } else if (showBookOption) {
            return 'Book Session'
        }

        if (loggedInUser && (get(loggedInUser.toJS(), 'parent.role') === 'mentor') && isCoursePackageExists) {
            return 'Start Lesson'
        }
        return 'Start Session'
    }

    getDate = () => {
        const {
            bookingDate, loggedInUser, intlBookingDate
        } = this.props
        const breakPoint = isMobile()
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        if (bookingDate) {
            if (breakPoint) {
                if (country !== 'india') {
                    return moment(new Date(intlBookingDate)).format('dddd, D0 MMM')
                } else {
                    return moment(new Date(bookingDate)).format('dddd, Do MMM')
                }
            } else {
                if (country !== 'india') {
                    return moment(new Date(intlBookingDate)).format('dddd, MMMM DD')
                } else {
                    return moment(new Date(bookingDate)).format('dddd, MMMM DD')
                }
            }
        }
        return 'Session Date'
    }

    getTime = () => {
        const { slotTime, loggedInUser, intlSlotTime } = this.props
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        if (slotTime || slotTime === 0) {
            if (country !== 'india') {
                return intlSlotTime
            } else {
                return this.getSlotTimeLabel(slotTime)
            }
        }
        return 'Session Timing'
    }

    getCourseDetailsOfBookedSession = (courseId, courses) => {
        if (courseId && courses) {
            return courses.find(thisCourse => thisCourse.id === courseId)
        }
        return null
    }

    onStartSession = () => {
        const { thisSession } = this.props
    }

    render() {
        const { topicTitle, topicId, topicThumbnailSmall, topicDescription, studentProfile, i, thisSession } = this.props
        const batchSessionId = get(thisSession, 'batchSession.id')
        const studentProfileId = get(getMe().thisChild, 'studentProfile.id')
        const breakPoint = isMobile()
        const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile.toJS(), '0.batch'))
        const isBatch = studentProfile
            ? get(batchDetail, 'id')
            : false
        const classroomTitle = studentProfile
            ? get(batchDetail, "classroomTitle")
            : "";
        const batchCode = studentProfile
            ? get(batchDetail, "code")
            : "";
        const documentType = studentProfile
            ? get(batchDetail, "documentType")
            : "batch";
        let batchName = "";
        if (documentType === "classroom") {
            batchName = classroomTitle || batchCode;
        } else {
            batchName = batchCode;
        }
        let trimmedName = ''
        if (isBatch && batchName && batchName.length > 0) {
            if (this.state.width >= 1100 && batchName.length > 20) {
                trimmedName = batchName.substr(0, 20) + '...'
            } else if (this.state.width < 1100 && batchName.length > 15) {
                trimmedName = batchName.substr(0, 15) + '...'
            } else {
                trimmedName = batchName
            }
        }



        const shouldReschedule = !this.props.showBookOption && !isBatch
        if (this.props.loadingPage) {
            return (
                <>
                    <div className='sp-current-component-bg'>
                        <div className='sp-current-component-container'>
                            <div className='sp-current-component-left-container' style={{ width: '100%' }}>
                                <div className='sp-current-component-up-next'>
                                    Up next
                                    <div className='sp-current-component-next-icon'>
                                        <NextIcon />
                                    </div>
                                </div>
                                <ContentLoader
                                    className='sp-loader-card'
                                    speed={5}
                                    interval={0.1}
                                    backgroundColor={'#ffffff'}
                                    foregroundColor={'#cce7e9'}
                                >
                                    <rect className='sp-loader-1' />
                                    <rect className='sp-loader-2' />
                                    <rect className='sp-loader-3' />
                                    <rect className='sp-loader-4' />
                                    <rect className='sp-loader-5' />
                                    <rect className='sp-loader-6' />
                                    <rect className='sp-loader-7' />
                                    <rect className='sp-loader-8' />
                                    <rect className='sp-loader-9' />
                                    <rect className='sp-loader-10' />
                                    <rect className='sp-loader-11' />
                                    <rect className='sp-loader-12' />
                                    <rect className='sp-loader-13' />
                                    <rect className='sp-loader-14' />
                                </ContentLoader>
                            </div>
                        </div>
                    </div>

                    <LoginForm
                        visible={(this.state.showStartSessionPopup || this.shouldShowLoader()) && !this.state.showBatchSessionLoading}
                        closeLoginPopup={this.closeStartSessionPopup}
                        heading='MENTOR LOGIN'
                        onSubmit={(email, password) => this.handleLogin(email, password)}
                        showLoader={this.shouldShowLoader()}
                        style={{ zIndex: 99999 }}
                    />
                    <ContactSchoolAdminPopup
                        visible={this.state.showContactSchoolPopup || this.state.showBatchPopup}
                        closeSchoolAdminPopup={() => this.setState({ showContactSchoolPopup: false, showBatchPopup: false })}
                        loggedInUser={this.props.loggedInUser}
                        schoolInfo={this.props.schoolInfo}
                        isBatchPopup={this.state.showBatchPopup}
                        studentProfile={this.props.studentProfile}
                    />
                </>
            )
        }
        return (
            <>
                <ReactTooltip
                    id='videoBtn'
                    place='top'
                    effect='float'
                    multiline={false}
                    className={cx('photon-input-tooltip', 'cn-tooltip')}
                    arrowColor='#00ADE6'
                    textColor='rgba(0, 0, 0, 0.8)'
                />
                <div className={cx('sp-current-component-bg', (breakPoint && !shouldReschedule) && 'disabled')}>
                    <NewSessionCard
                        i={i}
                        goToInSession={this.props.goToInSession}
                        sessionStatus={this.props.sessionStatus}
                        batchSessionId={batchSessionId}
                        studentProfileId={studentProfileId}
                        topicTitle={topicTitle}
                        topicId={topicId}
                        topicDescription={topicDescription}
                        topicThumbnailSmall={topicThumbnailSmall}
                        course={this.getCourseDetailsOfBookedSession(
                            get(thisSession, 'course.id'),
                            this.props.courses
                        )}
                        thisRef={this} />
                </div>
                {/* } */}

                <LoginForm
                    visible={(this.state.showStartSessionPopup || this.shouldShowLoader()) && !this.state.showBatchSessionLoading}
                    closeLoginPopup={this.closeStartSessionPopup}
                    heading='MENTOR LOGIN'
                    onSubmit={(email, password) => this.handleLogin(email, password)}
                    showLoader={this.shouldShowLoader()}
                    style={{ zIndex: 99999 }}
                />
                <ContactSchoolAdminPopup
                    visible={this.state.showContactSchoolPopup || this.state.showBatchPopup}
                    closeSchoolAdminPopup={() => this.setState({ showContactSchoolPopup: false, showBatchPopup: false })}
                    loggedInUser={this.props.loggedInUser}
                    schoolInfo={this.props.schoolInfo}
                    isBatchPopup={this.state.showBatchPopup}
                    studentProfile={this.props.studentProfile}
                />
            </>
        )

    }
}


BookSession.defaultProps = {
    nextBookSession: []
}

export default BookSession



