import React, { Component } from 'react'
import { motion } from 'framer-motion'
import cx from 'classnames'
import './Collapsible.scss'
import ReactToolTip from 'react-tooltip'
import getPath from '../../../../utils/getPath'
import getCourseId, { getCourseName } from '../../../../utils/getCourseId'
import { withRouter } from 'react-router'
import { get, sortBy } from 'lodash'
import { hs } from '../../../../utils/size'
import getMasteryLabel from '../../../../utils/getMasteryLabels'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import isMobile from '../../../../utils/isMobile'
import CurrentHomework from '../CurrentHomework'
import { filteredComponentsLink } from '../../../../components/NextFooter/utils'
import { QUIZ_REPORT_URL } from '../../../../constants/routes/routesPaths'

const CalendarIcon = () => (
  <svg width={'100%'} height={'100%'} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.4219 1.5625H15.625V0.625C15.625 0.279844 15.3452 0 15 0C14.6548 0 14.375 0.279844 14.375 0.625V1.5625H5.625V0.625C5.625 0.279844 5.3452 0 5 0C4.6548 0 4.375 0.279844 4.375 0.625V1.5625H2.57812C1.15652 1.5625 0 2.71902 0 4.14062V17.4219C0 18.8435 1.15652 20 2.57812 20H17.4219C18.8435 20 20 18.8435 20 17.4219V4.14062C20 2.71902 18.8435 1.5625 17.4219 1.5625ZM2.57812 2.8125H4.375V3.4375C4.375 3.78266 4.6548 4.0625 5 4.0625C5.3452 4.0625 5.625 3.78266 5.625 3.4375V2.8125H14.375V3.4375C14.375 3.78266 14.6548 4.0625 15 4.0625C15.3452 4.0625 15.625 3.78266 15.625 3.4375V2.8125H17.4219C18.1542 2.8125 18.75 3.40828 18.75 4.14062V5.625H1.25V4.14062C1.25 3.40828 1.84578 2.8125 2.57812 2.8125ZM17.4219 18.75H2.57812C1.84578 18.75 1.25 18.1542 1.25 17.4219V6.875H18.75V17.4219C18.75 18.1542 18.1542 18.75 17.4219 18.75Z" fill="#A8A7A7" />
  </svg>
)

