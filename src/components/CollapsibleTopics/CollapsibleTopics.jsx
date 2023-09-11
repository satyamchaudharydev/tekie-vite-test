import React, { Component } from 'react'
import { motion } from 'framer-motion'
import moment from 'moment'
import cx from 'classnames'
import './CollapsibleTopics.scss'
import getPath from '../../utils/getPath'
import { withRouter } from 'react-router'
import { hs } from '../../utils/size'
import getIntlDateTime from '../../utils/time-zone-diff'
import { isEqual, get, truncate } from 'lodash'
import isMobile from '../../utils/isMobile'
import { getFilteredLoComponentRule, getLORedirectKey } from '../../pages/UpdatedSessions/utils'
import { ArrowForward, CheckmarkCircle } from '../../constants/icons'
import UpdatedButton from '../Buttons/UpdatedButton/UpdatedButton'
import EmptyState from './EmptyState'
import { getDataFromLocalStorage, getDateMonthFormat, setDataInLocalStorage } from '../../utils/data-utils'
import { connect } from 'react-redux'
import getFullPath from '../../utils/getFullPath'
import { getActiveBatchDetail } from '../../utils/multipleBatch-utils'
import { markAttendance } from '../../utils/mmSessionAddOrDelete'
import getMe from '../../utils/getMe'
import { truncateStr } from '../../utils/text/turncate'

const sessionStatusMap={
  started:"upcoming",
  allotted:"upcoming",
  completed:"completed",
}

const ClockIcon = () => (
  <svg width={'100%'} height={'100%'} fill="none" viewBox="0 0 35 35">
    <path
      d="M17.258 33.988c9.385 0 16.994-7.608 16.994-16.994S26.643 0 17.258 0C7.872 0 .264 7.608.264 16.994s7.608 16.994 16.994 16.994z"
      fill="transparent"
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

const LabIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.6666 1.33398H3.33325C2.80282 1.33398 2.29411 1.5447 1.91904 1.91977C1.54397 2.29484 1.33325 2.80355 1.33325 3.33398V10.0007C1.33325 10.5311 1.54397 11.0398 1.91904 11.4149C2.29411 11.7899 2.80282 12.0007 3.33325 12.0007H5.09325L4.70659 12.6673C4.58956 12.87 4.52795 13.0999 4.52795 13.334C4.52795 13.568 4.58956 13.798 4.70659 14.0007C4.82462 14.2051 4.99482 14.3746 5.1998 14.4917C5.40478 14.6088 5.63718 14.6694 5.87325 14.6673H10.1799C10.4137 14.6671 10.6434 14.6054 10.8458 14.4883C11.0482 14.3713 11.2163 14.2031 11.3333 14.0007C11.4503 13.798 11.5119 13.568 11.5119 13.334C11.5119 13.0999 11.4503 12.87 11.3333 12.6673L10.9399 12.0007H12.6666C13.197 12.0007 13.7057 11.7899 14.0808 11.4149C14.4559 11.0398 14.6666 10.5311 14.6666 10.0007V3.33398C14.6666 2.80355 14.4559 2.29484 14.0808 1.91977C13.7057 1.5447 13.197 1.33398 12.6666 1.33398ZM5.84659 13.334L6.66659 12.0007H9.33325L10.1333 13.334H5.84659ZM13.3333 10.0007C13.3333 10.1775 13.263 10.347 13.138 10.4721C13.013 10.5971 12.8434 10.6673 12.6666 10.6673H3.33325C3.15644 10.6673 2.98687 10.5971 2.86185 10.4721C2.73682 10.347 2.66659 10.1775 2.66659 10.0007V9.33398H13.3333V10.0007ZM13.3333 8.00065H2.66659V3.33398C2.66659 3.15717 2.73682 2.9876 2.86185 2.86258C2.98687 2.73756 3.15644 2.66732 3.33325 2.66732H12.6666C12.8434 2.66732 13.013 2.73756 13.138 2.86258C13.263 2.9876 13.3333 3.15717 13.3333 3.33398V8.00065Z" fill="#A8A7A7" />
  </svg>
)
const TheoryIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.5 2.50001C3.52634 2.50928 4.93878 2.76402 5.88879 3.21791C6.81018 3.65813 7.30362 4.28714 7.51531 5.12279C7.57151 5.34463 7.77115 5.5 8 5.5C8.22885 5.5 8.42849 5.34463 8.48469 5.12279C8.69638 4.28714 9.18983 3.65813 10.1112 3.21791C11.0612 2.76402 12.4737 2.50927 14.5 2.5V11.5C10.891 11.5 9.11854 12.1469 7.99996 13.2528C6.88527 12.152 5.11044 11.5011 1.50936 11.5C1.5051 11.489 1.5 11.4695 1.5 11.4397V2.50001ZM1.1179 1.57526C1.23968 1.52509 1.37018 1.49951 1.50189 1.50001L1.50225 1.50001C3.58627 1.50935 5.17314 1.76772 6.31989 2.31561C7.06575 2.67197 7.62047 3.14907 8 3.74087C8.37954 3.14907 8.93426 2.67197 9.68012 2.31561C10.8269 1.76772 12.4137 1.50935 14.4978 1.50001L14.4981 1.50001C14.6298 1.49951 14.7603 1.52509 14.8821 1.57526C15.0039 1.62543 15.1145 1.69921 15.2077 1.79234C15.3008 1.88548 15.3746 1.99612 15.4247 2.1179C15.4748 2.2393 15.5003 2.36938 15.5 2.50069V11.5C15.5 11.7652 15.3946 12.0196 15.2071 12.2071C15.0196 12.3946 14.7652 12.5 14.5 12.5C10.5592 12.5 9.20449 13.2947 8.39045 14.3123C8.29554 14.431 8.15183 14.5 7.99989 14.5C7.84795 14.5 7.70428 14.4309 7.60942 14.3122C6.8009 13.3005 5.44051 12.5 1.5 12.5C1.19841 12.5 0.934482 12.3723 0.75352 12.1598C0.578866 11.9546 0.500004 11.6943 0.500004 11.4397V2.50079C0.499653 2.36945 0.525226 2.23934 0.575259 2.1179C0.625433 1.99612 0.699212 1.88548 0.792344 1.79234C0.885477 1.69921 0.996121 1.62543 1.1179 1.57526Z" fill="#A8A7A7" />
    <path fill-rule="evenodd" clip-rule="evenodd" d="M8 4.5C8.27614 4.5 8.5 4.72386 8.5 5V14C8.5 14.2761 8.27614 14.5 8 14.5C7.72386 14.5 7.5 14.2761 7.5 14V5C7.5 4.72386 7.72386 4.5 8 4.5Z" fill="#A8A7A7" />
  </svg>
)

