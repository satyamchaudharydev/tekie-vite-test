import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { get, sortBy } from 'lodash'
import queryString from 'query-string'
import gql from 'graphql-tag'
import moment from 'moment'
import timezone from 'countries-and-timezones'
import SessionCoursePage from './SessionCoursePage'
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'
import fetchAvailableSlots from '../../queries/sessions/fetchAvailableSlots'
import getSlotLabel from '../../utils/slots/slot-label'
import formatDate from '../../utils/date-utils/formateDate'
import { getSelectiveSlotNames } from '../../utils/slots/slot-names'
import addMenteeSession from '../../queries/sessions/addMenteeSession'
import { getToasterBasedOnType } from '../../components/Toaster'
import duck from '../../duck'
import updateMenteeSession from '../../queries/sessions/updateMenteeSession'
import fetchMenteeSession from '../../queries/sessions/fetchMenteeSession'
import deleteMenteeSession from '../../queries/sessions/deleteMenteeSession'
import { sort } from '../../utils/immutable'
import config, { NPS_INTERVAL } from "../../config"
import { filterKey, getDataFromLocalStorage } from '../../utils/data-utils'
import offsetDate from '../../utils/date-utils/date-offset'
import updateSignupBonusNotification from '../../queries/updateSignupBonusNotification'
import { SessionCancelGA, BuyNowGA } from '../../utils/analytics/ga'
import withArrowScroll from '../../components/withArrowScroll'
import fetchBookSessionInfo from '../../queries/sessions/fetchBookSessionInfo'
import fetchMentorSession from '../../queries/sessions/fetchMentorSession'
import requestToGraphql from '../../utils/requestToGraphql'
import getIntlDateTime from '../../utils/time-zone-diff'
import { updateUserDetails } from '../../queries/updateUserDetails'
import addMentorMenteeSession from '../../queries/sessions/addMentorMenteeSession'
import fetchStudentCurrentStatus from '../../queries/fetchStudentCurrentStatus'
import renderChats from '../../utils/getChatTags'
import '../../scss/photon.scss'
import getCourseId from '../../utils/getCourseId'
import fetchUserCourses from '../../queries/sessions/fetchUserCourses'
import fetchMentorMenteeSession from '../../queries/sessions/fetchMentorMenteeSessionFromMenteeSession'
import { List } from 'immutable'
import { checkIfEmbedEnabled } from '../../utils/teacherApp/checkForEmbed'
import TekieLoader from '../../components/Loading/TekieLoader'
import { getActiveBatchDetail } from '../../utils/multipleBatch-utils'
import getMe from '../../utils/getMe'

const successToasterProps = {
    type: 'success',
    message: 'Slot booked successfully!'
}

const failureToasterProps = {
    type: 'error',
    message: 'Something went wrong!'
}

const sessionUpdationSuccessProps = {
    type: 'success',
    message: 'Slot rescheduled!'
}

const somethingWentWrongProps = {
    type: 'error',
    message: 'Sorry, something went wrong.'
}

const deleteSuccessProps = {
    type: 'success',
    message: 'Session canceled!'
}

class Sessions extends Component {
    constructor(props) {
        super(props);
        const defaultTimezone = ''
        this.bookSessionRef = React.createRef()
        this.state = {
            showBookSessionModal: false,
            showEditSessionModal: false,
            topicDetails: {},
            selectedDate: new Date(),
            defaultDate: new Date(),
            topicIdToBook: '',
            sessionIdToEdit: '',
            courseId: '',
            currentTopicDetails: {},
            showCancelPopup: false,
            deleteTopicId: '',
            showPaymentModal: false,
            showPaymentSuccessModal: false,
            showPaymentFailureModal: false,
            courseTitle: '',
            lastSessionDate: null,
            welcomeCreditsVisible: false,
            mentorFeedbackVisible: true,
            showPaymentProductModal: false,
            currTopicOrder: 1,
            assignedMentorId: '',
            isEditing: false,  // This variable helps differentiate between session editing and booking action.
            calendarStartDate: new Date(),
            bookingDetails: {},
            showOtpValdationPopup: false,
            otpLoading: false,
            validatingOtp: false,
            width: window.innerWidth,
            intlAvailableSlotsObj: {},
            selectedTimezone: defaultTimezone,
            selectedMentorSessionId: '',
            mentorMenteeSessionIdArr: [],
            pageLoading: [],
            npsVisible: false,
            showFlashMessage: false,
            showBookingConfirm: false,
            bookingConfirmDetails: null,
            coursePackageFetched: false,
            loadingNavigation: false,
            classroomId: ''
        }
    }

    closeSessionPopup = () => {
        const defaultTimezone = localStorage.getItem('timezone') && localStorage.getItem('timezone') !== null && localStorage.getItem('timezone').length
            ? localStorage.getItem('timezone')
            : moment.tz.guess()
        if (this.state.showBookSessionModal) {
            if (get(this.props, 'match.path') === '/sessions/book') {
                this.props.history.push('/sessions')
            }
            this.setState({
                showBookSessionModal: false,
                topicDetails: {},
                defaultDate: new Date().toISOString(),
                // selectedDate: new Date(),
                selectedTimezone: defaultTimezone,
                mentorMenteeSessionIdArr: []
            })
        } else if (this.state.showEditSessionModal) {
            this.setState({
                showEditSessionModal: false,
                topicDetails: {},
                defaultDate: new Date().toISOString(),
                // selectedDate: new Date(),
                isEditing: false,
                selectedTimezone: defaultTimezone,
                mentorMenteeSessionIdArr: []
            })
        }
    }

    componentWillUnmount = () => {
        if (window && window.fcWidget) {
            window.fcWidget.setFaqTags({
                tags: ['unregistered'],
                filterType: 'article'
            })
            window.fcWidget.hide()
        }
        this.cancelNps()
    }

    handleCancel = (topicId) => {
        this.setState({
            showCancelPopup: true,
            deleteTopicId: topicId
        })
    }
    handleFlash = () => {
        this.setState({
            showFlashMessage: true,
        })
        setTimeout(() => this.setState({
            showFlashMessage: false,
        }), 1000)
    }

    closeOverlay = () => {
        this.setState({
            showCancelPopup: false
        })
    }

    toggleBookSessionPopupState = (topicId, topicTitle, topicOrder) => {
        const { loggedInUser } = this.props
        const sortedTopics = this.props.topic && (sort.ascend(this.props.topic, ['order'])).toJS()
        const firstTopicId = sortedTopics[0] && sortedTopics[0].id
        if (topicId !== firstTopicId) {
            fetchBookSessionInfo(loggedInUser && loggedInUser.toJS().id, true).call()
            // fetchMentorMenteeSession(null, null,
            //     loggedInUser && loggedInUser.toJS().id, 'menteeFilter', 'withMenteeToken', true).call()
            if (topicId && topicTitle) {
                this.setState({
                    topicDetails: {
                        id: topicId,
                        title: topicTitle,
                        order: topicOrder
                    }
                })
            }
        } else {
            if (topicId && topicTitle) {
                this.setState({
                    topicDetails: {
                        id: topicId,
                        title: topicTitle,
                        order: topicOrder
                    },
                    showBookSessionModal: true
                })
            }
        }

    }

    toggleEditSessionPopup = (sessionId, topicId, topicTitle, bookingDate, slotTime, topicOrder, intlBookingDate) => {
        const { loggedInUser } = this.props
        const { selectedTimezone } = this.state
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        const userId = loggedInUser.getIn(['id'])
        if (topicId !== this.getFirstTopicId()) {
            fetchBookSessionInfo(userId, true).call()
        } else {
            this.setState({
                showEditSessionModal: true,
                calendarStartDate: new Date()
            })
        }
        const date = country !== 'india'
            ? intlBookingDate
            : bookingDate
        this.setState({
            topicDetails: {
                sessionId,
                id: topicId,
                topicTitle,
                // bookingDate: date,
                slotTime,
                topicOrder,
                istBookingDate: bookingDate,
                intlBookingDate: date
            },
            currentTopicDetails: {
                bookingDate: date,
                slotTime,
                istBookingDate: bookingDate,
                intlBookingDate: date
            },
            isEditing: true,
            defaultDate: new Date(date),
            selectedDate: new Date(date),
            topicIdToBook: topicId
        }, () => fetchMenteeSession(userId, null, null, topicId, true, true).call())
    }

    getNextBookingSessionDetails = (session) => {
        let name, id, order = ''
        if (this.state.topicDetails.id && this.state.topicDetails.topicTitle) {
            name = this.state.topicDetails.topicTitle
            id = this.state.topicDetails.id
            order = this.state.topicDetails.topicOrder
        } else if (session) {
            name = session.topicTitle
            id = session.topicId
            order = get(session, 'order')
        }
        return {
            name,
            id,
            order
        }
    }

