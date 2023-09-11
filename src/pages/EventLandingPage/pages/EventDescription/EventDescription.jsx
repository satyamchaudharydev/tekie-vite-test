import React from 'react'
import qs from 'query-string'
import Footer from '../../components/Footer/Footer'
import EventFaq from '../../components/EventFaq/EventFaq'
import JoinTrib from '../../components/JoinTrib/JoinTrib'
import WhyJoin from '../../components/WhyJoin/WhyJoin'
import { get } from 'lodash'
import { EventPrize, EventOverview, EventBanner } from '../../components'
import isMobile from '../../../../utils/isMobile'
import CourseNav from '../../../../components/CourseNav'
import { motion } from 'framer-motion'
import downloadFile from '../../../../utils/downloadFile-utils'
import SignupLoginModal from '../../../../pages/Signup/SignupLogin'
import Congratulation from '../../components/PopUp/EventRegisterMessage'
import fetchEvent from '../../../../queries/eventsLandingPage/fetchEvent'
import '../LandingPage/LandingPage.styles.scss'
import Header from '../../components/Header/Header'
import { Toaster } from '../../../../components/Toaster'
import { getToasterBasedOnType } from '../../../../components/Toaster'
import updateEventAttendance from '../../../../queries/eventsLandingPage/updateEventAttendance'
import CompletionPopUp from '../../components/PopUp/CompletionPopUp'
import DescriptionsSkeleton from './DescriptionsSkeletons'
import SimpleButtonLoader from '../../../../components/SimpleButtonLoader';
import registerUserForEvent from '../../../../queries/registerUserForEvent'
import getEventCertificateForUser, { updateCertificate } from '../../../../queries/getEventCertificateForUser'
import fetchEventSpeakers from '../../../../queries/eventsLandingPage/fetchEventSpeakers'
import fetchEventWinners from '../../../../queries/eventsLandingPage/fetchEventWinners'
import moment from 'moment'
import NavBar from '../../components/NavBar/NavBar'
import SpeakerSection from '../../components/SpeakerSection/SpeakerSection'
import MobileNavbar from '../../components/MobileNavbar/mobileNavbar'
import getSlotLabel from '../../../../utils/slots/slot-label';
import getIntlDateTime from '../../../../utils/time-zone-diff';
import { eventStatusLoggedInTimer, eventStatusLoggedOutTimer, withHttps } from '../../constants'
import './eventDescription.scss'
import EventCompletionBanner from '../../components/EventCompletionBanner/EventCompletionBanner'
import CommonEventPopup from '../../components/PopUp/CommonEventPopup'
import EventStartPopUp from '../../components/PopUp/EventStartPopUp'
import '../LandingPage/fonts/Gilroy.css'
import WinnerCarousel from '../../components/Carousel/WinnerCarousel'

const failureToasterProps = e => {
  return {
    type: 'info',
    message: e,
    autoClose: 4000
  }
}

const diffCases = {
    registerNow: 'Register Now',
    joinNow: 'Join Now',
    watchNow: 'Watch Now',
    downloadCertificate: 'Download Certificate',
    viewDetails: 'View Details'
}


class EventDescriptionPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            isSignin: false,
            showRegisterConfirmModal: false,
            data: {},
            clicked: false,
            clickedCourses: false,
            clickedResources: false,
            visibleReminderPopup: false,
            visibleCompletePopup: false,
            reminderTime: '',
            speakerData: [],
            winnerData: [],
            isEventDataFetching: false,
            isEventSpeakerFetching: false,
            isEventWinnerFetching: false,
            currentAction: '',
            certificateUri: '',
            sessionLink: '',
            isLinkVisited: false,
            errorWhileRegister: '',
        }
    }

    isCustomHeaderVisible = () => {
        const { isLoggedIn, match, hasMultipleChildren = false, userId } = this.props
        if (hasMultipleChildren && !userId) {
            return true
        }
        if ((!isLoggedIn) && match.path.split('/').includes('events')) {
            return true
        }
        return false
    }
    clickerHamburger = () => {
        this.setState(prevState => ({
            clicked: !prevState.clicked
        }))
    }

    goToEvents = () => this.props.history.goBack()

    clickerCourses = () => {
        this.setState(prevState => ({
            clickedCourses: !prevState.clickedCourses
        }))
    }

    clickerResources = () => {
        this.setState(prevState => ({
            clickedResources: !prevState.clickedResources
        }))
    }

    componentDidMount = async () => {
        const { eventId } = this.props.match.params
        this.setState({
            isEventSpeakerFetching: true,
            isEventWinnerFetching: true,
        })

        fetchEventSpeakers(eventId).then(res => {
            if (get(res, 'getEventSpeaker')) {
                this.setState({
                    speakerData: [...get(res, 'getEventSpeaker', [])],
                    isEventSpeakerFetching: false
                })
            }
        })

        fetchEventWinners(eventId).then(res => {
            if (get(res, 'getEventWinner')) {
                this.setState({
                    winnerData: [...get(res, 'getEventWinner', [])],
                    isEventWinnerFetching: false
                })
            }
        })
        this.fetchEventsData(true)
        window.addEventListener("popstate", this.goToEvents)
    }

    fetchEventsData = async (showLoader = false) => {
        const { eventId } = this.props.match.params
        const { isLoggedIn, userStudentProfileId } = this.props
        if (isLoggedIn) {
            const current = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
            if (showLoader) {
                this.setState({
                    isEventDataFetching: true
                })
            }
            await fetchEvent(eventId, userStudentProfileId, isLoggedIn, current)
        } else {
            if (showLoader) {
                this.setState({
                    isEventDataFetching: true
                })
            }
            await fetchEvent(eventId, '', '', '')
        }
    }
    componentWillUnmount() {
        window.clearInterval(this.interval)
        window.removeEventListener("popstate", this.goToEvents)
    }

    componentDidUpdate = (prevProps) => {
        const { updateEventStatus, eventData, eventDataFetchStatus, updateEventFailedMessage } = this.props
        if (updateEventStatus && !get(updateEventStatus.toJS(), 'loading')
            && get(updateEventStatus.toJS(), 'success') &&
            (prevProps.updateEventStatus !== updateEventStatus)) {
            this.setState({ showRegisterConfirmModal: true }, this.fetchEventsData)
        } else if (updateEventStatus &&
            !get(updateEventStatus.toJS(), 'loading') &&
            get(updateEventStatus.toJS(), 'failure') && (
            prevProps.updateEventFailedMessage !== updateEventFailedMessage
            )) {
            if (updateEventFailedMessage && updateEventFailedMessage.toJS().length) {
                const errorObj = updateEventFailedMessage.toJS().pop()
                const errorMessage = get(errorObj, 'error.errors[0].message')
                if (errorMessage
                    && errorMessage === 'Child is already registered for event') {
                    this.fetchEventsData()
                } else if (errorMessage && errorMessage === 'Event is cancelled') this.setErrorWhileRegister(errorMessage)
                else if (errorMessage && errorMessage === 'Registration closed for this event') this.setErrorWhileRegister(errorMessage)
            }
        }
        if (eventDataFetchStatus && !get(eventDataFetchStatus.toJS(), 'loading')
            && get(eventDataFetchStatus.toJS(), 'success') &&
            (prevProps.eventDataFetchStatus !== eventDataFetchStatus)) {
            const eventsData = eventData && eventData.toJS()
            const { isLoggedIn } = this.props
            if (eventsData && eventsData.length) {
                this.setState({
                    data: eventsData[0],
                    isEventDataFetching: false
                }, this.actionAfterFetch)
                this.interval = setInterval(this.actionAfterFetch, isLoggedIn ? eventStatusLoggedInTimer : eventStatusLoggedOutTimer)
            }
        } else if (eventDataFetchStatus && !get(eventDataFetchStatus.toJS(), 'loading')
            && !get(eventDataFetchStatus.toJS(), 'success') &&
            get(eventDataFetchStatus.toJS(), 'failure') &&
            (prevProps.eventDataFetchStatus !== eventDataFetchStatus)) {
            this.setState({
                isEventDataFetching: false,
                isEventSpeakerFetching: false
            }, () => this.setErrorWhileRegister('errorWhileFetching'))
        }
    }
    setErrorWhileRegister = (errorMessage = '') => {
        let actionMessage = ''
        if (errorMessage === 'Event is cancelled') { 
            actionMessage = 'Unfortunately, the event has been cancelled. We\'ll update you when we have more details.'
        } else if (errorMessage === 'Registration closed for this event') {
            actionMessage = 'The registrations for this event have been closed. Don\'t worry, we\'ll soon come back with more details.'
        } else if (errorMessage === 'errorWhileFetching') {
            actionMessage = 'Sorry, your request wasn\'t processed. Please try again in some time.'
        }
        this.setState({
            errorWhileRegister: actionMessage
        })
    }
  actionAfterFetch = async () =>{
    const { isEventDataFetching, } = this.state
    if (isEventDataFetching) return null
    const { userStudentProfileId } = this.props
    const { isRegistered, isSessionExist, isPastSession,
        disabledJoinButton, sessionDateTime,
        isCompletedEvent, onGoingEvent,
        stopRegiBeforeEvent,
    } = this.getEventActions()
    const { isLoggedIn } = this.props
    const isPresent = get(isSessionExist, 'attendance', []).find(student => get(student, 'student.id') === userStudentProfileId)
    const { data } = this.state
    const query = qs.parse(window.location.search)
    let currentAction = ''
    let downloadCount = 0;
    let certificateUri = this.state.certificateUri || '';
    let sessionLink = '';
    let visibleReminderPopup = false;
    let reminderTime = '';
    let visibleCompletePopup = false;
    let certificateId = '';
    let isLinkVisited = this.state.isLinkVisited || false
    if (!isRegistered && !isCompletedEvent) {
      currentAction = diffCases.registerNow
    }
    if (isRegistered && isSessionExist && !isPastSession) {
      if (!disabledJoinButton) {
        sessionLink = get(data, 'sessionLink')
      }
      currentAction = diffCases.joinNow
    }
    if (isRegistered && isCompletedEvent) {
      const { userId } = this.props
      const eventId = get(this.props, 'match.params.eventId')
      currentAction = diffCases.downloadCertificate
      if (!this.state.certificateUri) {
        const certificate = await getEventCertificateForUser(eventId, userId)
        if (certificate) {
            downloadCount = get(certificate, 'eventCertificates[0].numberOfDownloads')
            certificateUri = get(certificate, 'eventCertificates[0].assetUrl')
            certificateId = get(certificate, 'eventCertificates[0].id')
            if (downloadCount === 0 && certificateUri) {
                visibleCompletePopup = true
                if (certificateId) {
                    updateCertificate(certificateId)
                }
            }
        }
      }
    }
    if (!isRegistered && isCompletedEvent) {
      currentAction = diffCases.watchNow
    }
    if (!isLoggedIn && (onGoingEvent || stopRegiBeforeEvent)) {
      currentAction = diffCases.registerNow
    }
    if (!isRegistered && !currentAction) {
      currentAction = diffCases.viewDetails
    }
    if (currentAction === diffCases.joinNow
        && !disabledJoinButton) {
        if (!get(isPresent, 'isPresent', false) && !isLinkVisited) {
            const timeDiff = Math.round(((moment(new Date(sessionDateTime)).diff(new Date()) % 86400000) % 3600000) / 60000)
            visibleReminderPopup = true
            reminderTime = timeDiff
        }
        if (get(isPresent, 'isPresent', false)) {
            isLinkVisited = true
        }
      }
    this.setState({
      currentAction,
      certificateUri,
      sessionLink,
      visibleReminderPopup,
      reminderTime,
      visibleCompletePopup,
      isLinkVisited,
    }, () => {
        const params = qs.parse(window.location.search)
        const { eventId } = this.props.match.params
        if (get(params, 'register')) {
        if (currentAction === diffCases.registerNow) this.handleActionButtonClick()
        else if (currentAction !== diffCases.registerNow
                && isCompletedEvent) this.setErrorWhileRegister('Registration closed for this event')
        // else if (currentAction !== diffCases.registerNow
        //     && isCompletedEvent) this.handleActionButtonClick()
      }
        if (get(query, 'joinSession') && currentAction === diffCases.joinNow 
            && sessionLink) this.onJoinButtonClick()
        this.props.history.push(`/events/${eventId}`)
    })
  }
    getEventActions = () => {
      const { data, isEventDataFetching } = this.state
      const { isLoggedIn, userStudentProfileId } = this.props
      const isRegistered = isLoggedIn && (get(data, 'registeredUsers[0].id') === userStudentProfileId)
      let dateValue = get(data, 'eventTimeTableRule.startDate')
      let slotValue = 0
      if (isEventDataFetching) return {}
      for (const slot in get(data, 'eventTimeTableRule')) {
        if (slot.startsWith('slot') && get(data, 'eventTimeTableRule')[slot]) {
          slotValue = slot.split('slot')[1]
        }
      }
      let eventStartDate = new Date(dateValue).setHours(slotValue, 0, 0, 0)
      let endDateTime = new Date(get(data, 'eventTimeTableRule.endDate')).setHours(slotValue, 0, 0, 0)
      let isSessionExist = get(data, 'eventSessions', []).find(session =>
        get(session, 'sessionDate') === moment().startOf('day').toISOString()
      )
      let sessionDateTime = new Date();
      if (!isSessionExist) {
        isSessionExist = get(data, 'eventSessions[0]')
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
      if (get(data, 'timeZone')) {
        const { intlDateObj, intlSlot } = getIntlDateTime(
            dateValue,
            slotValue,
            get(data, 'timeZone') || 'Asia/Kolkata'
        )
        eventStartDate = new Date(new Date(intlDateObj).setHours(intlSlot, 0, 0, 0))
        const { intlDateObj: endDateObj, intlSlot: endDateSlot } = getIntlDateTime(
            get(data, 'eventTimeTableRule.endDate'),
            slotValue,
            get(data, 'timeZone') || 'Asia/Kolkata'
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

    setIsSignin = (value) => {
        this.setState({
            isSignin: value
        })
    }
    showCongrat = () => {
        setTimeout(() => {
            this.setState({
                showRegisterConfirmModal: true,
            })
        }, 500);
    }
    onJoinButtonClick = () => {
        const { isSessionExist, disabledJoinButton, isPastSession } = this.getEventActions()
        const { sessionLink, visibleReminderPopup, isLinkVisited } = this.state
        const { userStudentProfileId } = this.props
        const { eventId } = this.props.match.params
        if (isPastSession) return getToasterBasedOnType(failureToasterProps('Session ended'))
        if (disabledJoinButton) return getToasterBasedOnType(failureToasterProps('Session Not yet started'))
        if (isSessionExist && sessionLink && !disabledJoinButton && !isPastSession) {
            if (!isLinkVisited) {
                const input = {
                    eventId,
                    eventSessionId: get(isSessionExist, 'id'),
                    studentProfileId: userStudentProfileId
                }
                updateEventAttendance(input)
            }
            let linkVisited = false
            let visibleReminder = false
            if (!isLinkVisited) {
                linkVisited = true
            }
            if (visibleReminderPopup) visibleReminder = false
            this.setState({
                isLinkVisited: linkVisited,
                visibleReminderPopup: visibleReminder
            })
            window.open(withHttps(sessionLink), '_blank')
            return
        }
    }
    handleActionButtonClick = (fromClick = 'watch') => {
        const { isLoggedIn, userStudentProfileId } = this.props
        const eventId = get(this.props, 'match.params.eventId')
        const { currentAction, certificateUri, data } = this.state
        const momentFromEventLink = get(data, 'momentFromEventLink')
        const sessionLink = get(data, 'sessionLink')
        const { isSessionExist, isPastSession, disabledJoinButton, isCompletedEvent } = this.getEventActions()
        if (currentAction === diffCases.registerNow) {
            if (isLoggedIn && userStudentProfileId) registerUserForEvent(eventId, userStudentProfileId)
            else this.setIsSignin(true)
        } else if (currentAction === diffCases.joinNow && sessionLink && isSessionExist) {
          if (isPastSession) return getToasterBasedOnType(failureToasterProps('Session ended'))
          if (disabledJoinButton) return getToasterBasedOnType(failureToasterProps('Session Not yet started'))
          this.onJoinButtonClick()
        } else if (certificateUri && fromClick === 'download') {
          downloadFile(certificateUri)
          this.closeModal('visibleCompletePopup')
        } else if (isCompletedEvent && momentFromEventLink && fromClick === 'watch') {
          window.open(withHttps(momentFromEventLink), '_blank')
        } else if (currentAction === diffCases.viewDetails) {
          const overviewDiv = document.querySelector('#eventOverviewDiv')
          if (overviewDiv) {
            overviewDiv.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }
    }
    renderActionButton = () => {
        const { isEventDataFetching } = this.state
        if (isEventDataFetching) return <DescriptionsSkeleton forSection='registerButton' />
        const { isUpdatingEvent = false } = this.props
        const { disabledJoinButton } = this.getEventActions()
        const momentFromEventLink = get(this.state.data, 'momentFromEventLink')
        if (this.state.currentAction === diffCases.registerNow) {
            return (
                <div
                    className="event-registerButton"
                    onClick={this.handleActionButtonClick}
                >
                    {!isUpdatingEvent ? (
                    <>
                        <div>Register Now</div>{" "}
                        <div className="register-arrow-right">
                        <svg className='actionButtonSVG' viewBox="0 0 18 19" fill="none">
                            <path
                            d="M1.849 8.064H11.94l-4.41 4.41a.91.91 0 000 1.282.9.9 0 001.275 0l5.954-5.954a.9.9 0 000-1.274L8.815.565A.9.9 0 107.54 1.839l4.4 4.418H1.849a.906.906 0 00-.904.904c0 .497.407.903.904.903z"
                            fill="#fff"
                            />
                        </svg>
                        </div>
                    </>
                    ) : (
                        <>
                        <div>Registering...</div><SimpleButtonLoader
                                noGradient
                                showLoader={true}
                                style={{ left: 7 }}
                            />
                        </>
                    )}
                </div>
            )
        }
        if (this.state.currentAction === diffCases.joinNow) {
            return (
                <div
                    className={`event-registerButton ${disabledJoinButton && 'disabled'}`}
                    onClick={() => !disabledJoinButton && this.handleActionButtonClick()}
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
        if (this.state.currentAction === diffCases.downloadCertificate
            && (this.state.certificateUri || momentFromEventLink)) {
            return (
                <div className='post-event-download-container-main'>
                  <div className='event-completion-certificate' onClick={() => this.handleActionButtonClick('download')}>
                    Download Certificate
                  </div>
                  {momentFromEventLink && (
                    <div className='btn-watch-now' onClick={() => window.open(withHttps(momentFromEventLink), '_blank')}>
                    <div class="btn-sd-blue-container">
                        <div class="loader hide"></div>
                        <span>Watch Now</span>
                        <div class="btn-arrow">
                        <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.7325 17.6251C1.4447 17.6245 1.16199 17.5491 0.912187 17.4062C0.349687 17.0874 0 16.4687 0 15.797V2.20321C0 1.52961 0.349687 0.912739 0.912187 0.593989C1.16794 0.447006 1.45848 0.37142 1.75343 0.37513C2.04839 0.378841 2.33693 0.461713 2.58891 0.615083L14.2069 7.56946C14.449 7.72128 14.6486 7.93211 14.787 8.18218C14.9253 8.43225 14.9979 8.71336 14.9979 8.99915C14.9979 9.28494 14.9253 9.56605 14.787 9.81611C14.6486 10.0662 14.449 10.277 14.2069 10.4288L2.58703 17.3851C2.32917 17.541 2.03382 17.6239 1.7325 17.6251Z" fill="white"/>
                        </svg>
                        </div>
                    </div>
                    </div>
                  )}
                </div>
            )
        }
        if (this.state.currentAction === diffCases.watchNow && momentFromEventLink) {
            return (
                <div className='btn-watch-now only-moment-link' onClick={() => window.open(withHttps(momentFromEventLink), '_blank')}>
                <div class="btn-sd-blue-container">
                    <div class="loader hide"></div>
                    <span>Watch Now</span>
                    <div class="btn-arrow">
                    <svg width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.7325 17.6251C1.4447 17.6245 1.16199 17.5491 0.912187 17.4062C0.349687 17.0874 0 16.4687 0 15.797V2.20321C0 1.52961 0.349687 0.912739 0.912187 0.593989C1.16794 0.447006 1.45848 0.37142 1.75343 0.37513C2.04839 0.378841 2.33693 0.461713 2.58891 0.615083L14.2069 7.56946C14.449 7.72128 14.6486 7.93211 14.787 8.18218C14.9253 8.43225 14.9979 8.71336 14.9979 8.99915C14.9979 9.28494 14.9253 9.56605 14.787 9.81611C14.6486 10.0662 14.449 10.277 14.2069 10.4288L2.58703 17.3851C2.32917 17.541 2.03382 17.6239 1.7325 17.6251Z" fill="white"/>
                    </svg>
                    </div>
                </div>
                </div>
            )
        }
        if (this.state.currentAction === diffCases.viewDetails) {
            return (
                <div
                    className="event-registerButton watch"
                    onClick={this.handleActionButtonClick}
                  >
                  <div className='watch-now-button'>View Details</div>{" "}
                      <div className="register-arrow-right">
                        <svg className='viewDetails' xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                        <path d="M6.28908 1.04129L6.28908 11.0145L1.93193 6.65737C1.58372 6.30915 1.01229 6.30915 0.664077 6.65737C0.315862 7.00558 0.315862 7.56808 0.664077 7.91629L6.548 13.8002C6.89622 14.1484 7.45872 14.1484 7.80693 13.8002L13.6998 7.92522C13.867 7.75841 13.9609 7.53193 13.9609 7.29576C13.9609 7.05958 13.867 6.83311 13.6998 6.66629C13.3516 6.31808 12.7891 6.31808 12.4409 6.66629L8.07479 11.0145V1.04129C8.07479 0.550223 7.673 0.148438 7.18193 0.148438C6.69086 0.148438 6.28908 0.550223 6.28908 1.04129Z" fill="white"/>
                        </svg>
                      </div>
                </div>
            )
        }
        if (this.getEventActions().isCompletedEvent && this.state.winnerData.length) {
            return (
                <div
                    className="event-registerButton watch completedEvent"
                    onClick={() => {
                        const winnerSection = document.getElementById('winner_section_container')
                        if (winnerSection) {
                            winnerSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        }
                    }}
                  >
                  <div className='watch-now-button'>View Winners</div>{" "}
                    <svg className='viewDetails' xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                        <path d="M6.28908 1.04129L6.28908 11.0145L1.93193 6.65737C1.58372 6.30915 1.01229 6.30915 0.664077 6.65737C0.315862 7.00558 0.315862 7.56808 0.664077 7.91629L6.548 13.8002C6.89622 14.1484 7.45872 14.1484 7.80693 13.8002L13.6998 7.92522C13.867 7.75841 13.9609 7.53193 13.9609 7.29576C13.9609 7.05958 13.867 6.83311 13.6998 6.66629C13.3516 6.31808 12.7891 6.31808 12.4409 6.66629L8.07479 11.0145V1.04129C8.07479 0.550223 7.673 0.148438 7.18193 0.148438C6.69086 0.148438 6.28908 0.550223 6.28908 1.04129Z" fill="white"/>
                    </svg>
                </div>
            )
        }
    }
    closeModal = (name) => {
        this.setState({
            [name]: false
        })
    }
    render() {
        const { isSignin, showRegisterConfirmModal,
            speakerData, clicked, clickedCourses,
            clickedResources, isEventDataFetching,
            isEventSpeakerFetching, currentAction,
            data, visibleCompletePopup,
            visibleReminderPopup, reminderTime, errorWhileRegister, winnerData, isEventWinnerFetching } = this.state
        const { isLoggedIn } = this.props
        return (
          <div className="event-description-container">
              <section style={{ display: clicked ? "inline" : "none", }} class="lp-navbar-mobile close__wt" >
                    <MobileNavbar click={this.clickerHamburger} clickerCourses={this.clickerCourses} clickerResources={this.clickerResources} clickedCourses={clickedCourses} clickedResources={clickedResources} />
                </section>
            <div>
                <div className="header-container">
                    {this.isCustomHeaderVisible() ? (
                        <Header click={this.clickerHamburger} />
                    ) : (
                        <NavBar />
                    )}
                </div>
                {isMobile() && !this.isCustomHeaderVisible() && <CourseNav fromEventsPage={true} />}
                {this.getEventActions().isCompletedEvent ? (
                  <EventCompletionBanner
                    data={data}
                    renderActionButton={() => isEventDataFetching ? this.renderActionButton() : currentAction ? this.renderActionButton() : <></>} 
                  />
                ) : (
                  <EventBanner
                    isLoggedIn={isLoggedIn}
                    data={data}
                    props={this.props}
                    userStudentProfileId={this.props.userStudentProfileId}
                    isEventDataFetching={isEventDataFetching}
                    getEventActions={this.getEventActions}
                    renderActionButton={() => isEventDataFetching ? this.renderActionButton() : currentAction ? this.renderActionButton() : <></>}
                  />
                )}
            <EventOverview data={data} isEventDataFetching={isEventDataFetching} />
            {winnerData.length>0 && <WinnerCarousel winnerData={winnerData} eventName={get(data, 'name')} isEventWinnerFetching={isEventWinnerFetching} />}
            {!winnerData.length && (
                <EventPrize data={data} isEventDataFetching={isEventDataFetching} />
            )}
            <SpeakerSection speakerData={speakerData} isEventSpeakerFetching={isEventSpeakerFetching} />
            {!this.getEventActions().isCompletedEvent && (
                <WhyJoin
                    data={data}
                    isEventDataFetching={isEventDataFetching}
                    userStudentProfileId={this.props.userStudentProfileId}
                    getEventActions={this.getEventActions}
                    renderActionButton={() => isEventDataFetching ? this.renderActionButton() : currentAction
                        && ![diffCases.watchNow, diffCases.downloadCertificate, diffCases.viewDetails].includes(currentAction)
                        ? this.renderActionButton() : <></>}
                />
            )}
            
            <JoinTrib />
            <div id="event__details">
              <EventFaq />
            </div>
            <Footer />
            <motion.div
              initial={{
                opacity: isSignin ? 1 : 0,
                visibility: isSignin ? "visible" : "hidden",
              }}
              animate={{
                opacity: isSignin ? 1 : 0,
                visibility: isSignin ? "visible" : "hidden",
              }}
              style={{
                pointerEvents: isSignin ? "auto" : "none",
              }}
                >
              <SignupLoginModal
                registerationForEvent
                modalComponent
                visible={isSignin}
                showCongrat={this.showCongrat}
                eventData={data}
                closeLoginModal={this.setIsSignin}
                showRegisterConfirmModal={() => this.setState({ showRegisterConfirmModal: true })}
              />
            </motion.div>
            {showRegisterConfirmModal && (
                    <Congratulation
                        closeModal={() => this.closeModal('showRegisterConfirmModal')} data={data}
                    />
                )
            }
            {
                visibleReminderPopup && (
                    <EventStartPopUp
                        reminderTime={reminderTime}
                        closeModal={() => this.closeModal('visibleReminderPopup')}
                        onOkButtonClick={() => this.handleActionButtonClick()}
                    />
                )
            }
            {errorWhileRegister && (
                <CommonEventPopup message={errorWhileRegister} closeModal={() => this.setErrorWhileRegister('close')} />
            )}
            {
                visibleCompletePopup && (
                    <CompletionPopUp
                        data={data}
                        closeModal={() => this.closeModal('visibleCompletePopup')}
                        onOkButtonClick={() => this.handleActionButtonClick('download')}
                    />
                )
            }
            </div>
          </div>
        );
    }
}

export default EventDescriptionPage