const CollapsibleTopic = (props) => {
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

  const getHomeworkStatus = (topic) => {
    const {
      isQuizSubmitted,
      isAssignmentSubmitted,
      isPracticeSubmitted,
      isSubmittedForReview,
    } = topic
    if ((isQuizSubmitted || isAssignmentSubmitted || isPracticeSubmitted) && isSubmittedForReview) {
      return {
        status: 'completed',
        description: 'Completed',
        color: '#65DA7A',
        btnTitle: 'review',
      }
    } else if (isQuizSubmitted || isAssignmentSubmitted || isPracticeSubmitted) {
      return {
        status: 'inProgress',
        description: 'In Progress',
        color: '#FAAD14',
        btnTitle: 'continue',
      }
    } else {
      return {
        status: 'notStarted',
        description: 'Not yet started',
        color: '#D34B57',
        btnTitle: 'Start Now',
      }
    }
  }

  const getIsComponentSubmitted = (componentName, topic) => {
    const { isQuizSubmitted, isAssignmentAttempted, isPracticeSubmitted } = topic
    if (componentName === 'homeworkAssignment') {
      return isAssignmentAttempted
    } else if (componentName === 'quiz') {
      return isQuizSubmitted
    } else if (componentName === 'homeworkPractice') {
      return isPracticeSubmitted
    }
    return false
  }

  const getComponentRender = (componentName, topic) => {
    const { topicId } = topic
    const { questionsLength, assignmentsLength, practiceLength } = props.getTopicQuestionsMeta(topicId)
    if (componentName === 'quiz') {
      return (
        <>
          Quiz {questionsLength ? (`(${questionsLength} MCQs)`) : ''}
        </>
      )
    } else if (componentName === 'homeworkPractice') {
      return (
        <>
          Practice {practiceLength ? (`(${practiceLength} questions)`) : ''}
        </>
      )
    }
    return (
      <>
        Coding Assignment {assignmentsLength ? (`(${assignmentsLength} questions)`) : ''}
      </>
    )
  }

  const renderTopicCard = (topic, topicOrder, startNavigation, stopNavigation) => {
    const timezone = props.timezone
      ? props.timezone
      : props.timezone === 'null'
        ? 'Asia/Kolkata'
        : 'Asia/Kolkata'
    const {
      isQuizSubmitted,
      topicId,
      isAssignmentSubmitted,
      isPracticeSubmitted,
      quizSubmitDate,
      assignmentSubmitDate,
      practiceSubmitDate,
    } = topic


    let date
    const { quizReport: latestQuizReport } = (props.getFirstOrLatestQuizReports('desc') || []).filter(el => el.topic.id === topicId)[0] || { quizReport: {} }
    let homeworkComponents = props.getHomeworkComponents(topicId)
    const homeworkStatus = getHomeworkStatus(topic, homeworkComponents)

    if (homeworkComponents && homeworkComponents.filter(el => el.componentName === 'homeworkPractice').length >= 2) {
      homeworkComponents = homeworkComponents.slice(0, homeworkComponents.findIndex(el => get(el, 'componentName') === 'homeworkPractice') + 1)
    }

    if (quizSubmitDate && assignmentSubmitDate && practiceSubmitDate) {
      date = new Date(quizSubmitDate).setHours(0, 0, 0, 0) > new Date(assignmentSubmitDate).setHours(0, 0, 0, 0)
        ? new Date(quizSubmitDate)
        : new Date(assignmentSubmitDate)
      date = new Date(date).setHours(0, 0, 0, 0) > new Date(practiceSubmitDate).setHours(0, 0, 0, 0)
        ? new Date(date)
        : new Date(practiceSubmitDate)
    } else if (quizSubmitDate && assignmentSubmitDate) {
      date = new Date(quizSubmitDate).setHours(0, 0, 0, 0) > new Date(assignmentSubmitDate).setHours(0, 0, 0, 0)
        ? new Date(quizSubmitDate)
        : new Date(assignmentSubmitDate)
    } else if (quizSubmitDate) {
      date = new Date(quizSubmitDate)
    } else if (assignmentSubmitDate) {
      date = new Date(assignmentSubmitDate)
    } else if (practiceSubmitDate) {
      date = new Date(practiceSubmitDate)
    }

    const currentTopicSessionIndex = sortBy((props.allSessions || []), 'order').findIndex(el => el.order === topic.order)
    const nextTopicSession = sortBy((props.allSessions || []), 'order')[currentTopicSessionIndex + 1] || {}
    let timeStampObj = { label: 'Last attempted on ', date: date ? format(date, 'dd/MM/yyyy') : '' }
    if (homeworkStatus.status === 'completed') {
      timeStampObj = { label: 'Submitted on ', date: date ? format(date, 'dd/MM/yyyy') : '' }
    } else if ((homeworkStatus.status === 'notStarted') && nextTopicSession && nextTopicSession.sessionEndDate && isPast(new Date(nextTopicSession.sessionEndDate))) {
      timeStampObj = {
        label: 'Overdue for ',
        date: formatDistanceToNow(new Date(nextTopicSession.sessionEndDate), { addSuffix: false })
      }
    }

    const onHomeworkClick = (homeworkComponents) => {
      if (get(props, 'fromTeacherApp', 'false')) return props.handleSolve(topicId)
      const isQuizExists = homeworkComponents.filter(el => el.componentName === 'quiz').length
      const courseId = getCourseId(topicId)
      if (isQuizExists && homeworkStatus.status === 'completed') {
        props.history.push(`${QUIZ_REPORT_URL}/${courseId}/${topicId}`)
        return
      }
      const getFirstComponentLink = (filteredComponentsLink({ topicId, isRevisit: '', classwork: false }).getFirstComponentRule.link)
      props.history.push(getFirstComponentLink)
        
    
    }

    return (
      <motion.div
        className={`ph-topic-card ${get(props, 'fromTeacherApp', 'false') ? `ph-topic-card-teacherApp` : ''}`}
        initial={props.isOpen ? { opacity: 1 } : { opacity: 0 }}
        animate={props.isOpen ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() => {

        }}
      >
        <div className="mobile-shadow" >
          <div
            data-for={topicId}
            data-tip={homeworkStatus.description}
            data-iscapture='true'
            className={cx({
              'ph-topic-statusIcon': true,
              'ph-task-pendingIcon': homeworkStatus.status === 'notStarted',
              'ph-task-warningIcon': homeworkStatus.status === 'inProgress',
              'ph-task-completedIcon': homeworkStatus.status === 'completed',
            })}
          >
            <ReactToolTip
              id={topicId}
              place='right'
              effect='float'
              multiline={false}
              className={cx('ph-topic-input-tooltip', 'cn-tooltip')}
              arrowColor={homeworkStatus.color}
              backgroundColor={homeworkStatus.color}
              textColor='rgba(0, 0, 0, 0.8)'
            />
          </div>
          <div className='ph-topic-card-thumb'>
            <div className='ph-topic-order'>{topic.i || topic.order}</div>
            <div style={{
              width: '55%',
              height: '100%',
              backgroundImage: `url("${topic.topicThumbnailSmall && getPath(topic.topicThumbnailSmall.uri)}")`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center center',
              position: 'absolute',
              right: '3%',
            }}>
            </div>
          </div>
          <div className='ph-topic-card-body'>
            <div className='ph-topic-card-title'>{topic.topicTitle}</div>
            <div style={{ display: 'flex', flexDirection: 'row', margin: '6px auto', alignItems: 'center' }}>
              <div className='ph-clock-icon'>
                <CalendarIcon />
              </div>
              <div className='ph-topic-card-description' style={{ marginTop: 0 }}>
                {timeStampObj.label}{timeStampObj.date || ''}
              </div>
            </div>
            <div className='ph-topic-card-task'>
              <div className='ph-topic-card-task-preText'>Tasks</div>
              {(homeworkComponents || []).map(component => (
                <div className='ph-topic-card-task-contaner'>
                  <div className='ph-task-iconContainer'>
                    <div className={
                      getIsComponentSubmitted(get(component, 'componentName'), topic)
                        ? 'ph-task-completedIcon'
                        : 'ph-task-pendingIcon'}
                    />
                  </div>
                  {getComponentRender(get(component, 'componentName'), topic)}
                </div>
              ))}
            </div>
            <div className='ph-topic-card-footer'>
              {((homeworkStatus.status === 'completed') && latestQuizReport.masteryLevel) ? (
                <span className='ph-masteryLabel' style={{
                  background: getMasteryLabel(latestQuizReport.masteryLevel).tagColor,
                }}>
                  {getMasteryLabel(latestQuizReport.masteryLevel).tagName}
                </span>
              ) : (
                <span className='ph-topic-card-status' style={{
                  color: `${homeworkStatus.color || ''}`
                }}>
                  {homeworkStatus.description || ''}
                </span>
              )}
              <div
                onClick={() => onHomeworkClick(homeworkComponents)}
                className='ph-topic-card-footer-btn'
              >
                {homeworkStatus.btnTitle || ''}
              </div>
            </div>
          </div>
        </div>
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

  const { chapter } = props

  return (
    <>
        <div className='ph-collapsible-container' style={{display: get(props, 'hideHeader', false)? 'none' : 'unset'  }} onClick={() => props.openCard(props.id)}>
          <div className='ph-collapsible-title'>Chapter {props.chapterOrder || ''} : <span style={{ fontWeight: `${isMobile() ? '550' : 'bold'}` }}>{chapter.chapterTitle}</span></div>
          <motion.div
            className='ph-collapsible-arrow'
            initial={{ rotate: '0deg' }}
            transition={{ duration: 0.1 }}
            animate={{
              rotate: props.isOpen ? '-180deg' : '0deg'
            }}
          >
            {renderArrow()}
          </motion.div>
        </div>
      <motion.div
        className='ph-collapsible-body'
        transition={{ duration: 0.3, delay: 0.1 }}
        initial={props.isOpen ? collapsibleBody.open : collapsibleBody.close}
        animate={props.isOpen ? collapsibleBody.open : collapsibleBody.close}
      >
        {chapter.topics.map((topic, topicOrder) => (
          renderTopicCard(
            topic,
            topicOrder,
            props.startNavigationLoading,
            props.stopNavigationLoading,
          )
        ))}
      </motion.div>
    </>
  )
}

class Collapsible extends Component {
  state = {
    chapters: [],
    pendingTabActive: true,
  }

  componentDidMount() {
    this.setState({
      chapters:
        this.props.pendingHomeworks.map((chapter, i) => i === 0
          ? ({ ...chapter, isOpen: true })
          : ({ ...chapter, isOpen: false })
        )
    })
    const recordMeta = this.getPendingAndCompletedCount()
    if (recordMeta.pendingCount === 0) {
      this.setState({
        pendingTabActive: false
      })
    }
    if (isMobile()) {
      this.setState({
        currentTabActive: true,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.pendingHomeworks !== this.props.pendingHomeworks) {
      this.setState({
        chapters:
          this.props.pendingHomeworks.map((chapter, i) => i === 0
            ? ({ ...chapter, isOpen: true })
            : ({ ...chapter, isOpen: false })
          )
      })
    }
    if((prevProps.completedHomeworks !== this.props.completedHomeworks) && !this.state.pendingTabActive) {
      this.setState({
        chapters:
          this.props.completedHomeworks.map((chapter, i) => i === 0
            ? ({ ...chapter, isOpen: true })
            : ({ ...chapter, isOpen: false })
          )
      })
    }

    if (prevState.pendingTabActive !== this.state.pendingTabActive) {
      if (this.state.pendingTabActive) {
        this.setState({
          chapters:
            this.props.pendingHomeworks.map((chapter, i) => i === 0
              ? ({ ...chapter, isOpen: true })
              : ({ ...chapter, isOpen: false })
            )
        })
      } else {
        this.setState({
          chapters:
            this.props.completedHomeworks.map((chapter, i) => i === 0
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

  getPendingAndCompletedCount = () => {
    const { completedHomeworks, pendingHomeworks } = this.props
    let completedHomeworkCount = 0
    let pendingHomeworkCount = 0
    if (completedHomeworks && completedHomeworks.length) {
      completedHomeworks.forEach(el => {
        if (el && el.topics && el.topics.length) {
          completedHomeworkCount += el.topics.length
        }
      })
    }
    if (pendingHomeworks && pendingHomeworks.length) {
      pendingHomeworks.forEach(el => {
        if (el && el.topics && el.topics.length) {
          pendingHomeworkCount += el.topics.length
        }
      })
    }
    return {
      completedCount: completedHomeworkCount,
      pendingCount: pendingHomeworkCount
    }
  }

  render() {
    const { pendingTabActive, currentTabActive } = this.state
    const recordMeta = this.getPendingAndCompletedCount()
    if (isMobile()) {
      const activeTab = currentTabActive ? "current" : (
        pendingTabActive ? 'pending' : 'completed'
      )
      return (
        <div>
          <div className='ph-container'>
            <div className='ph-tab-container'>
              {(recordMeta.currentCount !== 0) && (
                <div
                  className={cx('ph-tab', (activeTab !== 'current') && 'not-active')}
                  onClick={() => {
                    this.setState({ currentTabActive: true })
                    this.props.changeTab(true);
                  }}
                >
                  <div className='ph-tab-text'>Current</div>
                  <div className='ph-tab-underline'></div>
                </div>
              )}
              {recordMeta.pendingCount !== 0 && (
                <div
                  className={cx(
                    "ph-tab",
                    (activeTab !== 'pending') && "not-active",
                    recordMeta.pendingCount === 0 && "ph-tab-disabled"
                  )}
                  onClick={() => {
                    if (recordMeta.pendingCount > 0) {
                      this.setState({
                        pendingTabActive: true,
                        currentTabActive: false,
                      });
                    }
                    this.props.changeTab(false);
                  }}
                >
                  <div className="ph-tab-text">
                    Pending ({recordMeta.pendingCount})
                  </div>
                  <div className="ph-tab-underline"></div>
                </div>
              )}
              {recordMeta.completedCount !== 0 && (
                <div
                  className={cx(
                    "ph-tab",
                    (activeTab !== 'completed') && "not-active",
                    recordMeta.completedCount === 0 && "ph-tab-disabled"
                  )}
                  onClick={() => {
                    if (recordMeta.completedCount > 0) {
                      this.setState({
                        pendingTabActive: false,
                        currentTabActive: false,
                      });
                    }
                    this.props.changeTab(false);
                  }}
                >
                  <div className="ph-tab-text">
                    COMPLETED ({recordMeta.completedCount})
                  </div>
                  <div className="ph-tab-underline"></div>
                </div>
              )}
            </div>
            {!currentTabActive &&
              this.state.chapters.map((chapter, chapterOrder) => (
                <CollapsibleTopic
                  {...this.props}
                  isOpen={chapter.isOpen}
                  topics={this.props.topics}
                  chapter={chapter}
                  pendingTabActive={pendingTabActive}
                  chapterOrder={chapterOrder + 1}
                  id={chapter.id}
                  openCard={this.openCard}
                  allSessions={this.props.allSessions}
                  getFirstOrLatestQuizReports={this.props.getFirstOrLatestQuizReports}
                  currentHomework={this.props.currentHomework}
                />
              ))}
            {
              currentTabActive ? (
                <CurrentHomework
                  {...this.props.currentHomeworkProps}
                  getHomeworkComponents={this.props.getHomeworkComponents}
                />
              ) : (
                <div></div>
              )
            }

          </div>

        </div>
      )
    }

    else {
      return (
        <div>
          <div className="ph-container">
            <div className="ph-tab-container">
              {recordMeta.pendingCount !== 0 && (
                <div
                  className={cx(
                    "ph-tab",
                    !pendingTabActive && "not-active",
                    recordMeta.pendingCount === 0 && "ph-tab-disabled"
                  )}
                  onClick={() => {
                    if (recordMeta.pendingCount > 0) {
                      this.setState({ pendingTabActive: true });
                    }
                  }}
                >
                  <div className="ph-tab-text">
                    Pending ({recordMeta.pendingCount})
                  </div>
                  <div className="ph-tab-underline"></div>
                </div>
              )}
              {recordMeta.completedCount !== 0 && (
                <div
                  className={cx(
                    "ph-tab",
                    pendingTabActive && "not-active",
                    recordMeta.completedCount === 0 && "ph-tab-disabled"
                  )}
                  onClick={() => {
                    if (recordMeta.completedCount > 0) {
                      this.setState({ pendingTabActive: false });
                    }
                  }}
                >
                  <div className="ph-tab-text">
                    COMPLETED ({recordMeta.completedCount})
                  </div>
                  <div className="ph-tab-underline"></div>
                </div>
              )}
            </div>
            {this.state.chapters.map((chapter, chapterOrder) => (
              <CollapsibleTopic
                {...this.props}
                isOpen={chapter.isOpen}
                topics={this.props.topics}
                chapter={chapter}
                startNavigationLoading={this.props.startNavigationLoading}
                stopNavigationLoading={this.props.stopNavigationLoading}
                pendingTabActive={pendingTabActive}
                chapterOrder={chapterOrder + 1}
                id={chapter.id}
                openCard={this.openCard}
                allSessions={this.props.allSessions}
                getFirstOrLatestQuizReports={
                  this.props.getFirstOrLatestQuizReports
                }
                currentHomework={this.props.currentHomework}
              />
            ))}
          </div>
        </div>
      );
    }
  }
}

export default withRouter(Collapsible)
