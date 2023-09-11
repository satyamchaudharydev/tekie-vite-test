import React, { Component } from 'react'
import { get } from 'lodash'
import moment from 'moment'
import CollapsibleTopics from '../../components/CollapsibleTopics/CollapsibleTopics'
import './SessionCoursePage.scss'
import formatDate from '../../utils/date-utils/formateDate'
import getSlotLabel from '../../utils/slots/slot-label'
import BookSession from './components/BookSession'
import CourseCompletedHero from './components/CourseCompletedHero'
import BookSessionPopup from '../../components/BookSession'
import { ChevronLeft } from '../../constants/icons'
import { withRouter } from 'react-router'
import { checkIfEmbedEnabled } from '../../utils/teacherApp/checkForEmbed'
import TopicsSectionHeader from './components/TopicsSectionHeader'
import requestToGraphql from '../../utils/requestToGraphql'
import fetchComponents from '../../queries/fetchComponents'
import getCourseId from '../../utils/getCourseId'
import store from '../../store'
import { withPageRedirectDisabledOnMobile } from '../../utils/isMobile'
import { getInSessionRoute } from '../UpdatedSessions/utils'
import mixpanelTrack from '../../utils/mixpanel-actions'
import { appNames, mixPanelEvents } from '../../constants/mixpanel/mixPanelConst'
import { STUDENT_BASE_URL } from '../../constants/routes/routesPaths'

 class SessionCoursePage extends Component {
  constructor(props){
    super(props);
    this.myFunctionRef = React.createRef();
    this.state={
      selectedCourse:null,
      sessionStatus:'allClasses',
      batchSessions:[],
      bookedOrFirstUpcomingSession:null
    }
  }
  getFormattedDate = () => {
    const { nextSessionToShow, loggedInUser } = this.props
    const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
    const { intlBookingDate, bookingDate, intlSlotTime, slotTime } = nextSessionToShow
    if (bookingDate || intlBookingDate) {
      return country !== 'india'
      ? formatDate(new Date(intlBookingDate)).date
      : formatDate(new Date(bookingDate)).date
    }
    return 'Session Date'
  }
  componentDidMount() {
    this.setSelectedDate()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.loadingPage !== this.props.loadingPage) {
      this.setSelectedDate()
    }
  }

  setSelectedDate() {
    const { allSlots } = this.props
      if (allSlots.length > 0) {
        const bookingDate = get(allSlots, '[0].bookingDate')
        this.props.onDateChange(bookingDate)
      }
  }

  getFormattedTime = () => {
    const { nextSessionToShow, loggedInUser } = this.props
    const country = loggedInUser ? get(loggedInUser.toJS(), 'parent.country') : 'india'
    const { intlBookingDate, bookingDate, intlSlotTime, slotTime } = nextSessionToShow
    if (bookingDate || intlBookingDate) {
      return country !== 'india'
        ? intlSlotTime
        : getSlotLabel(slotTime).startTime
    }
    return 'Session Time'
  }

  getTopicsNestedInChapter = (sessions) => {
    const chapterTopicsMap = {}
    for (const session of sessions) {
      const { chapterTitle, chapterOrder, chapterId, ...topic } = session
      if (chapterTopicsMap[chapterId]) {
        chapterTopicsMap[chapterId].topics.push(topic)
      } else {
        chapterTopicsMap[chapterId] = {
          chapterTitle,
          chapterOrder,
          id: chapterId,
          topics: [topic]
        }
      }
    }
    const chapterTopics = Object.values(chapterTopicsMap)
    return chapterTopics
  }

  renderBookSessionPopup = () => {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        width: '100%',
        zIndex: 9999,
        height: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        transition: '0.3s all ease-in-out',
        opacity: this.props.showBookSession ? 1 : 0,
        pointerEvents: this.props.showBookSession ? 'auto' : 'none',
      }} onClick={() => { this.props.closeBookSession() }}>
        <BookSessionPopup
          visible={this.props.showBookSession}
          slots={this.props.allSlots}
          bookSessionProps={this.props.bookSessionProps} 
          isTrialSession={this.props.isTrialSession}
          loading={this.props.bookSessionPopupLoading}
          selectedDate={this.props.selectedDate.getDate()}
          selectedBookingDate={this.props.selectedDate}
          onDateChange={date => this.props.onDateChange(date)}
          close={this.props.closeBookSession}
          country={this.props.country}
          timezone={this.props.timezone}
          updateTimezone={this.props.updateTimezone}
          onConfirm={(slotTime, date, bookingDate) => {
            const i = get(this.props.allSlots.find(slots => slots.date === date), 'i')
            const slotsOnDate = this.props.getSlotTimeOnDate(moment().add(i, 'days'))
            const slots = slotsOnDate.map(slot => slot.id === slotTime ? ({ ...slot, status: true }) : ({ ...slot, status: false }))
            // const istBookingDate = get(this.props.allSlots.find(slots => slots.date === date), 'istBookingDate')
            if (this.props.editingSession) {
              this.props.onEditClicked(
                slots,
                {
                  date: bookingDate,
                  istDate: bookingDate,
                  time: slotTime,
                }
              )
            } else {
              this.props.onBookClicked(
                slots,
                this.props.topicId,
                {
                  date: bookingDate,
                  istDate: bookingDate,
                  time: slotTime,
                }
              )

            }
          }}
        />
      </div>
    )
  }

  selectCourse=(e)=>{
    this.setState({selectedCourse:e.target.value})
  }

  clearAllSelectedCourses=()=>{
    this.setState({selectedCourse:null})
  }

  filterSessionsBy=(sessionStatus='allClasses')=>{
    this.setState({sessionStatus})
  }

  getSelectedCourseTopics=(courseId='',coursePackage=[])=>{
      if(courseId && coursePackage && coursePackage.length){
        const courses=coursePackage[0].courses
        const course = courses.find(course=>get(course,'id')===courseId)
        return get(course,'topicsData') || []
      }
      return []
  }

  getPercentage=(val1,val2)=>{
    if(val1 && val2) return Math.round(val1*100/val2)
    return 0
  }

  fetchThisTopicData= async (topicId) => {
    await fetchComponents(
      topicId,
      getCourseId(topicId)
    ).classwork()
  }

  goToInSession = async (topicId, revisitSession = false) => {
    const startTime = new Date()
    this.props.startLoadingNavigation()
    await this.fetchThisTopicData(topicId)
    const coursePackageTopicsImmutable = store.getState().data.getIn(['topic', 'data'])
    const coursePackageTopics = coursePackageTopicsImmutable && coursePackageTopicsImmutable.toJS
      ? coursePackageTopicsImmutable.toJS()
      : []
    const courses = this.props.coursePackages && get(this.props.coursePackages[0],'courses')
    
    const mixPanelEvent = revisitSession ? mixPanelEvents.REVISIT_SESSION : mixPanelEvents.START_SESSION;
    mixpanelTrack(mixPanelEvent, { startTime, endTime: new Date() }, appNames.STUDENT_APP)
    withPageRedirectDisabledOnMobile(() => {
      if (
        coursePackageTopics && coursePackageTopics.length &&
        coursePackageTopics.filter(el => el.id ===topicId).length
      ) {
        const topicInfo = coursePackageTopics.find(el => el.id === topicId)
        const thisSession = this.props.allSessions.find(session => session.topicId === topicId)
        const thisCourse = courses.find(course => course.id === get(thisSession, 'course.id'))
        const { redirectUrl } = getInSessionRoute({
          topicComponentRule: get(topicInfo, 'topicComponentRule', []),
          course: thisCourse,
          topicId: topicId,
          forceRevisitRoute: revisitSession
        })
        if (redirectUrl) {
          return this.props.history.push(redirectUrl)
        }
      }
      return this.props.history.push(`${STUDENT_BASE_URL}/revisit/sessions/video/${getCourseId(topicId)}/${topicId}`, {
        revisitingSession: revisitSession
      })
    }, true)
    this.props.stopLoadingNavigation()
  }

  getBookedOrFirstUpcomingSession=(allSessions=[])=>{
    if(allSessions){
      const bookedSession = allSessions.find(session=>get(session,'type')==='booked')
      if(bookedSession) return bookedSession
      const firstUpcomingSession = allSessions.find(session=>get(session,'type')==='upcoming')
      if(firstUpcomingSession) return firstUpcomingSession
    }
    return null
  }

  render() {
    const { isCourseCompleted,loggedInUser,coursePackages,isB2BStudent} = this.props
    const { completedSessions, studentProfile } = this.props.bookSessionProps
    const coursePackageExists = (coursePackages && coursePackages.length)?true:false

    const upComingChapterTopics = this.getTopicsNestedInChapter(
      this.props.allSessions.filter(session => session.type === 'upcoming')
    )
    const completedChapterTopics = this.getTopicsNestedInChapter(
      this.props.allSessions.filter(session => session.type === 'completed')
    )
    const coursePackage = coursePackages && coursePackages[0]

    if (this.props.loadingPage && this.props.match.path !== '/course') {
      return (
        <>
          <BookSession
            {...this.props.bookSessionProps}
            loadingPage={this.props.loadingPage}
            newFlow={this.props.newFlow}
            isB2BStudent={isB2BStudent}
            coursePackageExists={coursePackageExists}
            myFunctionRef={this.myFunctionRef}
          />
        </>
      )
    } 

    return (
      <>
        <div>
          {(isCourseCompleted && (completedSessions && completedSessions.length)) ? (
            !this.props.loggedInUser.get('isMentorLoggedIn') ? (
              <CourseCompletedHero
                userCourseCompletions={this.props.userCourseCompletions}
                userProfile={this.props.userProfile}
                {...this.props.bookSessionProps}
              />
            ) : null
          ) : (
            <BookSession 
              {...this.props.bookSessionProps} 
              goToInSession={this.goToInSession}
              fetchThisTopicData={this.fetchThisTopicData}
              newFlow={this.props.newFlow} 
              firstComponent={this.props.firstComponent}
              previousTopicObj={this.props.previousTopicObj} 
              isB2BStudent={isB2BStudent}
              coursePackageExists={coursePackageExists}
              bookedOrFirstUpcomingSession={this.getBookedOrFirstUpcomingSession(this.props.allSessions)}
              courses={coursePackages && get(coursePackages[0],'courses')}
              myFunctionRef={this.myFunctionRef}
              allSessions={this.props.allSessions}
            />
          )}
          {coursePackageExists && (
            <TopicsSectionHeader
              courseCompletionPercentage={
                this.getPercentage(
                  get(this.props,'completedSessions',[]).length,
                  get(this.props,'allSessions',[]).length
                )
              }
              allSessions={this.props.allSessions}
              coursePackage={coursePackage}
              selectCourse={this.selectCourse}
              selectedCourse={this.state.selectedCourse}
              clearAllSelectedCourses={this.clearAllSelectedCourses}
              filterSessionsBy={this.filterSessionsBy}
              sessionStatus={this.state.sessionStatus}
            />
          )}
          <div className={`sp-container ${isB2BStudent && coursePackageExists && 'mTop'}`}>
            <CollapsibleTopics
              goToInSession={this.goToInSession}
              startLoading={this.props.startLoadingNavigation}
              courses={coursePackages && get(coursePackages[0],'courses')}
              stopLoading={this.props.stopLoadingNavigation}
              menteeCourseSyllabus={this.props.menteeCourseSyllabus && this.props.menteeCourseSyllabus.toJS()}
              sessionStatus={this.state.sessionStatus}
              coursePackageExists={isB2BStudent?coursePackageExists:false}
              isB2BStudent={isB2BStudent}
              topics={get(this.props.bookSessionProps, 'topics', [])}
              courseDetails={this.props.courseDetails}
              isCourseCompleted={isCourseCompleted}
              timezone={this.props.timezone}
              loadingPage={this.props.loadingPage}
              allSessions={this.props.allSessions}
              selectedCourse={this.state.selectedCourse}
              selectedCourseTopics={this.getSelectedCourseTopics(this.state.selectedCourse,coursePackages)}
              upComingChapterTopics={upComingChapterTopics}
              completedChapterTopics={completedChapterTopics}
              studentProfile={studentProfile.toJS()}
              coursePackageTopics={get(this.props.bookSessionProps, 'coursePackageTopics', []) || []}
              batchSessions={this.state.batchSessions}
              handleOnClickRef={this.myFunctionRef.current}
            />
          </div>
        </div>
        {(get(loggedInUser.toJS(), 'routedFromTeacherApp')&&get(loggedInUser.toJS(), 'rawData.role')==='mentor'&&get(loggedInUser.toJS(), 'rawData.secondaryRole')==='schoolTeacher' && !checkIfEmbedEnabled())
        ?
        <button onClick={()=>this.props.switchToTeacherApp()}  className={'goBackToTeacherAppBtn'}><ChevronLeft/>Go back to Teacher app</button>
        :
        <></>}
      </>
    )
  }
}

export default withRouter(SessionCoursePage)