const LockedIcon = () => (
  <svg width='100%' height='100%' viewBox="0 0 113 113" fill="none">
    <path
      d="M74.189 45.882V24.915a17.656 17.656 0 00-35.312 0v20.967"
      stroke="#F4BF00"
      strokeWidth={9.416}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M81.235 45.884H31.797c-5.85 0-10.593 4.743-10.593 10.593v38.844c0 5.851 4.743 10.594 10.593 10.594h49.438c5.85 0 10.594-4.743 10.594-10.594V56.478c0-5.851-4.743-10.594-10.594-10.594z"
      fill="#F4BF00"
      stroke="#F4BF00"
      strokeWidth={9.416}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
const MobileLockedIcon = () => (
  <svg width='100%' height='100%' viewBox="0 0 113 113" fill="none">
    <path
      d="M74.189 45.882V24.915a17.656 17.656 0 00-35.312 0v20.967"
      stroke="#F9E73F"
      strokeWidth={9.416}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M81.235 45.884H31.797c-5.85 0-10.593 4.743-10.593 10.593v38.844c0 5.851 4.743 10.594 10.593 10.594h49.438c5.85 0 10.594-4.743 10.594-10.594V56.478c0-5.851-4.743-10.594-10.594-10.594z"
      fill="#F9E73F"
      stroke="#F9E73F"
      strokeWidth={9.416}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const NewTopicCard = ({ timezone, topic, onRevisitClick,bookedSession,firstUpcomingChapterTopic,handleOnClickRef, sessionStatus, onStartClass, fromTeacherApp = false }) => {
  let breakPoint = isMobile()
  const timezoneCopy = timezone
    ? timezone
    : timezone === 'null'
      ? 'Asia/Kolkata'
      : 'Asia/Kolkata'
  const isTopicCompleted=get(topic,'type')==='completed'

  const showStartClassBtn=({isTopicCompleted,topic,bookedSession,firstUpcomingChapterTopic})=>{
    if (sessionStatus === 'started') {
      return true
    }
    return false
  }

  const sessionEndDate = get(topic, 'batchSession.sessionEndDate')

  const shouldShowStartClassBtn = showStartClassBtn({isTopicCompleted,topic,bookedSession,firstUpcomingChapterTopic,sessionStatus})

  return (
    <div className={`newcard-container ${isTopicCompleted && 'completed-class'} ${!isTopicCompleted && 'not-hover'} ${fromTeacherApp && 'newcard-container-teacher-app'}`}>
      {isTopicCompleted && getFullPath(get(topic,'topicThumbnailSmall.uri')) && (
        <div 
          className='card-bg-image'
          style={{
            backgroundImage: `url(${getFullPath(get(topic,'topicThumbnailSmall.uri'))})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat'
          }}>
        </div>
      )}
      <div className='newcard-content-and-icon-container'>
        <div>
          <h4 title={topic.topicTitle} className='newcard-topic-heading'>{get(topic,'i')} - {truncateStr(get(topic, 'topicTitle', ''),30)}</h4>
          {isTopicCompleted && sessionEndDate && <p className='newcard-topic-description'><span className='checkmark-container'><CheckmarkCircle height={hs(20)} width={hs(20)} color='white' /></span> {getDateMonthFormat(sessionEndDate)}</p>}
          {!isTopicCompleted && <p className='newcard-topic-description with-hover' title={shouldShowStartClassBtn && topic.topicDescription}>{shouldShowStartClassBtn ? truncate(topic.topicDescription, { length: 50  }) : topic.topicDescription}</p>}
        </div>
        {get(topic,'topicThumbnailSmall.uri')?<div className='icon-container'>
          <img src={getFullPath(get(topic,'topicThumbnailSmall.uri'))} width='100%' alt="topic-icon"/>
        </div>:null}
      </div>
      {isTopicCompleted && <div className='newcard-btn-container'>
        <UpdatedButton onBtnClick={onRevisitClick} text='Revisit Class' widthFull rightIcon>
          <ArrowForward color='white' />
        </UpdatedButton>
      </div>}
      {<div className='newcard-startBtn-container'>
        <UpdatedButton onBtnClick={onStartClass} text='Go to Class' widthFull rightIcon>
          <ArrowForward color='white' />
        </UpdatedButton>
      </div>}
    </div>
  )
}

const TopicCard = ({ timezone, topic, onRevisitClick }) => {
  let breakPoint = isMobile()
  const timezoneCopy = timezone
    ? timezone
    : timezone === 'null'
      ? 'Asia/Kolkata'
      : 'Asia/Kolkata'
  return <div className={cx('cp-topic-card withBoxShadow', (topic.classType === 'theory' || topic.type !== 'completed') && 'cp-topic-card-disabled')}>
    <div className='cp-topic-card-thumb'>
      <div className='cp-topic-order'>{topic.i}</div>
      <div style={{
        width: '35%',
        height: '90%',
        marginTop: '0.67vw',
        backgroundImage: `url("${topic.topicThumbnailSmall && getPath(topic.topicThumbnailSmall.uri)}")`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        position: 'absolute',
        right: '3%',
        borderRadius: '5px'
      }}>
      </div>
      {topic.type !== 'completed' && (
        <div className='cp-topic-thumb-overlay'>
          <div className='cp-topic-thumb-completed-icon'>{breakPoint ?
            <MobileLockedIcon /> :
            <LockedIcon />}
          </div>
        </div>
      )}
    </div>
    <div className='cp-topic-card-body'>
      <div className='cp-topic-card-title-container'>
        <div className='cp-topic-card-title'>{breakPoint ? `${topic.i.toString().padStart(2, '0')}. ` : ''}{topic.topicTitle}</div>
        <div className='cp-topic-classType-icon'>
          {topic.classType === 'theory' ? (
            <TheoryIcon />
          ) : (
            <LabIcon />
          )}
        </div>
      </div>
      {topic.bookingDate ? (
        <>
          <div className='cp-top-card-line'></div>
          <div style={{ display: 'flex', flexDirection: 'row', margin: '0 auto' }}>
            <div className='cp-clock-icon'>
              <ClockIcon />
            </div>
            <div className='cp-topic-card-description' style={{ marginTop: 0 }}>
              {getIntlDateTime(topic.bookingDate, topic.slotTime, timezoneCopy).intlTime.toLowerCase()}
              {' | '}
              {moment(getIntlDateTime(topic.bookingDate, topic.slotTime, timezoneCopy).intlDateObj).format('ddd')}
              {' | '}
              {moment(getIntlDateTime(topic.bookingDate, topic.slotTime, timezoneCopy).intlDateObj).format('DD MMMM')}
            </div>
          </div>
        </>
      ) : (
        <div className='cp-topic-card-description'>{topic.topicDescription}</div>
      )}
    </div>
  </div>
}

const CollapsibleChapter = (props) => {
  const renderArrow = () => {
    return (
      <svg width='100%' height='100%' viewBox="0 0 24 15" fill="none">
        <path
          d="M22 2.438L11.876 12.562 1.75 2.438"
          stroke="#000"
          strokeWidth={3.375}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  let breakPoint = isMobile()

  const renderTopicCard = (topic, onRevisitClick,onStartClass) => {
    const timezone = props.timezone
      ? props.timezone
      : props.timezone === 'null'

        ? 'Asia/Kolkata'
        : 'Asia/Kolkata'
        if(props.isB2BStudent) return (
          <NewTopicCard
            key={topic.topicId}
            sessionStatus={topic.sessionStatus}
            timezone={timezone}
            topic={topic}
            onRevisitClick={onRevisitClick}
            onStartClass={onStartClass}
            firstUpcomingChapterTopic={props.firstUpcomingChapterTopic}
            bookedSession={props.bookedSession}
            handleOnClickRef={props.handleOnClickRef}
            fromTeacherApp={get(props, 'fromTeacherApp') || false}
          />
        )

    return (
      <motion.div
        className={cx('cp-topic-card', (topic.classType === 'theory' || topic.type !== 'completed') && 'cp-topic-card-disabled')}
        initial={props.isOpen ? { opacity: 1 } : { opacity: 0 }}
        animate={props.isOpen ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4 }}
        style={topic.type === 'completed' && topic.classType !== 'theory' && { cursor: 'pointer' }}
        onClick={() => {
          if (topic.type === 'completed' && topic.classType !== 'theory') {
            onRevisitClick()
          }
        }}
      >
       <TopicCard timezone={timezone} topic={topic} onRevisitClick={onRevisitClick}/>
      </motion.div>
    )
  }

  const collapsibleBody = {
    close: {
      height: 0,
      y: 10,
      scale: 0.9,
      opacity: 0,
      pointerEvents: 'none',
      marginBottom: 0,
      marginTop: hs(16)
    },
    open: {
      height: 'auto',
      y: 0,
      scale: 1,
      opacity: 1,
      pointerEvents: 'auto',
      marginBottom: hs(24),
      marginTop: 0
    }
  }

  const getNextLoComponent = (firstComponent) => {
    let LoRedirectKey = 'comic-strip'
    const filteredLoComponentRule = getFilteredLoComponentRule(get(firstComponent, 'learningObjective'), get(props.courseDetails, 'defaultLoComponentRule', []), (get(firstComponent, 'learningObjectiveComponentsRule', []) || []))
    if (filteredLoComponentRule && filteredLoComponentRule.length) {
      LoRedirectKey = getLORedirectKey(filteredLoComponentRule[0])
    }
    return LoRedirectKey
  }

  const { chapter, chapterOrder,sessionStatus } = props
  if (chapter && chapterOrder === 1 && chapter.topics && chapter.topics.length < 1 && props.upComingActive) {
    return <></>
  }
  const topicsFilteredBySessionStatus=chapter.topics.filter(topic=>sessionStatus==='allClasses'?true:sessionStatusMap[get(topic,'type')]===sessionStatus)

  if(topicsFilteredBySessionStatus.length===0) return null
  return (
    <>
      {props.chapterOrder!==1 && <div className='cp-line'></div>}
      {(props.isOnlyOne && props.isBatch !== null) ? <></> : (
        <div className={`cp-collapsible-container ${get(props, 'fromTeacherApp') && 'cp-collapsible-container-teacherApp'}`} onClick={() => props.openCard(props.id)}>
          <div className='cp-collapsible-title' style={breakPoint ? { fontWeight: 'bold' } : { fontWeight: 'normal' }} >Chapter {chapterOrder}: <span style={{ fontWeight: 'bold' }}>{chapter.chapterTitle}</span></div>
          <motion.div
            className='cp-collapsible-arrow'
            initial={{ rotate: '0deg' }}
            transition={{ duration: 0.1 }}
            animate={{
              rotate: props.isOpen ? '-180deg' : '0deg'
            }}
          >
            {renderArrow()}
          </motion.div>
        </div>
      )}
      <motion.div
        className={`cp-collapsible-body ${get(props, 'fromTeacherApp') && 'cp-collapsible-body-teacherApp'}`}
        transition={{ duration: 0.3, delay: 0.1 }}
        initial={props.isOpen ? collapsibleBody.open : collapsibleBody.close}
        animate={props.isOpen ? collapsibleBody.open : collapsibleBody.close}
      >
        {topicsFilteredBySessionStatus.map((topic, topicOrder) => {
          return (
            renderTopicCard(topic, ()=> props.revisitClass(topic,topicOrder), () => props.onStartClass(topic, topicOrder))
          )
        })}
      </motion.div>
    </>
  )
}

class CollapsibleTopics extends Component {
  state = {
    chapters: [],
    upComingActive: true,
  }

  componentDidMount() {
    this.onMount()
  }


  filteredChaptersForSelectedCourse = ({allSessions = [], selectedCourseTopics = [],sessionStatus}) => {
    // let selectedCourseTopicsMap = {};
    // if (selectedCourseTopics && allSessions) {
    //   selectedCourseTopics.forEach(topic => selectedCourseTopicsMap[get(topic, 'id')] = get(topic, 'id'))
    // }
    const filteredSessions = allSessions.filter(session => get(session, 'course.id') === this.props.selectedCourse)
    //now we collect all topics under a chapter in one object
    const newData = {}
    filteredSessions.forEach(session => {
      const { chapterId, chapterOrder, chapterTitle } = session;
      if (newData[chapterId]) {
        newData[chapterId] = { ...newData[chapterId], topics: [...newData[chapterId].topics, session] }
        return;
      }
      newData[chapterId] = {
        chapterOrder,
        chapterTitle,
        id: chapterId,
        isOpen: false,
        topics: [session]
      }
    });

    let filteredChapters = Object.values(newData);
    return filteredChapters
  }

  noCompletedSessionsInSelectedCourse=(chaptersOfSelectedCourse = [])=>{
    if (chaptersOfSelectedCourse) {
      const someTopicCompleted =  chaptersOfSelectedCourse.some(chapter => get(chapter,'topics',[]).some(topic=>get(topic,'type')==='completed'))
      return someTopicCompleted?false:true
    }
    return true
  }

  noUpcomingSessionsInSelectedCourse=(chaptersOfSelectedCourse = [])=>{
    if (chaptersOfSelectedCourse) {
      const someTopicUpcoming =  chaptersOfSelectedCourse.some(chapter => get(chapter,'topics',[]).some(topic=>sessionStatusMap[get(topic,'type')]==='upcoming'))
      return someTopicUpcoming?false:true
    }
    return true
  }

  onMount() {
    this.setState({
      chapters: this.props.upComingChapterTopics.map((chapter, i) => i === 0
        ? ({ ...chapter, isOpen: true })
        : ({ ...chapter, isOpen: false })
      ) 
    })
    if (this.props.isCourseCompleted) {
      this.setState({
        upComingActive: false
      })
    }
    const isUpcomingEmpty = this.props.upComingChapterTopics.length === 0
    if (isUpcomingEmpty) {
      this.setState({
        upComingActive: false,
        chapters: this.props.completedChapterTopics.map((chapter, i) => i === 0
          ? ({ ...chapter, isOpen: true })
          : ({ ...chapter, isOpen: false }))
      })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if((prevProps.sessionStatus !== this.props.sessionStatus) || (prevProps.selectedCourse !==this.props.selectedCourse)){
      
        if(this.noCompletedSessionsInSelectedCourse(this.filteredChaptersForSelectedCourse({allSessions:this.props.allSessions,selectedCourseTopics :this.props.selectedCourseTopics,sessionStatus:this.props.sessionStatus})) && this.props.sessionStatus==='completed'){

          this.setState({chapters:[]})

        }else if(this.noUpcomingSessionsInSelectedCourse(this.filteredChaptersForSelectedCourse({allSessions:this.props.allSessions, selectedCourseTopics :this.props.selectedCourseTopics,sessionStatus:this.props.sessionStatus})) && this.props.sessionStatus==='upcoming'){

          this.setState({chapters:[]})

        }else{
          this.setState({
            chapters: this.filteredChaptersForSelectedCourse({allSessions:this.props.allSessions, selectedCourseTopics :this.props.selectedCourseTopics,sessionStatus:this.props.sessionStatus}).map((chapter, i) => i === 0
              ? ({ ...chapter, isOpen: true })
              : ({ ...chapter, isOpen: false })
            )
          })
        }
    }
  
    if (this.props.isB2BStudent) return
    const isUpcomingEmpty = this.props.upComingChapterTopics.length === 0
    let { upComingActive } = this.state.upComingActive
    if (isUpcomingEmpty && this.state.upComingActive) {
      this.setState({ upComingActive: false })
      upComingActive = false
    }
    if (
      !isEqual(get(this.props, 'upComingChapterTopics'), get(prevProps, 'upComingChapterTopics')) ||
      !isEqual(get(this.props, 'completedChapterTopics'), get(prevProps, 'completedChapterTopics'))
    ) {
      this.onMount()
    }

    if (prevProps.loadingPage !== this.props.loadingPage) {
      if (upComingActive) {
        this.setState({
          chapters:
            this.props.upComingChapterTopics.map((chapter, i) => i === 0
              ? ({ ...chapter, isOpen: true })
              : ({ ...chapter, isOpen: false })
            )
        })
      } else {
        this.setState({
          chapters:
            this.props.completedChapterTopics.map((chapter, i) => i === 0
              ? ({ ...chapter, isOpen: true })
              : ({ ...chapter, isOpen: false })
            )
        })
      }
    }
    if (prevState.upComingActive !== this.state.upComingActive) {
      if (this.state.upComingActive) {
        this.setState({
          chapters:
            this.props.upComingChapterTopics.map((chapter, i) => i === 0
              ? ({ ...chapter, isOpen: true })
              : ({ ...chapter, isOpen: false })
            )
        })
      } else {
        this.setState({
          chapters:
            this.props.completedChapterTopics.map((chapter, i) => i === 0
              ? ({ ...chapter, isOpen: true })
              : ({ ...chapter, isOpen: false })
            )
        })
      }
    }
  }

  openCard = (id) => {
    const chapter = this.state.chapters.find(c => (c.id === id) && c.isOpen);
    if (chapter) {
      this.setState({ chapters: this.state.chapters.map(chapter => ({ ...chapter, isOpen: false })) })
    } else {
      this.setState({
        chapters: this.state.chapters.map(chapter => chapter.id === id
          ? { ...chapter, isOpen: true }
          : { ...chapter, isOpen: false }
        )
      })
    }
  }

  getSessionsFilteredByStatus = (sessionStatus = 'allClasses', sessions = []) => {
    if (sessions) {
      if (sessionStatus === 'allClasses') return sessions
      return sessions.filter(session => sessionStatusMap[session.type] === sessionStatus)
    }
    return []
  }

  getSessionEndDateMap=(batchSessions=[])=>{
      const idAndEndDateMap={}
      for(let i=0;i<batchSessions.length;i++){
        const session=batchSessions[i]
        if(get(session,'sessionEndDate')){
          idAndEndDateMap[get(session,'topicData.id')]=get(session,'sessionEndDate')
        }
      }
      return idAndEndDateMap
  }
  setActiveBatchSessionId = (topic) => {
    const currentSessionId = getDataFromLocalStorage('currentSessionId')
    if (!currentSessionId || currentSessionId !== get(topic, 'batchSession.id')) {
        setDataInLocalStorage('currentSessionId', get(topic, 'batchSession.id'))
    }
  }
  revisitClass = async (topic) => {
    this.setActiveBatchSessionId(topic)
    this.props.goToInSession(get(topic, 'topicId'), true)
  }

  onStartClass = async (topic) => {
    this.setActiveBatchSessionId(topic)
    this.props.goToInSession(get(topic, 'topicId'), false)
    const studentProfileId = get(getMe().thisChild, 'studentProfile.id')
    markAttendance(get(topic, 'batchSession.id'), studentProfileId)

  }

  render() {
    const { upComingActive,chapters } = this.state
    const { studentProfile, allSessions, selectedCourse, isB2BStudent, coursePackageExists, sessionStatus, menteeCourseSyllabus, batchSessions, loadingPage } = this.props
    const labSessions = allSessions && allSessions.length && allSessions.filter(session => get(session, 'classType') !== 'theory')
    const isBatch = get(getActiveBatchDetail(get(studentProfile, '[0].batch')), 'id', null)
    const bookedSession=menteeCourseSyllabus && get(menteeCourseSyllabus[0],'bookedSession') &&  get(menteeCourseSyllabus[0],'bookedSession[0]')
    const sessionEndDateMap=this.getSessionEndDateMap(batchSessions)
    if(loadingPage) return null
    return (
      <div>
        <div className={`cp-container ${get(this.props, 'fromTeacherApp') && 'cp-container-teacher-app'}`}>
          {(this.props.completedChapterTopics.length > 0 && this.props.upComingChapterTopics.length > 0 && !isB2BStudent) ? (
            <div className='cp-tab-container'>
              <div
                className={cx('cp-tab', !upComingActive && 'not-active')}
                onClick={() => { this.setState({ upComingActive: true }) }}
              >
                <div className='cp-tab-text'>UPCOMING</div>
                <div className='cp-tab-underline'></div>
              </div>
              <div
                className={cx('cp-tab', upComingActive && 'not-active')}
                onClick={() => { this.setState({ upComingActive: false }) }}
              >
                <div className='cp-tab-text'>COMPLETED</div>
                <div className='cp-tab-underline'></div>
              </div>
            </div>
          ):null}
          {(isB2BStudent && coursePackageExists && !selectedCourse)
            ? (<div className={`allSessionsContainer ${get(this.props, 'fromTeacherApp') && 'allSessionsContainer-teacher-app'}`}>
                {
                  this.getSessionsFilteredByStatus(sessionStatus, labSessions).map(session => (
                    <NewTopicCard
                      key={session.topicId}
                      sessionStatus={session.sessionStatus}
                      onStartClass={()=>this.onStartClass(session)}
                      sessionEndDate={sessionEndDateMap[get(session,'topicId')]}
                      onRevisitClick={()=>this.revisitClass(session)}
                      firstUpcomingChapterTopic={get(this.props,'upComingChapterTopics[0].topics[0]')}
                      bookedSession={bookedSession}
                      topic={session}
                      handleOnClickRef={this.props.handleOnClickRef}
                      fromTeacherApp={get(this.props, 'fromTeacherApp') || false}
                    />))
                }
              </div>
              )
            : null 
          }
          {
            (chapters.length===0 && sessionStatus==='completed' && selectedCourse)?<div>
              <EmptyState text={'Uh-oh! No classes have been completed.'}/>
            </div>:null
          }
          {
            (chapters.length===0 && sessionStatus==='upcoming' && selectedCourse)?<div>
              <EmptyState text={'Yayy! You have completed all classes in this course.'}/>
            </div>:null
          }
          {
            (chapters.length===0 && sessionStatus==='allClasses'&& selectedCourse)?<div>
              <EmptyState text={'Uh-oh! No chapters here.'}/>
            </div>:null
          }
          {((isB2BStudent && coursePackageExists && chapters.length)?selectedCourse:true) && chapters.map((chapter, idx) => (
            <CollapsibleChapter
              {...this.props}
              sessionStatus={sessionStatus}
              isOpen={chapter.isOpen}
              chapter={chapter}
              revisitClass={this.revisitClass}
              onStartClass={this.onStartClass}
              upComingActive={upComingActive}
              chapterOrder={idx + 1}
              id={chapter.id}
              openCard={this.openCard}
              isOnlyOne={selectedCourse?false:chapters.length === 1}
              isBatch={isBatch}
              isB2BStudent={isB2BStudent}
              firstUpcomingChapterTopic={
                this.props.upComingChapterTopics[0] &&
                this.props.upComingChapterTopics[0].topics[0]
              }
              bookedSession={bookedSession}
              fromTeacherApp={get(this.props, 'fromTeacherApp') || false}
            />
          ))}
        <div className={`cp-line sessions-page-mixpanel-identifier ${get(this.props, 'fromTeacherApp') && 'cp-line-teacher-app'}`}></div>
        </div>
      </div>

    )
  }
}

export default connect((state)=>({
  topic: state.data.getIn(['topic','data'])
}))(withRouter(CollapsibleTopics))