    setLoadingFalse() {
        let pageLoading = this.state.pageLoading
        for (let i = 0; i < pageLoading.length; i++) {
            if (pageLoading[i]) {
                pageLoading[i] = false
                this.setState({ pageLoading: pageLoading })
                return;
            }
        }
    }
    isNpsAddedForSession = async (menteeId, batchId, topicId) => {
        if (menteeId) {
            const res = await requestToGraphql(gql`{
                netPromoterScores(
                  filter: { mentorMenteeSession_some: { menteeSession_some: { id: "${menteeId}" } } }
                ) {
                  id
                }
              }
            `)
            return !(get(res, 'data.netPromoterScores', []).length > 0)
        }
        else if (batchId && topicId) {
            const res = await requestToGraphql(gql`{
                netPromoterScores(
                    filter: {
                    batchSession_some: {
                        and: [
                        { batch_some: { id: "${batchId}" } }
                        { topic_some: { id: "${topicId}" } }
                        ]
                    }
                    }
                ) {
                    id
                }
              }
            `)
            return !(get(res, 'data.netPromoterScores', []).length > 0)
        }
        return false
    }

    getBatchDetailsOfLoggedInStudent = (loggedInStudentId, allChildren) => {
        if (allChildren && loggedInStudentId) {
            const student = allChildren.find(child => get(child, 'id') === loggedInStudentId)
            return student ? get(student, 'batch') : null
        }
        return null
    }

    sessionOnMount = async () => {
        const { product, match: { path }, loggedInUser, currentCourse } = this.props
        if (
            this.props.menteeCourseSyllabus &&
            this.props.menteeCourseSyllabus.toJS &&
            get(this.props.menteeCourseSyllabus.toJS(), '0')
        ) {
            const courseId = get(this.props.menteeCourseSyllabus.toJS()[0], 'courseId')
            if (getCourseId() === courseId) {
                this.setLoadingFalse()
            }
        } else {
            this.setState({ pageLoading: [...this.state.pageLoading, true] })
        }

        this.setState({ npsVisible: false }, () => {
            if (window.fcWidget) {
                window.fcWidget.show()
            }
        })
        const activeClassroom = getDataFromLocalStorage('activeClassroom') || ''
        this.setState({ courseId: getCourseId(), classroomId: activeClassroom })
        // fetchUserCourses(this.props.loggedInUser.get('id')).call()
        const hasCurrentCourseFetched = currentCourse && currentCourse.getIn([0, 'id'])
        // fetchSessionHomepageTopics(config.MENTEE, true).call()
        const { studentProfile } = this.props
        const batchDetail = getActiveBatchDetail(studentProfile && get(studentProfile.toJS(), '[0].batch'))
        await fetchMenteeCourseSyllabus()
            .then(() => {
                this.setLoadingFalse()
                const sessions = this.props.menteeCourseSyllabus.toJS()[0]
                const { completedSessions, nextSessionToShow } = this.getSessions(sessions)
                const menteeId = get(completedSessions[completedSessions.length - 1], 'menteeSessionId')
                const topicId = get(completedSessions[completedSessions.length - 1], 'topicId')
                const batchId = get(batchDetail, 'id');
                if (completedSessions && completedSessions.length === 1) {
                    if (menteeId) {
                        fetchMentorMenteeSession(menteeId).call()
                    }

                    // this.isNpsAddedForSession(menteeId, batchId, topicId).then(res=>{
                    //     if (res) {
                    //         // if (menteeId) {
                    //         //     if (!this.checkIfCourseCompleted(sessions)) {
                    //         //         if (nextSessionToShow && nextSessionToShow.i === 2) {
                    //         //             this.visibleNps()
                    //         //         }
                    //         //     }
                    //         // } else if (batchId && topicId ) {
                    //         //     this.visibleNps()
                    //         // }
                    //         this.visibleNps()
                    //     }
                    // })
                }
                else if (completedSessions && completedSessions.length > 0 && completedSessions.length % NPS_INTERVAL === 0 && completedSessions.length !== sessions.topicsCount) {
                    if (menteeId) {
                        fetchMentorMenteeSession(menteeId).call()
                    }
                    this.isNpsAddedForSession(menteeId, batchId, topicId).then(res => {
                        if (res) {
                            this.visibleNps()
                        }
                    })
                }
                else if (completedSessions && completedSessions.length === sessions.topicsCount) {
                    if (menteeId) {
                        fetchMentorMenteeSession(menteeId).call()
                    }
                    //    this.isNpsAddedForSession(menteeId, batchId, topicId).then(res=>{
                    //        if (res) {
                    //            this.visibleNps()
                    //        }
                    //    })
                }
            })
            .catch(() => this.setLoadingFalse())
        // fetchCourseDetails(getCourseId()).call()
        if (!hasCurrentCourseFetched) {
            // this.cancelNps() 
            // await fetchBatchDetails(this.props.loggedInUser.get('id')).call()
        } else {
            // fetchBatchDetails(this.props.loggedInUser.get('id')).call()
        }
        if (this.props.isLoggedIn) {
            // fetchSessionHomepage(
            //   config.MENTEE,
            //   this.props.loggedInUser.get('id'),
            //   moment(new Date().setHours(0, 0, 0, 0)).format('YYYY/MM/DD'),
            //   moment(offsetDate(new Date(), 6, 'ADD').setHours(0, 0, 0, 0)).format('YYYY/MM/DD'),
            //   true
            // ).call()
        }
        fetchUserCourses(this.props.loggedInUser.get('id'), false, true).call()
        // fetchStudentCurrentStatus(this.props.userId)
        if (path === '/sessions/book') {
            this.setState({
                showBookSessionModal: true
            })
        }

        // fetchAvailableSlots(this.props.loggedInUser.get('id'), true).call()
        // fetchTopics().call()
        // fetchNetPromoterScore(this.props.loggedInUser.get('id')).call()
        // await fetchProducts(config.MENTEE).call()
        const productInfo = product && product.toJS() && product.toJS().length && product.toJS()[0]
        // await fetchMentorMenteeSession()
        this.setState({
            courseTitle: productInfo.title,
        })

        const pathname = this.props.location && this.props.location.pathname
        if (!this.state.showPaymentModal && pathname === '/checkout') {
            BuyNowGA("Buy Now Popup Open")
            this.setState({
                showPaymentModal: true,
            })
        }
        const showPaymentSuccessPopup = localStorage.getItem('showPaymentSuccessPopup')
        const showPaymentFailurePopup = localStorage.getItem('showPaymentFailurePopup')
        if (showPaymentSuccessPopup === "show") {
            this.setState({
                showPaymentSuccessModal: true
            })
        }
        if (showPaymentFailurePopup === "show") {
            this.setState({
                showPaymentFailureModal: true
            })
        }
        localStorage.setItem('showPaymentSuccessPopup', false)
        localStorage.setItem('showPaymentFailurePopup', false)

        window.addEventListener('resize', () => {
            const { innerWidth } = window
            if (this.state.width !== innerWidth) {
                this.setState({
                    width: innerWidth
                })
            }
        })
        if (window && window.fcWidget) {
            window.fcWidget.show()
        }
        const coursePackageId = get(batchDetail, 'coursePackage.id')
        if (coursePackageId) {
            // await fetchCoursePackageDetails(coursePackageId, true).call()
            this.setState({ coursePackageFetched: true })
        } else {
            this.setState({ coursePackageFetched: true })
        }
    }

    switchToTeacherApp = () => {
        if (window !== undefined) {

            const user = filterKey(window && window.store.getState().data.getIn(['user', 'data']), 'loggedinUser') || List([])
            // window.store.dispatch({ type: 'LOGOUT' })

            const loginData = get(user.toJS()[0], 'rawData')
            const { ...parent } = loginData
            duck.merge(() => ({
                user: {
                    ...parent,
                    schoolTeacher: parent,
                    rawData: parent,
                    routedFromTeacherApp: false
                },
                userParent: parent

            }),

                {
                    key: 'loggedinUser'
                }
            )
            this.props.history.push('/teacher/classrooms')
        }
    }

    async componentDidMount() {
        let isLeadLogin = localStorage.getItem('isLeadLogin')
        if (isLeadLogin) {
            isLeadLogin = JSON.parse(isLeadLogin)
            if (isLeadLogin && localStorage.getItem('date')) {
                this.setState({
                    bookingConfirmDetails: {
                        sessionDate: localStorage.getItem('date'),
                    },
                    welcomeCreditsVisible: true,
                    showBookingConfirm: true
                })
            }
        }

        if (get(this.props.loggedInUser.toJS(), 'rawData.secondaryRole') === 'schoolTeacher' &&
            get(this.props.loggedInUser.toJS(), 'routedFromTeacherApp') && !checkIfEmbedEnabled()) {
            window.addEventListener("popstate", (e) => {
                this.switchToTeacherApp()
            });
        }
        this.sessionOnMount()
    }

