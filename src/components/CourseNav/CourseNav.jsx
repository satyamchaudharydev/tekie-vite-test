/* eslint-disable */
import React, { Component } from 'react'
import cx from 'classnames'
import { get } from 'lodash'
import ReactToolTip from 'react-tooltip'
import { AnimatePresence, AnimateSharedLayout, motion } from 'framer-motion'
import { filterKey } from '../../utils/data-utils'
import { ReactComponent as AlertIcon } from '../../assets/alert-circle-sharp.svg'
import './CourseNav.scss'
import store from '../../store'
import { getCourseName, isCheatSheetAllowed, shouldCodePlagroundAllowed } from '../../utils/getCourseId'
import { PYTHON_COURSE } from '../../config'
import { withRouter } from 'react-router'
import { isPast } from 'date-fns'
import { homeworkComponents } from '../../constants/homework'
import ChatIcon from './chat_icon.svg'
import PeopleIcon from './people_icon.svg'
import SwitchIcon from './switch_icon.svg'
import isMobile from '../../utils/isMobile'
import { List } from 'immutable'
import duck from "../../duck";
import getPath from '../../utils/getPath'
import { RightArrow } from '../NavBar/NavBar'
import "../NavBar/NavBar.scss";
import { connect } from 'react-redux'
import LogoutIcon from "../../assets/logoutShape.svg";
import { sessionStatus } from '../../pages/TeacherApp/pages/TimeTable/constants'

const StaggerAnimationVariants = {
  hidden: {
    opacity: 0,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.2,
      staggerDirection: -1,
      ease: "easeInOut",
      delay: 0,
    },
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      delay: 0,
      staggerChildren: 0.2,
      ease: "easeInOut",
    },
  },
};