    updateMenteeCourseSyllabusLocalState = (type) => {
        const { menteeCourseSyllabus, loggedInUser } = this.props
        const { selectedTimezone, bookingDetails } = this.state
        const country = loggedInUser && get(loggedInUser.toJS(), 'parent.country')
            ? get(loggedInUser.toJS(), 'parent.country')
            : 'india'
        const isTrialSession = this.isTrialSession()
        if (menteeCourseSyllabus.toJS()[0]) {
            const upcomingSessions = menteeCourseSyllabus.toJS()[0].upComingSession
            const bookedSessions = menteeCourseSyllabus.toJS()[0].bookedSession
            if (type === 'add') {
                upcomingSessions.forEach((session, index) => {
                    if (session.topicId === this.state.topicIdToBook) {
                        upcomingSessions.splice(index, index + 1)
                        const bookingDate = country !== 'india'
                            ? get(bookingDetails, 'istDate')
                            : new Date(this.state.topicDetails.bookingDate)
                        // bookingDate.setHours(0, 0, 0, 0)
                        session.bookingDate = bookingDate
                        session.slotTime = this.state.topicDetails.slotTime
                        bookedSessions.push(session)
                    }
                })
            } else if (type === 'update') {
                bookedSessions.forEach((session, index) => {
                    if (session.topicId === this.state.topicDetails.id) {
                        const updatedDate = country !== 'india'
                            ? get(bookingDetails, 'istDate')
                            : new Date(new Date(this.state.topicDetails.bookingDate).setHours(0, 0, 0, 0))
                        session.bookingDate = updatedDate
                        session.slotTime = this.state.topicDetails.slotTime
                        if (isTrialSession) {
                            session.mentor = null
                        }
                    }
                })
            } else if (type === 'delete') {
                bookedSessions.forEach((session, index) => {
                    if (session.topicId === this.state.currentTopicDetails.id) {
                        bookedSessions.splice(index, 1)
                        session.bookingDate = null
                        session.slotTime = null
                        if (isTrialSession) {
                            session.mentor = null
                        }
                        upcomingSessions.push(session)
                    }
                })
            }
            let menteeCourseSyllabusState = {
                upComingSession: upcomingSessions,
                bookedSession: bookedSessions,
            }
            if ((type === 'delete' || type === 'update') && isTrialSession) {
                menteeCourseSyllabusState.mentor = null
            }
            duck.merge(() => ({
                menteeCourseSyllabus: menteeCourseSyllabusState
            }))
        }
    }

    updateSelectedSlotsWithIntlTimingObj = () => {
        const { availableSlot, slotsOfAssignedMentor, loggedInUser } = this.props
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        let slots = []
        const intlAvailableSlotsObj = {}
        let dateKey

        if (get(this.state, 'topicDetails.id') !== this.getFirstTopicId() && this.props.assignedMentorId.length !== 0) {
            //For paid sessions with assigned mentor.
            if (slotsOfAssignedMentor) {
                slots = slotsOfAssignedMentor.toJS()
                dateKey = 'availabilityDate'
            }
        } else if (get(this.state, 'topicDetails.id') === this.getFirstTopicId() || this.props.assignedMentorId.length === 0) {
            //For paid sessions with assigned mentor.
            if (availableSlot) {
                slots = availableSlot.toJS()
                dateKey = 'date'
            }
        }

        const indianOffset = get(timezone.getTimezone('Asia/Kolkata'), 'dstOffset')
        const intlOffset = get(timezone.getTimezone(this.state.selectedTimezone), 'dstOffset')
        const timeDiffInMs = (indianOffset - intlOffset) * 60 * 1000
        if (slots && slots.length && country !== 'india') {
            slots.forEach(slot => {
                const dateInMs = moment(get(slot, `${dateKey}`)).tz('Asia/Kolkata').startOf('day').valueOf()
                const offsetedSelectedDateInMs = dateInMs - timeDiffInMs
                for (let i = 0; i < 24; i += 1) {
                    if (get(slot, `slot${i}`) >= 0 && get(slot, `slot${i}`) !== null) {
                        const dateAfterSlotOffset_ = moment(offsetedSelectedDateInMs + (i * 60 * 60 * 1000)).tz('Asia/Kolkata')
                        const dateAfterSlotOffsetZeroHours = moment(offsetedSelectedDateInMs + (i * 60 * 60 * 1000)).tz('Asia/Kolkata').startOf('day')
                        const formattedDateAfterOffset = dateAfterSlotOffsetZeroHours.format('DD/MM/YYYY')
                        const isOldSlot = formattedDateAfterOffset === moment().format('DD/MM/YYYY')
                            ? dateAfterSlotOffset_.hours() < new Date().getHours() ||
                            (
                                dateAfterSlotOffset_.hours() === new Date().getHours() &&
                                dateAfterSlotOffset_.minutes() <= new Date().getMinutes()
                            )
                            : false
                        if (!isOldSlot && config.slotsWindow.includes(dateAfterSlotOffset_.hours())) {
                            if (intlAvailableSlotsObj[formattedDateAfterOffset]) {
                                const currSlots = intlAvailableSlotsObj[formattedDateAfterOffset]
                                currSlots.push({
                                    id: i,
                                    label: dateAfterSlotOffset_.format('LT'),
                                    quantity: get(slot, `slot${i}`),
                                    status: false,
                                    date: get(slot, `${dateKey}`),
                                    intlId: dateAfterSlotOffset_.hours(),
                                    sessionId: get(slot, 'id')
                                })
                                currSlots.sort((a, b) => new Date(a[dateKey]).setHours(0, 0, 0, 0) - new Date(b[dateKey]).setHours(0, 0, 0, 0))
                                intlAvailableSlotsObj[formattedDateAfterOffset] = currSlots
                            } else {
                                intlAvailableSlotsObj[formattedDateAfterOffset] = [{
                                    id: i,
                                    label: dateAfterSlotOffset_.format('LT'),
                                    quantity: get(slot, `slot${i}`),
                                    status: false,
                                    date: get(slot, `${dateKey}`),
                                    intlId: dateAfterSlotOffset_.hours(),
                                    sessionId: get(slot, 'id')
                                }]
                            }
                        }
                    }
                }
            })
        }

        this.setState({
            intlAvailableSlotsObj
        })
    }

    addMentorMenteeSessionForBookedOrUpdatedSessions = () => {
        const { bookedMenteeSessions } = this.props
        //Adding mentor mentee session in case allotted mentor is present for paid sessions.
        const allottedMentorId = this.props.assignedMentorId && this.props.assignedMentorId.length
            ? this.props.assignedMentorId
            : this.props.salesOperation
                ? get(this.props.salesOperation.toJS(), '0.allottedMentor.id')
                : ''
        if (allottedMentorId && allottedMentorId.length && bookedMenteeSessions) {
            let bookedSessionId = ''
            bookedMenteeSessions.toJS().forEach(session => {
                if (get(session, 'topic.id') === this.state.topicIdToBook) {
                    bookedSessionId = get(session, 'id')
                }
            })

            addMentorMenteeSession(
                this.state.selectedMentorSessionId,
                this.getCurrentMenteeSessionId(),
                this.state.topicIdToBook,
                { sessionStatus: 'allotted' },
                true,
                `mentorMenteeSession/${bookedSessionId}/${this.state.selectedMentorSessionId}`
            ).call()
        }
    }

    getCurrentMenteeSessionId() {
        const addMenteeSession = this.props.addMenteeSession && this.props.addMenteeSession.toJS()
        if (addMenteeSession && addMenteeSession.length) {
            const menteeSession = addMenteeSession.find(session =>
                get(session, 'topic.id') === this.state.topicIdToBook
            )
            if (menteeSession) {
                return get(menteeSession, 'id')
            }
        }
        const sessions = get(this.props.menteeCourseSyllabus.toJS(), '[0]', {})
        const { nextSessionToShow } = this.getSessions(sessions)
        return get(nextSessionToShow, 'menteeSessionId')
    }



    async componentDidUpdate(prevProps, prevState) {
        const { match: { path },
            history, loggedInUser,
            isLoggedIn, studentCurrentStatus,
            loggedInUserChat,
            studentProfile,
            hasNPSFetched,
            homedata
        } = this.props
        if (window && window.fcWidget) {
            window.fcWidget.on("widget:opened", () => {
                renderChats({
                    isLoggedIn,
                    studentCurrentStatus,
                    loggedInUser: loggedInUserChat,
                    studentProfile
                })
            })
        }
        if (path === '/sessions/book' && !this.state.showBookSessionModal) {
            this.setState({
                showBookSessionModal: true
            })
        }
        // if (hasNPSFetched) {
        //     this.cancelNps()
        // }
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        const userId = this.props.loggedInUser && this.props.loggedInUser.toJS().id
        const bookSlotStatus = this.props.externalAddMenteeSessionStatus.toJS().addMenteeSession
        const prevBookSlotStatus = prevProps.externalAddMenteeSessionStatus.toJS().addMenteeSession
        const activeClassroomFromLocalStore = getDataFromLocalStorage('activeClassroom')
        const { classroomId } = this.state;
        if ((getCourseId() && this.state.courseId && getCourseId() !== this.state.courseId)
            || (activeClassroomFromLocalStore && classroomId && activeClassroomFromLocalStore !== classroomId)) {
            this.sessionOnMount()
        }

        if (bookSlotStatus) {
            if (bookSlotStatus.success && bookSlotStatus.success !== prevBookSlotStatus.success) {
                getToasterBasedOnType(successToasterProps)
                fetchStudentCurrentStatus(userId)
                this.cancelNps()
                if (get(this.props, 'match.path') === '/sessions/book') {
                    history.push('/sessions')
                }
                this.setState({
                    showBookSessionModal: false,
                    showOtpValdationPopup: false,
                    // selectedDate: new Date(),
                })
                this.updateMenteeCourseSyllabusLocalState('add')
                fetchAvailableSlots(true)
                const menteeId = loggedInUser ? get(loggedInUser.toJS(), 'id') : ''
                if (country !== 'india' && localStorage.getItem('timezone') !== this.state.selectedTimezone) {
                    updateUserDetails({ timezone: this.state.selectedTimezone }, menteeId, 'updateTimezone')
                }
                this.addMentorMenteeSessionForBookedOrUpdatedSessions()
            }
            if (bookSlotStatus.failure && bookSlotStatus.failure !== prevBookSlotStatus.failure) {
                getToasterBasedOnType(failureToasterProps)
            }
        }
        if (this.props.menteeSessionFetchStatus && prevProps.menteeSessionFetchStatus) {
            const currStatus = this.props.menteeSessionFetchStatus.getIn(['success'])
            const prevStatus = prevProps.menteeSessionFetchStatus.getIn(['success'])
            const sessionId = this.props.menteeSession.getIn([0, 'id'])
            const mentorMenteeSession = filterKey(this.props.mentorMenteeSession, 'menteeSession')
            let mentorMenteeSessionIdArr = []
            if (mentorMenteeSession && mentorMenteeSession.toJS()) {
                mentorMenteeSession.toJS().forEach(session => {
                    if (get(session, 'menteeSession.id') === sessionId) {
                        mentorMenteeSessionIdArr.push(get(session, 'id'))
                    }
                })
            }
            if (currStatus !== prevStatus && currStatus) {
                this.setState({
                    sessionIdToEdit: sessionId,
                    mentorMenteeSessionIdArr,
                })
                if (this.state.currentTopicDetails.activity === 'delete') {
                    deleteMenteeSession(sessionId, mentorMenteeSessionIdArr).call()
                }
            }
        }
        if (this.props.externalUpdateMenteeSessionStatus && prevProps.externalUpdateMenteeSessionStatus) {
            const currStatus = this.props.externalUpdateMenteeSessionStatus.getIn(['addMenteeSession'])
            const prevStatus = prevProps.externalUpdateMenteeSessionStatus.getIn(['addMenteeSession'])
            if (currStatus && prevStatus) {
                if (currStatus.getIn(['success']) !== prevStatus.getIn(['success']) && currStatus.getIn(['success'])) {
                    getToasterBasedOnType(sessionUpdationSuccessProps)

                    this.updateMenteeCourseSyllabusLocalState('update')
                    this.setState({
                        showEditSessionModal: false,
                        isEditing: false
                    })
                    fetchAvailableSlots(this.props.loggedInUser && this.props.loggedInUser.get('id'), true)
                    const menteeId = loggedInUser ? get(loggedInUser.toJS(), 'id') : ''
                    if (country !== 'india' && localStorage.getItem('timezone') !== this.state.selectedTimezone) {
                        updateUserDetails({ timezone: this.state.selectedTimezone }, menteeId, 'updateTimezone')
                    }
                    if (!this.isTrialSession()) {
                        this.addMentorMenteeSessionForBookedOrUpdatedSessions()
                    }
                    await fetchStudentCurrentStatus(userId)
                } else if (currStatus.getIn(['failure']) !== prevStatus.getIn(['failure']) && currStatus.getIn(['failure'])) {
                    getToasterBasedOnType(somethingWentWrongProps)
                }
            }
        }
        if (
            (this.props.sessionHomepageStatus && this.props.sessionHomepageStatus.get('success')) &&
            (prevProps.sessionHomepageStatus && !prevProps.sessionHomepageStatus.get('success'))
        ) {
            const params = queryString.parse(window.location.search)
            if (get(params, 'book-session') === "true") {
                this.setState({ showBookSessionModal: true })
            }
            if (this.props.user.getIn([0, 'verificationStatus'])) {
                setTimeout(
                    () => this.setState({
                        showBookingConfirm: false,
                        bookingConfirmDetails: null,
                        welcomeCreditsVisible: false
                    }), 12000
                )
            }
            let isLeadLogin = localStorage.getItem('isLeadLogin')
            if (isLeadLogin && this.props.loggedInUser.get('id')) {
                isLeadLogin = JSON.parse(isLeadLogin)
                requestToGraphql(gql`{
                    users(filter: { id: "${this.props.loggedInUser.get('id')}" }) {
                        verificationStatus
                    }
                    }
                    `).then(res => {
                    if (get(res, 'data.users[0].verificationStatus') !== 'verified') {
                        updateSignupBonusNotification(this.props.loggedInUser.get('id'), isLeadLogin).call()
                        if (isLeadLogin) {
                            localStorage.removeItem('isLeadLogin')
                            localStorage.removeItem('date')
                        }
                    }
                })
            }
            this.updateSelectedSlotsWithIntlTimingObj()
        }
        if (
            (this.props.userSignUpBonusStatus && this.props.userSignUpBonusStatus.getIn(['success'])) &&
            (prevProps.userSignUpBonusStatus && !prevProps.userSignUpBonusStatus.getIn(['success']))
        ) {
            if (this.state.welcomeCreditsVisible) {
                setTimeout(
                    () => this.setState({
                        welcomeCreditsVisible: false,
                    }), 2500
                )
            }
        }

        if (this.props.menteeSessionDeleteStatus && prevProps.menteeSessionDeleteStatus) {
            const currStatus = this.props.menteeSessionDeleteStatus
            const prevStatus = prevProps.menteeSessionDeleteStatus
            if (currStatus.getIn(['success']) !== prevStatus.getIn(['success']) &&
                currStatus.getIn(['success'])) {
                this.setState({
                    showCancelPopup: false,
                    currentTopicDetails: {
                        id: get(this.state.currentTopicDetails, 'id', '')
                    },
                })
                getToasterBasedOnType(deleteSuccessProps)
                this.updateMenteeCourseSyllabusLocalState('delete')
                fetchAvailableSlots(this.props.loggedInUser && this.props.loggedInUser.get('id'), true)
                fetchStudentCurrentStatus(userId)
            } else if (currStatus.getIn(['failure']) !== prevStatus.getIn(['failure']) &&
                currStatus.getIn(['failure'])) {
                getToasterBasedOnType(somethingWentWrongProps)
            }
        }
        if (this.props.bookSessionInfoFetchStatus && prevProps.bookSessionInfoFetchStatus) {
            const currStatus = this.props.bookSessionInfoFetchStatus.getIn(['success'])
            const prevStatus = prevProps.bookSessionInfoFetchStatus.getIn(['success'])
            if (currStatus && !prevStatus) {
                const { salesOperation } = this.props
                const { assignedMentorId } = this.props
                if (assignedMentorId) {
                    this.setState({
                        assignedMentorId
                    })
                    const { loggedInUser } = this.props
                    const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
                    if (
                        this.state.isEditing &&
                        new Date(this.state.topicDetails.bookingDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
                    ) {
                        fetchMentorSession(assignedMentorId, offsetDate(
                            new Date(this.state.topicDetails.bookingDate), 1, 'SUBTRACT'
                        ), '', 'onlyId', true).call()
                    } else {
                        fetchMentorSession(assignedMentorId, offsetDate(
                            new Date(), 1, 'SUBTRACT'
                        ), '', 'onlyId', true).call()
                    }
                } else {
                    this.setState({
                        assignedMentorId: ''
                    })
                }
                const currDate = new Date()
                const country = this.props.loggedInUser
                    ? get(this.props.loggedInUser.toJS(), 'parent.country')
                    : 'india'
                const session = this.props.mentorMenteeSession && filterKey(this.props.mentorMenteeSession, `bookSessionInfo/${userId}`)
                const currTopicOrder = get(this.state.topicDetails, 'topicOrder')
                const configTimeKeys = Object.keys(config.daysBeforeNextSessionObj)
                let daysOffset = 7
                configTimeKeys.forEach(key => {
                    if (config.daysBeforeNextSessionObj[key] && config.daysBeforeNextSessionObj[key].includes(currTopicOrder)) {
                        daysOffset = key
                    }
                })
                let date = new Date()
                if (session) {
                    const sortedSession = session && sortBy(session.toJS(), 'order')
                    for (let i = sortedSession.length - 1; i >= 0; i -= 1) {
                        if (get(sortedSession[i], 'sessionStatus') === 'completed') {
                            date = sortedSession && get(sortedSession[i], 'sessionStartDate')
                            break
                        }
                    }
                }
                if (country !== 'india') {
                    date = getIntlDateTime(new Date(date), 0, moment.tz.guess()).intlDateObj
                }
                let dateAfterOffset = offsetDate(new Date(new Date(date).setHours(0, 0, 0, 0)), daysOffset, 'ADD')
                this.setState({
                    lastSessionDate: new Date(new Date(date).setHours(0, 0, 0, 0)),
                    currTopicOrder
                })
                if (this.state.isEditing) {
                    const shouldOffset =
                        dateAfterOffset.setHours(0, 0, 0, 0) >= currDate.setHours(0, 0, 0, 0) &&
                        dateAfterOffset.setHours(0, 0, 0, 0) <= new Date(this.state.topicDetails.bookingDate).setHours(0, 0, 0, 0)
                    this.setState({
                        showEditSessionModal: true,
                        calendarStartDate: shouldOffset ? dateAfterOffset : currDate,
                        defaultDate: new Date(this.state.topicDetails.bookingDate)
                    })
                } else {
                    this.setState({
                        showBookSessionModal: true,
                        // selectedDate: dateAfterOffset.setHours(0, 0, 0, 0) > currDate.setHours(0, 0, 0, 0) ? dateAfterOffset : currDate,
                        defaultDate: dateAfterOffset.setHours(0, 0, 0, 0) > currDate.setHours(0, 0, 0, 0) ? dateAfterOffset : currDate,
                    })
                }
            }
        }

        if (this.props.slotsOfAssignedMentorFetchStatus && prevProps.slotsOfAssignedMentorFetchStatus) {
            const currStatus = this.props.slotsOfAssignedMentorFetchStatus.getIn(['success'])
            const prevStatus = prevProps.slotsOfAssignedMentorFetchStatus.getIn(['success'])
            if (currStatus && !prevStatus) {
                this.updateSelectedSlotsWithIntlTimingObj()
            }
        }
    }

    shouldShowLoader = () => {
        const bookSlotStatus = this.props.externalAddMenteeSessionStatus.getIn(['addMenteeSession', 'loading'])
        const editingSlotStatus = this.props.externalUpdateMenteeSessionStatus.getIn(['addMenteeSession', 'loading'])
        return bookSlotStatus || editingSlotStatus
    }

    shouldShowDeleteLoader = () => {
        const { menteeSessionDeleteStatus, menteeSessionFetchStatus } = this.props
        return (
            (menteeSessionFetchStatus && menteeSessionFetchStatus.getIn(['loading'])) ||
            (menteeSessionDeleteStatus && menteeSessionDeleteStatus.getIn(['loading']))
        )
    }

    cancelNps = () => {
        this.setState({
            npsVisible: false
        }, () => {
            if (window.fcWidget) {
                window.fcWidget.show()
            }
        })

    }
    visibleNps = () => {
        this.setState({
            npsVisible: true
        }, () => {
            if (window.fcWidget) {
                window.fcWidget.hide()
            }
        })

    }

    sortAscending = (data, path) => {
        return data.sort((a, b) => {
            return a[path] - b[path]
        })
    }

    getSessions = (sessions) => {
        const viewContentBasedOnCurrentComponent = get(getMe().thisChild, 'studentProfile.batch.viewContentBasedOnCurrentComponent')
        let upComingSessions = []
        let notBookedSessions = []
        let firstComponent = {}
        let previousTopicObj = {}
        let completedSessions = []
        let allSessions = []
        if (sessions) {
            const upComingSession = sessions.upComingSession
                ? this.sortAscending(sessions.upComingSession, ['topicOrder']).filter(session => session.classType !== 'theory')
                : []
            const bookedSessions = sessions.bookedSession
                ? this.sortAscending(sessions.bookedSession, ['topicOrder']).filter(session => session.classType !== 'theory')
                : []
            completedSessions = sessions.completedSession
                ? this.sortAscending(sessions.completedSession, ['topicOrder']).filter(session => session.classType !== 'theory')
                : []
            firstComponent = sessions.firstComponent ? sessions.firstComponent : {}
            // new logic
            previousTopicObj = sessions.previousTopic ? sessions.previousTopic : {}

            if (viewContentBasedOnCurrentComponent && completedSessions && completedSessions.length > 0) {
                completedSessions = completedSessions.map(session => ({ ...session, sessionStatus: 'completed' }))
            }

            allSessions = [
                ...upComingSession,
                ...bookedSessions,
                ...completedSessions,
            ]
        }



        const sessionsList = allSessions
            ? this.sortAscending(allSessions, ['topicOrder'])
                .map((session, i) => ({ ...session, i: i + 1, type: session.sessionStatus }))
            : []

        let nextSessionToShow = {}
        if (sessionsList.length > 0) {
            nextSessionToShow = sessionsList[0]
        }
        for (let i = 0; i < sessionsList.length; i += 1) {
            if (sessionsList[i].type === 'started') {
                nextSessionToShow = sessionsList[i]
            } else if (sessionsList[i].type === 'completed') {
                nextSessionToShow = sessionsList[i + 1]
            }
        }
        return {
            firstComponent,
            previousTopicObj,
            upComingSessions,
            notBookedSessions,
            nextSessionToShow,
            completedSessions,
            allSessions: sessionsList,
            showBookOption: sessions && sessions.bookedSession.length ? false : true,
            showPurchaseOption: !get(nextSessionToShow, 'isAccessible')
        }
    }


    onDateChange = (date) => {
        this.setState({
            selectedDate: date
        })
    }

    getSessionsOnSelectedDate = (selectedDate, slots, dateKey) => {
        if (slots) {
            return slots.toJS().filter(function (slot) {
                return new Date(slot[dateKey]).setHours(0, 0, 0, 0) === new Date(selectedDate).setHours(0, 0, 0, 0)
            })
        }

        return []
    }

    addSelectedSlotTimeForEditingSession = (availableSlotLabels, extraSlot = null) => {
        const { selectedTimezone } = this.state
        const { loggedInUser } = this.props
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        let modifiedSlotLabels = []
        if (
            this.state.topicDetails.bookingDate &&
            formatDate(new Date(this.state.selectedDate)).date === formatDate(new Date(this.state.topicDetails.bookingDate)).date
        ) {
            let counter = 0, isOldSlotPresent = false
            for (let i = 0; i < availableSlotLabels.length; i += 1) {
                if (availableSlotLabels[i].id === this.state.topicDetails.slotTime) {
                    availableSlotLabels[i].status = true
                    availableSlotLabels[i].quantity = 1
                    counter = 1
                } else if (
                    availableSlotLabels[i].id === this.state.currentTopicDetails.slotTime &&
                    (
                        this.state.currentTopicDetails.bookingDate &&
                        new Date(this.state.selectedDate).setHours(0, 0, 0, 0) ===
                        new Date(this.state.currentTopicDetails.bookingDate).setHours(0, 0, 0, 0)
                    )
                ) {
                    availableSlotLabels[i].status = false
                    availableSlotLabels[i].quantity = 1
                    counter = 1
                }

                if (extraSlot && extraSlot !== null && availableSlotLabels[i].id === extraSlot) {
                    isOldSlotPresent = true
                }
            }
            if (counter === 0) {
                if (country !== 'india') {
                    availableSlotLabels.push({
                        id: this.state.topicDetails.slotTime,
                        label: getIntlDateTime(
                            this.state.topicDetails.istBookingDate,
                            this.state.topicDetails.slotTime,
                            selectedTimezone
                        ).intlTime,
                        status: true,
                        date: this.state.topicDetails.istBookingDate
                            ? new Date(this.state.topicDetails.istBookingDate).toISOString()
                            : new Date(),
                        intlId: getIntlDateTime(
                            this.state.topicDetails.istBookingDate,
                            this.state.topicDetails.slotTime,
                            selectedTimezone
                        ).intlSlot,
                        quantity: 1
                    })
                } else {
                    availableSlotLabels.push({
                        id: this.state.topicDetails.slotTime,
                        status: true,
                        label: getSlotLabel(this.state.topicDetails.slotTime).startTime
                    })
                }
            }
            if (!isOldSlotPresent && extraSlot && extraSlot !== null) {
                if (country !== 'india') {
                    availableSlotLabels.push({
                        id: this.state.topicDetails.slotTime,
                        label: getIntlDateTime(
                            this.state.topicDetails.istBookingDate,
                            this.state.topicDetails.slotTime,
                            selectedTimezone
                        ).intlTime,
                        status: false,
                        date: this.state.topicDetails.istBookingDate
                            ? new Date(this.state.topicDetails.istBookingDate).toISOString()
                            : new Date(),
                        intlId: getIntlDateTime(
                            this.state.topicDetails.istBookingDate,
                            this.state.topicDetails.slotTime,
                            selectedTimezone
                        ).intlSlot,
                        quantity: 1
                    })
                } else {
                    availableSlotLabels.push({
                        id: extraSlot,
                        status: false,
                        label: getSlotLabel(extraSlot).startTime,
                        quantity: 1
                    })
                }
            }
            if (country !== 'india') {
                modifiedSlotLabels = sortBy(availableSlotLabels, 'intlId')
            } else {
                modifiedSlotLabels = this.sortAscending(availableSlotLabels, ['id'])
            }
        }

        return modifiedSlotLabels.length > 0 ? modifiedSlotLabels : availableSlotLabels
    }

    getSlotTimeOnSelectedDate = (date = this.state.selectedDate) => {
        const { availableSlot, slotsOfAssignedMentor, loggedInUser } = this.props
        const { selectedTimezone } = this.state
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        let availableSlotLabels = []
        if (country === 'india') {
            let slotsOnSelectedDate
            // For paid sessions, fetching slots from assigned mentor sessions.
            if (get(this.state, 'topicDetails.id') !== this.getFirstTopicId()) {
                slotsOnSelectedDate = this.getSessionsOnSelectedDate(date, slotsOfAssignedMentor, 'availabilityDate')[0]
            }
            // For trial sessions and for paid sessions with no assigned mentors.
            if (this.props.assignedMentorId.length === 0 || get(this.state, 'topicDetails.id') === this.getFirstTopicId()) {
                slotsOnSelectedDate = this.getSessionsOnSelectedDate(date, availableSlot, 'date')[0]
            }
            if (slotsOnSelectedDate) {
                let isCurrentDate = 0
                if (formatDate(new Date(new Date(date).setHours(0, 0, 0, 0))).date ===
                    formatDate(new Date(new Date(new Date().setHours(0, 0, 0,)))).date)
                    isCurrentDate = 1
                // To check if the session is paid and a mentor has been assigned.
                const isMentorAllotted = this.props.assignedMentorId.length && get(this.state, 'topicDetails.id') !== this.getFirstTopicId()
                for (let i = 0; i < 24; i += 1) {
                    if (
                        slotsOnSelectedDate[`slot${i}`] !== null && slotsOnSelectedDate[`slot${i}`] >= 0 &&
                        config.slotsWindow.includes(i)
                    ) {
                        if ((!isCurrentDate || i > new Date().getHours()) && !isMentorAllotted) {
                            availableSlotLabels.push({
                                id: i,
                                status: false,
                                label: getSlotLabel(i).startTime,
                                quantity: slotsOnSelectedDate[`slot${i}`],
                                sessionId: get(slotsOnSelectedDate, 'id')
                            })
                        } else if ((!isCurrentDate || i > new Date().getHours()) && isMentorAllotted && slotsOnSelectedDate[`slot${i}`]) {
                            availableSlotLabels.push({
                                id: i,
                                status: false,
                                label: getSlotLabel(i).startTime,
                                quantity: 1,
                                sessionId: get(slotsOnSelectedDate, 'id')
                            })
                        }
                    }
                }
                availableSlotLabels = this.addSelectedSlotTimeForEditingSession(availableSlotLabels)
                if (this.state.currentTopicDetails.bookingDate &&
                    new Date(this.state.currentTopicDetails.bookingDate).setHours(0, 0, 0, 0) ===
                    new Date(date).setHours(0, 0, 0, 0)) {
                    availableSlotLabels = this.addSelectedSlotTimeForEditingSession(availableSlotLabels, this.state.currentTopicDetails.slotTime)
                }
            }
        } else {
            // For trial sessions and for paid sessions with no assigned mentors.
            const { intlAvailableSlotsObj } = this.state
            const formattedSelectedDate = moment(date).startOf('day').format('DD/MM/YYYY')
            availableSlotLabels = intlAvailableSlotsObj[formattedSelectedDate] || []
            availableSlotLabels = this.addSelectedSlotTimeForEditingSession(availableSlotLabels)
            if (
                this.state.currentTopicDetails.bookingDate &&
                new Date(this.state.currentTopicDetails.bookingDate).setHours(0, 0, 0, 0) ===
                new Date(date).setHours(0, 0, 0, 0)
            ) {
                availableSlotLabels = this.addSelectedSlotTimeForEditingSession(availableSlotLabels, this.state.currentTopicDetails.slotTime)
            }

            availableSlotLabels.sort((a, b) => new Date(a.date).setHours(0, 0, 0, 0) - new Date(b.date).setHours(0, 0, 0, 0))
        }
        return availableSlotLabels
    }

    updateSessionsDateTimeInState = (slot) => {
        const { loggedInUser } = this.props
        const { selectedTimezone } = this.state
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        let currentTopicDetails = this.state.topicDetails
        currentTopicDetails['slotTime'] = slot.id
        if (country !== 'india' && selectedTimezone !== 'Asia/Kolkata') {
            currentTopicDetails['bookingDate'] = get(slot, 'date')
        } else {
            currentTopicDetails['bookingDate'] = this.state.selectedDate
        }
        this.setState({
            topicDetails: currentTopicDetails
        })
    }

    getInput = (slotNumbersArray, date) => {
        const { loggedInUser } = this.props
        const { selectedTimezone } = this.state
        const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
        const slotNamesObj = getSelectiveSlotNames(slotNumbersArray).slotNameObj
        let input = {}
        let bookingDate
        if (country !== 'india' && selectedTimezone !== 'Asia/Kolkata') {
            bookingDate = new Date(date)
        } else {
            bookingDate = this.state.selectedDate
        }
        bookingDate.setHours(0)
        bookingDate.setMinutes(0)
        bookingDate.setSeconds(0)
        if (Object.keys(slotNamesObj).length) {
            input = {
                bookingDate: bookingDate,
                ...slotNamesObj,
                country
            }
        }

        return input
    }

    validateOtp = async (otp) => {
        const { loggedInUser, menteeCourseSyllabus } = this.props
        const { topicIdToBook, bookingDetails } = this.state
        const sessions = menteeCourseSyllabus && menteeCourseSyllabus.toJS()[0]
        if (sessions && loggedInUser) {
            const { nextSessionToShow } = this.getSessions(sessions)
            const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
            const input = {
                bookingDate: country !== 'india' && this.state.selectedTimezone !== 'Asia/Kolkata'
                    ? get(bookingDetails, 'istDate')
                    : get(bookingDetails, 'date'),
                [`slot${get(bookingDetails, 'time')}`]: true,
                country
            }
            try {
                this.setState({ validatingOtp: true })
                const res = await requestToGraphql(gql`
                  mutation {
                    validateUserOTP(input:{
                        phone:{
                          countryCode:"${get(loggedInUser.toJS(), 'parent.phone.countryCode')}"
                          number:"${get(loggedInUser.toJS(), 'parent.phone.number')}"
                        }
                        phoneOtp: ${otp}
                    }){
                        id
                    }
                }`, null, 'appTokenOnly')
                if (res) {
                    const result = get(res, 'data.validateUserOTP.id')
                    if (result === get(loggedInUser.toJS(), 'parent.id')) {
                        duck.merge(() => ({
                            user: {
                                ...(loggedInUser.toJS() || {}),
                                hasVerifiedOTP: true
                            },
                        }), { key: 'loggedinUser' })
                        addMenteeSession(
                            get(loggedInUser.toJS(), 'id'),
                            topicIdToBook,
                            input,
                            this.getNextBookingSessionDetails(nextSessionToShow).name
                        ).call()
                        if (import.meta.env.REACT_APP_NODE_ENV === 'production') {
                            var newElem = document.createElement("div");
                            newElem.innerHTML = `<img src="https://track.omguk.com/e/si/?APPID=${get(res, 'data.validateUserOTP.id')}&MID=2299448&PID=51777&Status=" style="display:none;" border="0" height="1" width="1">`
                            newElem.innerHTML += `<iframe src='https://tracking.icubeswire.co/aff_a?offer_id=2612&adv_sub1=${get(loggedInUser.toJS(), 'parent.id')}&adv_sub2=${get(loggedInUser.toJS(), 'parent.phone.countryCode')}${get(loggedInUser.toJS(), 'parent.phone.number')} width='1' height='1' id='pixelcodeurl' /></iframe>`
                            document.querySelector('#global-div').append(newElem)
                        }
                    }
                    this.setState({ validatingOtp: false })
                }
            } catch (e) {
                if (e.errors && e.errors[0]) {
                    getToasterBasedOnType({ type: 'error', message: e.errors[0].message })
                    this.setState({ validatingOtp: false })
                }
            }
        }
    }

    sendOtp = async () => {
        const { loggedInUser, history } = this.props
        if (loggedInUser) {
            try {
                this.setState({ otpLoading: true })
                const res = await requestToGraphql(gql`
                  mutation {
                    loginViaOtp(input: {
                      phone: {
                        countryCode: "${get(loggedInUser.toJS(), 'parent.phone.countryCode')}"
                        number: "${get(loggedInUser.toJS(), 'parent.phone.number')}"
                      }
                    }) {
                      result
                    }
                }`, null, 'appTokenOnly')
                if (res) {
                    if (get(this.props, 'match.path') === '/sessions/book') {
                        history.push('/sessions')
                    }
                    const result = get(res, 'data.loginViaOtp.result')
                    if (result) {
                        this.setState({
                            showBookSessionModal: false,
                            showOtpValdationPopup: true
                        })
                    }
                }
                this.setState({ otpLoading: false })
            } catch (e) {
                if (e.errors && e.errors[0]) {
                    if (this.prompt) {
                        getToasterBasedOnType({ type: 'error', message: e.errors[0].message })
                        this.setState({ otpLoading: false })
                    }
                }
            }
        }
    }

    bookSession = (slotsArray, topicId, bookingDetails, topicName) => {
        const { topic, loggedInUser } = this.props
        const country = loggedInUser && get(loggedInUser.toJS(), 'parent.country')
            ? get(loggedInUser.toJS(), 'parent.country')
            : 'india'
        this.setState({
            topicDetails: slotsArray
        })
        const user = this.props.loggedInUser.toJS()
        const slotNumbersArray = []
        const topics = topic && (sort.ascend(topic, ['order'])).toJS()
        let date
        slotsArray.forEach((slot) => {
            if (slot.status) {
                slotNumbersArray.push(slot.id)
                this.updateSessionsDateTimeInState(slot)
                date = get(slot, 'date')
            }
        })
        const input = this.getInput(slotNumbersArray, date)
        if (country !== 'india') {
            input.bookingDate = get(bookingDetails, 'istDate')
        }
        let selectedMentorSessionId = ''
        slotsArray.forEach(_s => {
            if (get(_s, 'status') === true) {
                selectedMentorSessionId = get(_s, 'sessionId')
            }
        })

        var newElem = document.createElement("div");
        newElem.innerHTML = `
            <img src=https://cost.affcost.com/pixel?adid=6142ce282c0da02d6c323fdd&sub1=${this.props.userId}>
          `
        document.querySelector('#global-div').append(newElem)

        this.setState({
            topicIdToBook: topicId,
            bookingDetails,
            selectedMentorSessionId
        })
        if (topics && get(topics, '0.id') === topicId && !get(loggedInUser.toJS(), 'hasVerifiedOTP')) {
            this.sendOtp()
        } else {
            addMenteeSession(user.id, topicId, input, topicName).call()
        }
    }

    editSession = (slotsArray, bookingDetails, topicName) => {
        const slotNumbersArray = []
        const { loggedInUser } = this.props
        const { selectedTimezone } = this.state
        this.setState({
            bookingDetails
        })
        const country = loggedInUser && get(loggedInUser.toJS(), 'parent.country')
            ? get(loggedInUser.toJS(), 'parent.country')
            : 'india'
        let date = this.state.selectedDate
        let selectedSlotId
        let selectedMentorSessionId = ''
        slotsArray.forEach((slot) => {
            if (slot.status) {
                slotNumbersArray.push(slot.id)
                this.updateSessionsDateTimeInState(slot)
                if (country !== 'india') {
                    date = get(slot, 'date')
                }
                selectedSlotId = get(slot, 'id')
                selectedMentorSessionId = get(slot, 'sessionId')
            }
        })
        this.setState({
            selectedMentorSessionId
        })
        const input = this.getInput(slotNumbersArray, date)
        if (country !== 'india') {
            input.bookingDate = get(bookingDetails, 'istDate')
        }
        if (
            new Date(date).setHours(0, 0, 0, 0) !== new Date(this.state.currentTopicDetails.istBookingDate).setHours(0, 0, 0, 0) ||
            selectedSlotId !== this.state.currentTopicDetails.slotTime
        ) {
            updateMenteeSession(this.getCurrentMenteeSessionId(), input, topicName, true, this.state.mentorMenteeSessionIdArr).call()
        } else {
            if (localStorage.getItem('timezone') !== this.state.selectedTimezone) {
                const { loggedInUser } = this.props
                const menteeId = loggedInUser ? get(loggedInUser.toJS(), 'id') : ''
                updateUserDetails({ timezone: this.state.selectedTimezone }, menteeId, 'updateTimezone')
            }
            this.setState({
                showEditSessionModal: false,
                isEditing: false
            }, () => {
                getToasterBasedOnType(sessionUpdationSuccessProps)
            })
        }
    }

    deleteSession = (id, topicName) => {
        const { loggedInUser } = this.props
        const userId = loggedInUser.getIn(['id'])
        const topicId = this.state.deleteTopicId
        fetchMenteeSession(userId, null, null, topicId, true, true).call()
        SessionCancelGA(topicName)
        this.setState({
            currentTopicDetails: {
                id: this.state.deleteTopicId,
                activity: 'delete'
            }
        })
    }

    isCoursePackageFetched = () => {
        const { coursePackages } = this.props
        return coursePackages && coursePackages.size > 0
    }

    isLoading = () => {
        const { menteeCourseSyllabusStatus, userBatchInfoStatus, currentCourse } = this.props

        if (this.state.loadingNavigation) {
            return true
        }

        const loggedInStudentId = get(JSON.parse(localStorage.getItem('data')), 'studentProfile.data[0].id')
        const isClassroomUser = get(this.getBatchDetailsOfLoggedInStudent(loggedInStudentId, this.props.loggedInUser.toJS() && get(this.props.loggedInUser.toJS(), 'parent.parentProfile.children')), 'documentType') === 'classroom'

        if (this.state.pageLoading.find(loading => loading === true)) {
            return true
        }

        return false
    }

    shouldShowBookingNotAllowedToaster = (upComingSessions, showBookOption) => {
        return (
            (upComingSessions && upComingSessions.length > 0) || !showBookOption
        )
    }

    handleRevisit = (topicId) => {
        this.props.history.push(`/revisit/sessions/video/${topicId}`, {
            revisitingSession: true
        })
    }

    getFirstTopicId = () => {
        const sortedTopic = this.props.topic && (sort.ascend(this.props.topic, ['order'])).toJS()
        return sortedTopic && sortedTopic[0] ? (sortedTopic[0]).id : ''
    }

    togglePaymentPopupState = () => {
        const pathname = this.props.location && this.props.location.pathname
        if (!this.state.showPaymentModal && pathname === '/sessions') {
            this.props.history.push(`/checkout`)
        }
        this.setState({
            showPaymentModal: !this.state.showPaymentModal,
        })
    }

    closePaymentPopupState = () => {
        this.props.history.push(`/sessions`)
        BuyNowGA("Buy Now Popup Close")
        this.setState({
            showPaymentModal: false,
        })
    }

    showPaymentPopupState = async (products, productName) => {
        const pathname = this.props.location && this.props.location.pathname
        BuyNowGA("Buy Now Popup Open")
        if (!this.state.showPaymentModal && pathname === '/sessions') {
            if (productName) {
                this.props.history.push(`/checkout?productName=${productName}`)
            } else {
                this.props.history.push(`/checkout`)
            }
        }
        this.setState({
            products
        }, () => {
            this.setState({
                showPaymentModal: true,
            })
        })
    }

    closePaymentSuccessPopupState = () => {
        this.setState({
            showPaymentSuccessModal: false
        })
    }

    closePaymentFailurePopupState = () => {
        this.setState({
            showPaymentFailureModal: false
        })
    }

    showPaymentSuccessPopupState = () => {
        this.setState({
            showPaymentSuccessModal: true
        })
    }

    showPaymentFailurePopupState = () => {
        this.setState({
            showPaymentFailureModal: true
        })
    }

    getBookSessionButtonLoader = () => {
        const { mentorMenteeSessionFetchStatus, bookSessionInfoFetchStatus } = this.props
        const userId = this.props.loggedInUser && this.props.loggedInUser.toJS().id
        const isBookSessionInfoFetching = bookSessionInfoFetchStatus && get(bookSessionInfoFetchStatus.toJS(), 'loading')
        if (
            !this.state.isEditing &&
            (
                (
                    mentorMenteeSessionFetchStatus &&
                    mentorMenteeSessionFetchStatus.getIn([`mentorMenteeSession/${userId}`, 'loading'])
                ) || isBookSessionInfoFetching
            )
        ) {
            return true
        }
        return false
    }

    getTopicOrder = topicId => {
        const topics = sort.ascend(this.props.topic, ['order']).toJS()
        const order = topics.findIndex(topic => topic.id === topicId)
        return order
    }

    closePaymentProductModal = () => {
        this.setState({
            showPaymentProductModal: false
        })
    }

    showPaymentProductModal = () => {
        this.setState({
            showPaymentProductModal: true
        })
    }

    showBookSessionInfoFetchLoader = () => {
        const { bookSessionInfoFetchStatus } = this.props
        return (bookSessionInfoFetchStatus && get(bookSessionInfoFetchStatus.toJS(), 'loading')) &&
            this.state.isEditing

    }

    getSchoolInfo = () => {
        const { loggedInUserSchoolInfo } = this.props
        let userSchoolInfo = {}
        if (loggedInUserSchoolInfo) {
            loggedInUserSchoolInfo.toJS().forEach(_u => {
                if (get(_u, 'parentProfile')) {
                    userSchoolInfo = _u
                }
            })
        }
        return userSchoolInfo
    }

    isTrialSession = () => {
        const { menteeCourseSyllabus } = this.props
        const sessions = menteeCourseSyllabus.toJS()[0]
        const {
            nextSessionToShow,
        } = this.getSessions(sessions)
        return this.getNextBookingSessionDetails(nextSessionToShow).id === this.getFirstTopicId()
    }

    getSlots = () => {
        const { loggedInUser, menteeCourseSyllabus } = this.props
        const sessions = menteeCourseSyllabus.toJS()[0]
        const {
            nextSessionToShow,
        } = this.getSessions(sessions)
        const allSlots = []
        const country = loggedInUser && get(loggedInUser.toJS(), 'parent.country')
            ? get(loggedInUser.toJS(), 'parent.country')
            : 'india'
        let isTrialSession = this.getNextBookingSessionDetails(nextSessionToShow).id === this.getFirstTopicId()
        new Array(3).fill('').forEach((_, i) => {
            let dateIncrement = (country === 'india' || !isTrialSession) ? i : i + 1
            let slots = this.getSlotTimeOnSelectedDate(moment().add(dateIncrement, 'days'))
            if (slots.length > 0) {
                allSlots.push({
                    i: dateIncrement,
                    date: moment().add(dateIncrement, 'days').date(),
                    day: moment().add(dateIncrement, 'days').calendar().split(" at")[0],
                    bookingDate: moment().add(dateIncrement, 'days').toDate(),
                    slots: slots.map(slot => ({
                        bookingDate: slot.date,
                        slotTime: slot.id,
                        intlSlotTime: slot.intlId,
                        time: {
                            startTime: slot.label,
                        },
                        showSlot: slot.quantity > 0,
                    }))
                })
            }
        })
        return allSlots
    }

    checkIfCourseCompleted = (sessions) => {
        const upcomingSessions = get(sessions, 'upComingSession')
        const bookedSession = get(sessions, 'bookedSession')
        const { menteeCourseSyllabusStatus } = this.props
        if (menteeCourseSyllabusStatus && menteeCourseSyllabusStatus.getIn(['success'])) {
            if ((upcomingSessions && upcomingSessions.length < 1) &&
                (bookedSession && bookedSession.length < 1) &&
                !this.isLoading()
            ) {
                return true
            }
        }
        return false
    }

    render() {
        const { menteeCourseSyllabus, sessionHomepageStatus, loggedInUser } = this.props
        const sessions = menteeCourseSyllabus.toJS()[0]
        const {
            firstComponent,
            previousTopicObj,
            upComingSessions,
            notBookedSessions,
            nextSessionToShow,
            showBookOption,
            completedSessions,
            showPurchaseOption,
            allSessions
        } = this.getSessions(sessions)
        const currentChild =
            get(this.getSchoolInfo(), 'parentProfile.children', []).find(child => get(child, 'user.id') === this.props.loggedInUser.get('id'))
        const schoolName = currentChild ? get(currentChild, 'school.name', '') : false
        const country = loggedInUser && get(loggedInUser.toJS(), 'parent.country')
            ? get(loggedInUser.toJS(), 'parent.country')
            : 'india'
        const loggedInStudentId = get(JSON.parse(localStorage.getItem('data')), 'studentProfile.data[0].id')
        // 🚨🚨🚨 ALERT: B2C Not Supported!
        const isB2BStudent = true

        if (this.isLoading()) return <TekieLoader />
        return (
            <>
                <SessionCoursePage
                    loadingNavigation={this.isLoading()}
                    startLoadingNavigation={() => {
                        this.setState({ loadingNavigation: true })
                    }}
                    stopLoadingNavigation={() => {
                        this.setState({ loadingNavigation: false })
                    }}
                    studentProfile={this.props.studentProfile && this.props.studentProfile.toJS()}
                    coursePackages={this.props.coursePackages && this.props.coursePackages.toJS()}
                    isB2BStudent={isB2BStudent}
                    switchToTeacherApp={this.switchToTeacherApp}
                    match={this.props.match}
                    hasMultipleChildren={this.props.hasMultipleChildren}
                    menteeCourseSyllabus={this.props.menteeCourseSyllabus}
                    loadingPage={this.isLoading()}
                    upComingSessions={upComingSessions}
                    showBookSession={this.state.showBookSessionModal || this.state.showEditSessionModal}
                    allSessions={allSessions}
                    courseDetails={this.props.course && this.props.course.toJS()}
                    userCourseCompletions={this.props.userCourseCompletions}
                    userProfile={this.props.userProfile}
                    isCourseCompleted={this.checkIfCourseCompleted(sessions)}
                    allSlots={this.getSlots()}
                    closeBookSession={this.closeSessionPopup}
                    notBookedSessions={notBookedSessions}
                    topicId={this.getNextBookingSessionDetails(nextSessionToShow).id}
                    isTrialSession={this.getNextBookingSessionDetails(nextSessionToShow).id === this.getFirstTopicId()}
                    onBookClicked={(slotsArray, topicId, bookingDetails) => this.bookSession(slotsArray, topicId, bookingDetails, this.getNextBookingSessionDetails(nextSessionToShow).name)}
                    nextSessionToShow={nextSessionToShow}
                    firstComponent={firstComponent}
                    previousTopicObj={previousTopicObj}
                    showBookOption={showBookOption}
                    completedSessions={completedSessions}
                    showPurchaseOption={showPurchaseOption}
                    selectedDate={this.state.selectedDate}
                    editingSession={this.state.showEditSessionModal}
                    onEditClicked={(slotsArray, bookingDetails) => this.editSession(slotsArray, bookingDetails, this.getNextBookingSessionDetails(nextSessionToShow).name)}
                    defaultDate={this.state.defaultDate}
                    onDateChange={(date) => this.onDateChange(date)}
                    bookSessionPopupLoading={this.shouldShowLoader() || this.state.otpLoading}
                    slotLoading={(sessionHomepageStatus && sessionHomepageStatus.get('loading')) || this.isLoading()}
                    loggedInUser={this.props.loggedInUser}
                    getSlotTimeOnDate={this.getSlotTimeOnSelectedDate}
                    country={country}
                    topics={this.props.courseTopic}
                    availableSlotStatusWithLabel={this.getSlotTimeOnSelectedDate()}
                    timezone={this.state.selectedTimezone}
                    updateTimezone={selectedTimezone => {
                        this.setState({ selectedTimezone }, () => {
                            const { topicDetails, currentTopicDetails } = this.state
                            if (this.state.showEditSessionModal && selectedTimezone === 'Asia/Kolkata') {
                                topicDetails.bookingDate = new Date(moment(currentTopicDetails.istBookingDate).tz('Asia/Kolkata').format('MM/DD/YYYY'))
                                currentTopicDetails.bookingDate = new Date(moment(currentTopicDetails.istBookingDate).tz('Asia/Kolkata').format('MM/DD/YYYY'))
                                this.setState({
                                    selectedDate: new Date(moment(currentTopicDetails.istBookingDate).tz('Asia/Kolkata').format('MM/DD/YYYY')),
                                    topicDetails,
                                    currentTopicDetails
                                })
                            } else if (this.state.showEditSessionModal && selectedTimezone !== 'Asia/Kolkata') {
                                const intlBookingDate = get(
                                    getIntlDateTime(currentTopicDetails.istBookingDate, currentTopicDetails.slotTime, this.state.selectedTimezone),
                                    'intlDateObj'
                                )
                                topicDetails.bookingDate = intlBookingDate
                                topicDetails.intlBookingDate = intlBookingDate
                                currentTopicDetails.bookingDate = intlBookingDate
                                currentTopicDetails.intlBookingDate = intlBookingDate
                                this.setState({
                                    selectedDate: intlBookingDate,
                                    topicDetails,
                                    currentTopicDetails
                                })
                            }
                            this.updateSelectedSlotsWithIntlTimingObj()
                        })
                    }}
                    bookSessionProps={{
                        showBookPopup: (topicId, topicTitle, topicOrder) => this.toggleBookSessionPopupState(topicId, topicTitle, topicOrder),
                        ...nextSessionToShow,
                        thisSession: nextSessionToShow,
                        showBookOption: showBookOption,
                        showPurchaseOption: showPurchaseOption,
                        updateSheet: this.updateSheet,
                        user: this.props.user ? this.props.user.toJS() : [],
                        mentorLoginStatus: this.props.mentorLoginStatus,
                        mentee: this.props.loggedInUser,
                        assignedMentor: get(menteeCourseSyllabus.toJS(), '[0].mentor', {}),
                        mentor: this.props.loggedInMentor,
                        schoolName: schoolName,
                        mentorSession: this.props.mentorSession,
                        menteeSession: this.props.menteeSession,
                        menteeSessionFetchStatus: this.props.menteeSessionFetchStatus,
                        mentorMenteeSessionAddStatus: this.props.mentorMenteeSessionAddStatus,
                        mentorMenteeAddSessionErrors: this.props.mentorMenteeAddSessionErrors,
                        mentorMenteeSessionFetchStatus: this.props.mentorMenteeSessionFetchStatus,
                        showEditPopup: (id, topicId, topicTitle, bookingDate, slotTime, topicOrder, intlBookingDate) => this.toggleEditSessionPopup(id, topicId, topicTitle, bookingDate, slotTime, topicOrder, intlBookingDate),
                        isLoading: this.isLoading(),
                        deleteSession: (topicId) => this.deleteSession(topicId, this.getNextBookingSessionDetails(nextSessionToShow).name),
                        isDeletingSession: this.state.currentTopicDetails.activity === 'delete',
                        ...this.props,
                        mentorMenteeSession: this.props.mentorMenteeSession,
                        completedSessions: completedSessions,
                        firstTopicId: this.getFirstTopicId(),
                        handleCancel: (topicId) => this.handleCancel(topicId),
                        togglePaymentPopupState: this.togglePaymentPopupState,
                        showPaymentProductModal: this.showPaymentProductModal,
                        topics: this.props.courseTopic && (sort.ascend(this.props.courseTopic, ['order'])).toJS(),
                        showButtonLoader: this.getBookSessionButtonLoader(),
                        profile: this.props.profile,
                        salesOperationInfo: filterKey(this.props.salesOperation, 'sessionHomepage'),
                        loggedInUser: this.props.loggedInUser,
                        schoolInfo: this.getSchoolInfo(),
                        studentProfile: this.props.studentProfile,
                        batchSessionStatus: this.props.batchSessionStatus,
                        batchSession: this.props.batchSession,
                        timezone: this.state.selectedTimezone,
                        coursePackageTopics: (this.props.topic && this.props.topic.toJS()) || [],
                        assignedMentorId:
                            this.props.assignedMentorId && this.props.assignedMentorId.length
                                ? this.props.assignedMentorId
                                : this.props.salesOperation
                                    ? get(this.props.salesOperation.toJS(), '0.allottedMentor.id')
                                    : '',
                    }}
                />
            </>
        )

    }
}

export default withArrowScroll(withRouter(Sessions), 'tk-route-container')