const SessionIcon = (gradient = false) => (
  <svg width='100%' height='100%' viewBox='0 0 31 31' fill="none">
    <defs>
      <linearGradient id="cp-course-icon" x1="26.3343" y1="13.0007" x2="-0.468897" y2="13.0008" gradientUnits="userSpaceOnUse">
        <stop stop-color="#35E4E9" />
        <stop offset="1" stop-color="#00ADE6" />
      </linearGradient>
    </defs>
    <path
      d="M15.538 9.688v17.438m0-17.438c.972-3.824 4.64-5.776 12.627-5.812a.97.97 0 01.971.969v17.437a.967.967 0 01-.971.969c-7.77 0-10.772 1.563-12.627 3.875-1.843-2.3-4.856-3.875-12.626-3.875-.6 0-.972-.487-.972-1.086V4.845a.963.963 0 01.972-.969c7.987.036 11.655 1.988 12.626 5.812z"
      stroke="#fff"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CourseIcon = () => (
  <svg width='100%' height='100%' viewBox="0 0 36 37" fill="none">
    <path
      d="M5.62 7.744H3.372c-.621 0-1.125.504-1.125 1.125v23.624c0 .621.504 1.125 1.125 1.125h2.25c.621 0 1.125-.504 1.125-1.125V8.87c0-.621-.504-1.125-1.125-1.125z"
      stroke="#fff"
      strokeWidth={2.25}
      strokeLinejoin="round"
    />
    <path
      d="M7.871 29.115h9m-9-12.374h9-9z"
      stroke="#fff"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.746 12.244h-6.75c-.621 0-1.125.504-1.125 1.125v19.124c0 .622.504 1.125 1.125 1.125h6.75c.621 0 1.125-.503 1.125-1.125V13.37c0-.621-.504-1.125-1.125-1.125zM23.62 4.37h-4.499c-.621 0-1.125.503-1.125 1.125v26.998c0 .622.504 1.125 1.125 1.125h4.5c.621 0 1.125-.503 1.125-1.125V5.495c0-.622-.504-1.125-1.125-1.125zM29.7 7.752l-2.84.299c-.782.082-1.35.813-1.261 1.624l2.455 22.61c.089.811.8 1.407 1.581 1.325l2.84-.298c.783-.083 1.35-.814 1.261-1.625L31.285 9.08c-.092-.814-.803-1.41-1.585-1.328z"
      stroke="#fff"
      strokeWidth={2.25}
      strokeLinejoin="round"
    />
  </svg>
)

const CodePlaygroundIcon = () => (
  <svg width='100%' height='100%' fill="none" viewBox="0 0 30 30">
    <circle cx={15} cy={15} r={13.875} stroke="#fff" strokeWidth={2.25} />
    <path
      d="M10.125 11.292L4.63 15.083l4.617 3.792M16.61 7.5l-3.472 15.75m5.365-4.375l7.371-3.792-5.496-3.791"
      stroke="#fff"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CheatSheetIcon = () => (
  <svg width='100%' height='100%' viewBox="0 0 31 30" fill="none">
    <path
      d="M1.855 4.091c0 1.243.183.862.564 1.715m17.134 22.83a3.06 3.06 0 01-2.257-1.074M2.42 5.806c.442.99 1.151 1.612 2.152 1.612h7.37c1.94 0 4.51 3.491 4.51 6.177v11.281c0 1.248.355 2.107.845 2.686M2.42 5.806l9.166 13.492m5.711 8.264l-2.583-3.512M4.57 14.07h3.192M4.57 19.298h7.014m0 0l3.128 4.752m-10.142 0h10.142m2.085-15.682H27.57m0 5.702h-9.383m9.383 5.228h-9.383"
      stroke="#A8A7A7"
      strokeWidth={2}
    />
    <rect
      x={2}
      y={1}
      width={28}
      height={28}
      rx={2}
      stroke="#A8A7A7"
      strokeWidth={2}
    />
  </svg>
)

const CodePlaygroundMobileIcon = () => (
  <svg width="100%" height="100%" className='strokeDisabled' viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8.06443 6.36919C8.33719 6.68092 8.30561 7.15474 7.99388 7.4275L2.63894 12.1131L7.99388 16.7986C8.30561 17.0714 8.33719 17.5452 8.06443 17.8569C7.79167 18.1687 7.31785 18.2003 7.00612 17.9275L1.00612 12.6775C0.84336 12.5351 0.75 12.3293 0.75 12.1131C0.75 11.8968 0.84336 11.6911 1.00612 11.5486L7.00612 6.29864C7.31785 6.02588 7.79167 6.05746 8.06443 6.36919Z" fill="#A8A7A7" stroke="none" />
    <path fill-rule="evenodd" clip-rule="evenodd" d="M15.9353 6.36919C16.2081 6.05746 16.6819 6.02588 16.9936 6.29864L22.9936 11.5486C23.1564 11.6911 23.2498 11.8968 23.2498 12.1131C23.2498 12.3293 23.1564 12.5351 22.9936 12.6775L16.9936 17.9275C16.6819 18.2003 16.2081 18.1687 15.9353 17.8569C15.6626 17.5452 15.6942 17.0714 16.0059 16.7986L21.3608 12.1131L16.0059 7.4275C15.6942 7.15474 15.6626 6.68092 15.9353 6.36919Z" fill="#A8A7A7" stroke="none" />
    <path fill-rule="evenodd" clip-rule="evenodd" d="M14.4657 3.89462C14.8625 4.01364 15.0876 4.43176 14.9686 4.8285L10.4686 19.8285C10.3495 20.2252 9.93143 20.4504 9.53469 20.3314C9.13794 20.2123 8.9128 19.7942 9.03183 19.3975L13.5318 4.39748C13.6509 4.00073 14.069 3.7756 14.4657 3.89462Z" fill="#A8A7A7" stroke="none" />
  </svg>
)

const CheatSheetMobileIcon = () => (
  <svg width="100%" height="100%" className='strokeDisabled' viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.75 3.11328C6.35218 3.11328 5.97064 3.27132 5.68934 3.55262C5.40804 3.83393 5.25 4.21546 5.25 4.61328V19.6133C5.25 20.0111 5.40804 20.3926 5.68934 20.6739C5.97064 20.9552 6.35218 21.1133 6.75 21.1133H17.25C17.6478 21.1133 18.0294 20.9552 18.3107 20.6739C18.592 20.3926 18.75 20.0111 18.75 19.6133V10.4845C18.75 10.4845 18.75 10.4844 18.75 10.4844C18.7499 10.2856 18.671 10.095 18.5305 9.95439C18.5304 9.95437 18.5304 9.95435 18.5304 9.95433L11.9089 3.33289C11.7684 3.19233 11.5777 3.11334 11.3789 3.11328C11.3789 3.11328 11.3788 3.11328 11.3788 3.11328H6.75ZM4.62868 2.49196C5.19129 1.92935 5.95435 1.61328 6.75 1.61328H11.379C11.9755 1.61337 12.5476 1.85035 12.9695 2.27211L12.9695 2.27217L19.5912 8.89379C20.0129 9.31565 20.2499 9.88773 20.25 10.4843V19.6133C20.25 20.4089 19.9339 21.172 19.3713 21.7346C18.8087 22.2972 18.0456 22.6133 17.25 22.6133H6.75C5.95435 22.6133 5.19129 22.2972 4.62868 21.7346C4.06607 21.172 3.75 20.4089 3.75 19.6133V4.61328C3.75 3.81763 4.06607 3.05457 4.62868 2.49196Z" fill="#A8A7A7" stroke="none" />
    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 1.98828C12.4142 1.98828 12.75 2.32407 12.75 2.73828V8.36328C12.75 8.56219 12.829 8.75296 12.9697 8.89361C13.1103 9.03426 13.3011 9.11328 13.5 9.11328H19.125C19.5392 9.11328 19.875 9.44907 19.875 9.86328C19.875 10.2775 19.5392 10.6133 19.125 10.6133H13.5C12.9033 10.6133 12.331 10.3762 11.909 9.95427C11.4871 9.53231 11.25 8.96002 11.25 8.36328V2.73828C11.25 2.32407 11.5858 1.98828 12 1.98828Z" fill="#A8A7A7" stroke="none" />
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 13.6133C7.5 13.1991 7.83579 12.8633 8.25 12.8633H15.75C16.1642 12.8633 16.5 13.1991 16.5 13.6133C16.5 14.0275 16.1642 14.3633 15.75 14.3633H8.25C7.83579 14.3633 7.5 14.0275 7.5 13.6133Z" fill="#A8A7A7" stroke="none" />
    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.5 17.3633C7.5 16.9491 7.83579 16.6133 8.25 16.6133H15.75C16.1642 16.6133 16.5 16.9491 16.5 17.3633C16.5 17.7775 16.1642 18.1133 15.75 18.1133H8.25C7.83579 18.1133 7.5 17.7775 7.5 17.3633Z" fill="#A8A7A7" stroke="none" />
  </svg>
)

const availableResources = [
  {
    title: "Code Playground",
    tooltipKey: "code-playground-icon",
    redirectKey: "code-playground",
    icon: isMobile() ? <CodePlaygroundMobileIcon /> : <CodePlaygroundIcon />,
    allowedCourses: [PYTHON_COURSE],
    isAllowed: () => shouldCodePlagroundAllowed(),
  },
  {
    title: "Cheat Sheet",
    tooltipKey: "cheatSheet",
    redirectKey: "cheatsheet",
    icon: isMobile() ? <CheatSheetMobileIcon /> : <CheatSheetIcon />,
    allowedCourses: [PYTHON_COURSE],
    isAllowed: () => isCheatSheetAllowed(),
  },
];

class CourseNav extends Component {
  state = {
    open: false,
    close: false,
    isCoursesDropDownVisible: false,
  }

  sortAscending = (data, path) => {
    return data.sort((a, b) => {
      return a[path] - b[path]
    })
  }

  getHomeworkComponents = (sessionTopicId) => {
    if (getCourseName() !== PYTHON_COURSE) {
      let { topics } = this.props
      topics = (topics && topics.toJS()) || []
      const filteredTopic = topics.filter(topic => get(topic, 'id') === sessionTopicId)
      if (filteredTopic && filteredTopic.length) {
        const topicComponentRuleDoc = get(filteredTopic[0], 'topicComponentRule', [])
        return topicComponentRuleDoc.filter(el => get(el, 'componentName') === 'quiz' || get(el, 'componentName') === 'homeworkAssignment')
      }
      return []
    } else {
      return [{ componentName: 'quiz', order: 1 }, { componentName: 'homeworkAssignment', order: 2 }]
    }
  }
  isHomeworkIncluded = (sessionTopicId) => {
    if (getCourseName() !== PYTHON_COURSE) {
      const topicComponentRuleDoc = this.getHomeworkComponents(sessionTopicId)
      let isHomeworkVisible = false
      if (topicComponentRuleDoc && topicComponentRuleDoc.length) {
        topicComponentRuleDoc.forEach(rule => {
          if (rule && (['homeworkAssignment', 'quiz'].includes(get(rule, 'componentName')))) {
            isHomeworkVisible = true
          }
        })
      }
      return isHomeworkVisible
    }
    return true
  }

  renderSessionNavItem = (userCourse, isActive) => {
    let selectedCourse = localStorage.getItem('selectedCourse')
    return userCourse.map(
      (course, i) => this.renderCourseNav(course, selectedCourse, userCourse, i === userCourse.length - 1)
    )
  }

  renderCourseNav = (course, selectedCourse, userCourse, isLastItem) => {
    const activeBatchId = localStorage.getItem("activeClassroom")
    const isMultipleBatch = get(course, 'classroom.id')
    const isCardActive = isMultipleBatch ? activeBatchId === get(course, 'classroom.id') : selectedCourse === get(course, 'courseId')
    const handleCourseChange = () => {
      if (selectedCourse !== get(course, 'id') || (isMultipleBatch && activeBatchId && activeBatchId !== get(course, 'classroom.id'))) {
        const users = store.getState().data.getIn(['user', 'data']).toJS();
        const userParent = store.getState().data.getIn(['userParent', 'data'], List([]))
        const userChildren = store.getState().data.getIn(['userChildren', 'data'], List([]))

        const loggedInUser = users.filter(user => get(user, '__keys').includes('loggedinUser') && get(user, 'token'))
        this.props.dispatch({ type: 'LOGOUT' })
        let newUserCourse = [...userCourse]
        if (isMultipleBatch) {
          newUserCourse = newUserCourse.map(userCourseBatch =>
            get(userCourseBatch, 'classroom.id') === get(course, 'classroom.id') ?
              { ...userCourseBatch, activeClassroom: true } : { ...userCourseBatch, activeClassroom: false })
          localStorage.setItem("activeClassroom", get(course, 'classroom.id'))
        }
        duck.merge(() => ({
          userCourse: newUserCourse,
        }), {
          key: 'userCourse'
        })
        localStorage.setItem('selectedCourse', get(course, 'id'))
        duck.merge(() => ({
          user: loggedInUser,
          userChildren: userChildren.toJS(), userParent: userParent.toJS()
        }), {
          key: 'loggedinUser'
        })
        this.setState({ open: !this.state.open, close: true, isCoursesDropDownVisible: false })
      }
    }

    return (
      <>
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cx(
          'main_navbar_active_drop_item',
          isCardActive
          && 'main_navbar_activeNav'
        )}
        style={isCardActive ? { cursor: 'unset' } : { cursor: 'pointer' }}
        onClick={() => {
          handleCourseChange()
          if (this.props.path !== '/sessions') {
            this.props.history.push('/sessions')
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: 0 }}>
          <div
            className='main_navbar_thumbnail'
            style={{ backgroundImage: `url("${get(course, 'thumbnail.uri') ? getPath(get(course, 'thumbnail.uri')) : 'https://tekie-backend.s3.amazonaws.com/python/Screenshot 2021-12-31 at 7_ckxugylfe00pw106ybgk661mk_1640959572219.png'}")` }}
          />
          <div style={{ width: '100%' }}>
            <div className='main_navbar_course_title'>
              {get(course, 'title')}
            </div>
            {get(course, 'isCourseCompleted') ? (
              <div className='main_navbar_course_completed_tag'>COMPLETED</div>
            ) : (
              <>
                {(get(course, 'currentTopic.title') && !isMultipleBatch) && (
                  <div className='main_navbar_up_next'>
                    <span>UP NEXT</span>
                    <div className='main_navbar_up_next_arrow'>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.30839 10.3572L10.7555 7.89102L8.30839 5.4248M10.4155 7.89102H5.45312" stroke="#A8A7A7" stroke-width="1.18378" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M8.10642 13.8105C11.3742 13.8105 14.0253 11.1593 14.0253 7.89158C14.0253 4.62384 11.3742 1.97266 8.10642 1.97266C4.83868 1.97266 2.1875 4.62384 2.1875 7.89158C2.1875 11.1593 4.83868 13.8105 8.10642 13.8105Z" stroke="#A8A7A7" stroke-width="1.18378" stroke-miterlimit="10" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className='main_navbar_topic_title'>{isMultipleBatch ? <span className='main_coursenavbar_allottedMentor'>{`Teacher: ${get(course, 'allottedMentor.name')}`}</span> : get(course, 'currentTopic.title')}</div>
              </>
            )}
          </div>
        </div>
        <RightArrow active={isCardActive} />
      </motion.div>
      {!isLastItem && <div className={'main_navbar_hrLineCourse'}></div>}
    </>
    )
  }

  checkIfSessionBookedAndHomeworkNotCompleted = () => {
    const { menteeCourseSyllabus, bookSessionProps } = this.props
    let mentorMenteeSession
    let batchSession
    if (bookSessionProps && (bookSessionProps.mentorMenteeSession || bookSessionProps.batchSession)) {
      mentorMenteeSession = bookSessionProps.mentorMenteeSession
      batchSession = bookSessionProps.batchSession
    }
    const sessions = menteeCourseSyllabus && menteeCourseSyllabus.toJS()[0]
    let bookedSession = []
    let completedSession = []
    let shouldHideWarning = false
    if (sessions) {
      bookedSession = get(sessions, 'bookedSession', null) ? this.sortAscending(sessions.bookedSession, ['topicOrder']) : []
      const bookedSessionDate = (bookedSession && bookedSession.length && get(bookedSession[0], 'bookingDate')) ? get(bookedSession[0], 'bookingDate') || null : null
      completedSession = get(sessions, 'completedSession', null) ? this.sortAscending(sessions.completedSession, ['topicOrder']) : []
      if (bookedSession && bookedSession.length && completedSession && completedSession.length) {
        if (mentorMenteeSession && mentorMenteeSession.toJS() && bookedSession[0] && bookedSession[0].topicId) {
          const currentSession = (mentorMenteeSession.toJS() || []).filter(el => el.topic && (el.topic.id === bookedSession[0].topicId))
          if (currentSession && (get(currentSession[0], 'sessionStatus') === 'started')) {
            shouldHideWarning = true
          }
        }
        if (batchSession && bookedSession[0] && bookedSession[0].topicId) {
          const currentBatchSession = filterKey(batchSession, `batchSession/${bookedSession[0].topicId}`)
          if (currentBatchSession && ((currentBatchSession.getIn([0, 'sessionStatus']) === sessionStatus.started) || currentBatchSession.getIn([0, 'isRetakeSession']))) {
            shouldHideWarning = true
          }
        }
        const isSubmittedForReview = get(completedSession[completedSession.length - 1], 'isSubmittedForReview')
        const topicId = get(completedSession[completedSession.length - 1], 'topicId');
        if (this.isHomeworkIncluded(topicId) && (isSubmittedForReview !== true) && !shouldHideWarning && bookedSessionDate && !isPast(new Date(bookedSessionDate))) {
          return true
        }
      }
    }
    return false
  }

  render() {
    const { open } = this.state
    const { path } = this.props.match
    const { fromEventsPage = false } = this.props
    let userCourse = (filterKey(store.getState().data.getIn(['userCourse', 'data']), 'userCourse') || List([])).toJS()
    const shouldShowWarning = this.checkIfSessionBookedAndHomeworkNotCompleted()
    const courseComponentNames = get(this.props.courseDetails, 'courseComponentRule', []).map(el => get(el, 'componentName'))
    const mainCourseCheck = (getCourseName() !== PYTHON_COURSE) && !(shouldCodePlagroundAllowed() || courseComponentNames.some(el => homeworkComponents.includes(el)))
    if (mainCourseCheck && !fromEventsPage) return <></>

    const isElectron = typeof window !== 'undefined' && get(window, 'native.isElectron')
    userCourse = userCourse.filter(course => get(course, 'title'))
    return <></>
    return (
      <div className={cx('cn-container')}>
        <motion.div
          whileTap={{ scale: 0.95 }}
          className={cx('cn-navbar', open ? 'open' : 'close', 'mobile_nav_visible')}
          onClick={() => this.setState({ open: !open, close: true, isCoursesDropDownVisible: false })}
        >
          <div className='cn-navbar-line lines-1'>
            <div className='cn-navbar-line-1'></div>
            <div className='cn-navbar-line-2'></div>
          </div>
          <div className='cn-navbar-line lines-2'>
            <div className='cn-navbar-line-1'></div>
            <div className='cn-navbar-line-2'></div>
          </div>
          <div className='cn-navbar-line lines-3'>
            <div className='cn-navbar-line-1'></div>
            <div className='cn-navbar-line-2'></div>
          </div>
        </motion.div>
        <div className={cx('cn-nav-container', open && 'open', !open && this.state.close && 'close-animation', isElectron && 'cn-nav-container-electron')}>
          <div className='cn-nav-wrapper' style={{
            justifyContent: `${(isMobile() && !this.state.isCoursesDropDownVisible) ? 'flex-end' : 'unset'}`,
            alignItems :`${(isMobile()  && !this.state.isCoursesDropDownVisible)  ? 'flex-start':'center'}`
          }}>
            <div className='cn-nav-bg'></div>
            <div>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <motion.div
                  className='cn-title'
                  transition={{ duration: 0.1 }}
                  animate={open ? { opacity: 1 } : { opacity: 0 }}
                >
                  {getCourseName()}
                </motion.div>
                <div
                  className={cx('cn-navbar', open ? 'open' : 'close', 'mobile_nav_hide')}
                  onClick={() => this.setState({ open: !open, close: true, isCoursesDropDownVisible: false })}
                >
                  <div className='cn-navbar-line lines-1'>
                    <div className='cn-navbar-line-1'></div>
                    <div className='cn-navbar-line-2'></div>
                  </div>
                  <div className='cn-navbar-line lines-2'>
                    <div className='cn-navbar-line-1'></div>
                    <div className='cn-navbar-line-2'></div>
                  </div>
                  <div className='cn-navbar-line lines-3'>
                    <div className='cn-navbar-line-1'></div>
                    <div className='cn-navbar-line-2'></div>
                  </div>
                </div>
              </div>
            </div>
            {!open && (
              <>
                <ReactToolTip
                  id='sessions'
                  place='right'
                  effect='float'
                  multiline={false}
                  className={cx('photon-input-tooltip', 'cn-tooltip')}
                  arrowColor='#00ADE6'
                  textColor='rgba(0, 0, 0, 0.8)'
                />
                <ReactToolTip
                  id='homework'
                  place='right'
                  effect='float'
                  multiline={false}
                  className={cx('photon-input-tooltip', 'cn-tooltip')}
                  arrowColor='#00ADE6'
                  textColor='rgba(0, 0, 0, 0.8)'
                />
                <ReactToolTip
                  id='code-playground-icon'
                  place='right'
                  effect='float'
                  multiline={false}
                  className={cx('photon-input-tooltip', 'cn-tooltip')}
                  arrowColor='#00ADE6'
                  textColor='rgba(0, 0, 0, 0.8)'
                />
                <ReactToolTip
                  id='cheatSheet'
                  place='right'
                  effect='float'
                  multiline={false}
                  className={cx('photon-input-tooltip', 'cn-tooltip')}
                  arrowColor='#00ADE6'
                  textColor='rgba(0, 0, 0, 0.8)'
                />
              </>
            )}
            <span className={cx('navbar_wrapper', open ? 'open' : 'isClose')}>
              <div className='mobile_screen_top_padding'></div>
              <div
                data-for='sessions'
                data-tip='Sessions'
                data-iscapture='true'
                className={cx('cn-navbar-item-shadow', (path === '/sessions' || path === '/sessions/book') ? 'active' : 'not-active')}
                onClick={() => {
                  if (isMobile() && userCourse && userCourse.length > 1) {
                    this.setState((prevState) => {
                      return {
                        isCoursesDropDownVisible: !prevState.isCoursesDropDownVisible
                      }
                    })
                    return;
                  }
                  this.props.history.push(
                    '/sessions'
                  )
                }}
              >
                <div className='cn-navbar-item'>
                  <div className='cn-navbar-icon'>
                    <SessionIcon />
                  </div>
                  <div className='cn-navbar-item-title'>{(isMobile() && userCourse && userCourse.length > 1) ? 'Courses' : 'Sessions'}</div>
                </div>
              </div>
              {(this.state.isCoursesDropDownVisible && isMobile() && userCourse && userCourse.length > 1) ? (
                <AnimateSharedLayout>
                  <motion.div
                    className='main_navbar_drop_course'
                    variants={StaggerAnimationVariants}
                    initial="hidden"
                    animate="visible"
                    layout
                    style={{
                      width: '95%', boxSizing: 'border-box', padding: '20px 0px', overflow: 'scroll'
                    }}
                  >
                    <AnimatePresence>
                      {this.renderSessionNavItem(userCourse, (path === '/sessions' || path === '/sessions/book'))}
                    </AnimatePresence>
                  </motion.div>
                </AnimateSharedLayout>
              ) : null}
              <div
                data-for='homework'
                data-tip='Homework'
                data-iscapture='true'
                style={{ display: mainCourseCheck && fromEventsPage ? 'none' : 'block' }}
                className={cx('cn-navbar-item-shadow', path === '/homework' ? 'active' : 'not-active')} onClick={() => {
                  this.props.history.push(
                    '/homework'
                  )
                }}>
                <div className='cn-navbar-item'>

                  <div className='cn-navbar-icon'>
                    <CourseIcon />
                  </div>

                  <div className='cn-navbar-item-title'>Homework</div>

                  {shouldShowWarning && (
                    <span className={`
                        cn-navbar-warning
                        ${open ? 'open-style' : ''}
                        ${(open && path !== '/homework') ? 'inActive-style' : ''}
                      `}
                    >
                      <AlertIcon />
                      {open ? 'PENDING' : ''}
                    </span>
                  )}

                </div>
              </div>

             
             

              {availableResources && availableResources
                .filter(resource => resource.allowedCourses.includes(getCourseName()) || (resource.isAllowed && resource.isAllowed()))
                .map(resource => (
                  <div
                    data-for={resource.tooltipKey}
                    data-tip={resource.title}
                    data-iscapture='true'
                    className={cx('cn-navbar-item-shadow', 'not-active')}
                    onClick={() => {
                      window.open(`/${resource.redirectKey}`, '_blank', 'noreferrer');
                    }}>
                    <div className='cn-navbar-item'>
                      <div className='cn-navbar-icon'>
                        {resource.icon}
                      </div>
                      <div className='cn-navbar-item-title'>{resource.title}</div>
                    </div>
                  </div>
                ))}
            </span>

            {open && (
              <>
                <div className='horizontal_line'></div>
                <div className='bottom_icons'>
                  <div>
                    <div className='bottom_icon_item' onClick={() => window.fcWidget.open()}>
                      <img className='bottom_icon_img' src={ChatIcon} />
                      Chat with us
                    </div>
                  </div>

                  <div>
                    <div className='bottom_icon_item' onClick={() => {
                      this.props.history.push(
                        '/student-community'
                      )
                    }}>
                      <img className='bottom_icon_img' src={PeopleIcon} />
                      Community Section
                    </div>
                  </div>
                  {/* <div>
                    <div className='bottom_icon_item' onClick={() => {
                      this.props.history.push(
                        '/events/eventsName'
                      )
                    }}>
                      <img className='bottom_icon_img' src={PeopleIcon} />
                      Events
                    </div>
                  </div> */}

                  {this.props.hasMultipleChildren && (
                    <div>
                      <div className='bottom_icon_item' onClick={() => {
                        this.props.history.push(
                          '/switch-account'
                        )
                      }}>
                        <img className='bottom_icon_img' src={SwitchIcon} />
                        Switch Account
                      </div>
                    </div>
                  )}
                  <div>
                    <div className='bottom_icon_item' onClick={() => {
                      this.props.dispatch({ type: 'LOGOUT' })
                    }}>
                      <img alt='logout' className='bottom_icon_img' src={LogoutIcon} />
                      Logout
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default connect()(withRouter(CourseNav));