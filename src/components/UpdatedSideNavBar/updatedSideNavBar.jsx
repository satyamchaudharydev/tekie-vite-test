/* eslint-disable */
import React, { Component } from 'react'
import cx from 'classnames'
import { Link } from 'react-router-dom'
import { withRouter } from 'react-router-dom'
import { get } from 'lodash'
import './updatedSideNavBar.scss'
import fetchTopicJourney from '../../queries/fetchTopicJourney'
import ContentLoader from 'react-content-loader'
import { sort } from '../../utils/immutable'
import { getPrevTopicId } from '../../utils/getPrevTopicId'
import { Button3D } from '../../photon'
import fetchStudentProfile from "../../queries/fetchStudentProfile";
import withScale from '../../utils/withScale'
import isMobile from '../../utils/isMobile'
import { loComponentNameToRouteAlias, learningObjectiveComponents } from '../../config'
import ReactTooltip from 'react-tooltip'
import { motion } from 'framer-motion'
import getCourseId from '../../utils/getCourseId'
import fetchCourseDetails from '../../queries/sessions/fetchCourseDetails'
import updateMentorMenteeSession from '../../queries/sessions/updateMentorMenteeSession'
import duck from '../../duck'
import SubmitOverlayMenu from '../../pages/UpdatedSessions/Quiz/components/SubmitOverlayMenu'
import { maxCap } from '../../utils/data-utils'
import { homeworkComponents } from '../../constants/homework'
import videocam from '../../assets/videocam.svg'
import arrowback from '../../assets/mobileArrowBack.svg'
import { VideocamIcon, Dropdown, DropDown2, DocIcon, Chat, Practice, Target, Brush, HintIcon } from './icons'
import { checkIfEmbedEnabled, isPqReportNotAllowed } from '../../utils/teacherApp/checkForEmbed'
import fetchTopicDetails from '../../queries/sessions/fetchTopicDetails'
import fetchCoursePackageDetails from '../../queries/sessions/fetchCoursePackageDetails'
import { checkForComponentsInLo, getFilteredLoWithOnlyOnePQ } from '../../pages/UpdatedSessions/utils'
import { getActiveBatchDetail } from '../../utils/multipleBatch-utils'
import MainSideBar from './MainSideBar'
const { message, comicStrip, practiceQuestion, chatbot, learningSlide } = learningObjectiveComponents

const loComponentDisplayName = {
    [message]: 'Chat',
    [comicStrip]: 'Comics',
    [practiceQuestion]: 'Practice Quiz',
    [chatbot]: 'Chat',
    [learningSlide]: 'Learning Slides'
}

const loSubItemsParentVariant = {
  open: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.2 }
  },
  closed: {
    opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
      }
  }
};

const loSubItemsVariant = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { duration: 0.2 },
    }
  },
  closed: {
    y: 8,
    opacity: 0,
    transition: {
      y: { duration: 0.2 },
    }
  }
};

class BlockBasedSideNavBar extends Component {
  constructor(props) {
    super(props)
    this.showSubmitOverlay = this.showSubmitOverlay.bind(this);
  }
  state = {
    badge: null,
    totalComponents: 0,
    isLoOverlayMenuVisible: false,
    isQuizReportMenuVisible: false,
    showSubmitOverlay: false,
    reviewSubmitClicked: false,
    courseData: {},
    topicsData: [],
    isPageLoading: true,
    sidebar : false,
    subMenu : true,
    activeLoId: null
  }

  showSidebar = () => {
    var current = this.state.sidebar
    this.setState({sidebar: !current})
  }
  showSubMenu = () => {
    var current = this.state.subMenu
    this.setState({subMenu: !current})
  }

  showLosubMenu = (loId) => {
      if(this.state.activeLoId === null){
        this.setState({activeLoId: loId})
      }
      else if(loId === this.state.activeLoId){
          this.setState({activeLoId: null})
      }else{
        this.setState({activeLoId: loId})
      }
  }

  async componentDidMount() {
    if (this.props.showSubmitOverlay) {
        this.props.showSubmitOverlay(this.showSubmitOverlay);
    }
    const { computedMatch } = this.props
    const { params } = computedMatch
    /** Just to be sure Sidebar would be appear after 20 seconds no matter query fails   */
    setTimeout(() => {
        this.setState({
            isPageLoading: false
        })
    }, 20000)
    if (!this.props.accountProfileSuccess) {
        await fetchStudentProfile(this.props.loggedInUser && this.props.loggedInUser.toJS() && this.props.loggedInUser.toJS().id)
    }
    fetchTopicDetails(params.topicId, true).call().then(res => {
        if (res && res.topics) {
            this.setState({
                topicsData: res.topics,
                isPageLoading: false,
            })
        }
    })
    const studentProfile = this.props.studentProfile && this.props.studentProfile.toJS();
    const batchDetail = getActiveBatchDetail(get(studentProfile, 'batch'))
    let coursePackageId = false;
    if (studentProfile && batchDetail) {
        coursePackageId = get(batchDetail, 'coursePackage.id');
    }
    if (coursePackageId) {
        fetchCoursePackageDetails(coursePackageId, true).call().then((res) => {
            if (res && res.coursePackages) {
                this.setState({
                    courseData: get(res, 'coursePackages', []).map((packageData) => {
                        return {
                            id: get(packageData, 'id'),
                            title: get(packageData, 'title'),
                            topics: get(packageData, 'packageTopics', []).map(topic => ({ ...get(topic, 'topic', {}), order: get(topic, 'order') }))
                        }
                    })[0] || {}
                })
            }
        })
    } else {
        fetchCourseDetails(getCourseId(), true).call().then(res => {
            if (res && res.course) {
                this.setState({
                    courseData: res.course,
                })
            }
        })
    }
    await fetchTopicJourney(params.topicId, false, getCourseId(params.topicId)).call()
    /**
     * Fetch Topic instead of course. Will also work if course package is active.
     */
    this.getTotalComponents()
  }

  checkIfHomeworkCompleted = (mentorMenteeSession) => {
      const { quizComponent, assignmentComponent, practiceComponent, homeworkComponentRule } = this.getHomeWorkComponents()
      if (homeworkComponentRule && homeworkComponentRule.length) {
        return homeworkComponentRule.every(componentRule => {
          if (componentRule.componentName === 'quiz') {
              return mentorMenteeSession.getIn([ 0, 'isQuizSubmitted' ]);
          } else if (componentRule.componentName === 'homeworkAssignment') {
              return mentorMenteeSession.getIn([0, 'isAssignmentSubmitted'])
          } else if (componentRule.componentName === 'homeworkPractice') {
              return mentorMenteeSession.getIn([0, 'isPracticeSubmitted'])
          }
          return false;
        })
      } else {
        if (quizComponent && (assignmentComponent || practiceComponent)) {
          return (mentorMenteeSession &&
                mentorMenteeSession.getIn([0, 'isQuizSubmitted']) &&
              (mentorMenteeSession.getIn([0, 'isAssignmentSubmitted']) ||
                  mentorMenteeSession.getIn([0, 'isPracticeSubmitted']))
            )
        } else if (quizComponent || assignmentComponent || practiceComponent) {
          if(quizComponent) return (mentorMenteeSession && mentorMenteeSession.getIn([0, 'isQuizSubmitted']))
          if(assignmentComponent) return (mentorMenteeSession && mentorMenteeSession.getIn([0, 'isAssignmentSubmitted']))
          if(practiceComponent) return (mentorMenteeSession && mentorMenteeSession.getIn([0, 'isPracticeSubmitted']))
        }
      }
      return false
  }
  async componentDidUpdate(prevProps) {
    const {
        computedMatch, mentorMenteeSessionUpdateStatus, mentorMenteeSession,
    } = this.props
    const { params } = computedMatch
    const { topicId, courseId } = params
    const courseIdString = courseId ? '/:courseId' : ''
    if (params.topicId !== prevProps.computedMatch.params.topicId) {
      await fetchTopicJourney(params.topicId, false, params.courseId).call()
      this.getTotalComponents()
    }

    if (mentorMenteeSessionUpdateStatus && prevProps.mentorMenteeSessionUpdateStatus) {
        if (
            mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'success']) &&
            !prevProps.mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'success'])
        ) {
            if (mentorMenteeSession && (this.state.reviewSubmitClicked || this.state.showSubmitOverlay)) {
                const isSubmittedForReview = get(mentorMenteeSession.toJS(), '0.isSubmittedForReview')
                const modifiedSession = mentorMenteeSession.toJS()
                const { computedMatch: {path, params: { topicId }  } } = this.props
                modifiedSession.forEach((session, index) => {
                    if (session && session.topicId === topicId) {
                        // session.isSubmittedForReview = true
                        modifiedSession[index] = session
                    }
                })
                duck.merge(() => ({
                    mentorMenteeSession: modifiedSession
                }))
                const { quizComponent, homeworkComponentRule } = this.getHomeWorkComponents()
                //TODO: Handle this in badge next
                 if ((!isMobile() || (isMobile() && this.state.submitForReviewClicked)) && ((path === `/homework${courseIdString}/:topicId/quiz`) || (path === `/homework${courseIdString}/:topicId/codingAssignment`) || (path === '/homework/:courseId/:topicId/:projectId/practice')) && isSubmittedForReview) {
                     // this.props.history.push('/homework')
                      this.setState({
                         showSubmitOverlay: false,
                         reviewSubmitClicked: false
                     })
                    let redirectURL = `/quiz-report-latest/${courseId}/${topicId}`;
                    if (homeworkComponentRule && homeworkComponentRule.length) {
                        const firstHomeworkComponent = homeworkComponentRule[0];
                        if (!quizComponent) {
                            if (get(firstHomeworkComponent, 'componentName') === 'homeworkAssignment') {
                                redirectURL = `/homework/${courseId}/${topicId}/codingAssignment`;
                            } else if (get(firstHomeworkComponent, 'componentName') === 'homeworkPractice') {
                                redirectURL = `/homework/${courseId}/${topicId}/${get(firstHomeworkComponent, 'blockBasedProject.id')}/practice`;
                            }
                        }
                    }
                    this.props.history.push(redirectURL);
                 }
            } else if (
                !isMobile() && this.checkIfHomeworkCompleted(mentorMenteeSession)
            ) {
                this.setState({
                    showSubmitOverlay: true
                })
            }
        }
    }
  }

  /** Helpher Methods */
  getTotalComponents = () => {
    let totalComponents = 0
    let filteredTopicComponentRule = this.getFilteredTopicComponentRule()
    filteredTopicComponentRule = (filteredTopicComponentRule || []).filter(el =>
        !homeworkComponents.includes(get(el, 'componentName')))
    totalComponents = filteredTopicComponentRule.length || 0
    this.setState({
        totalComponents,
    })
  }

  getisVideoComponentUnlocked = () => {
      let isUnlocked = false;
      if (this.props.userTopicJourney && this.props.userTopicJourney.getIn([0, 'videos'], false)) {
        const userVideos = this.props.userTopicJourney.getIn([0, 'videos']).toJS()
        isUnlocked = userVideos.some(video => get(video, 'isUnlocked'))
      }
    return isUnlocked
  }

  getIsPracticeComponentUnlocked = () => {
    let isUnlocked = false;
    if (this.props.userTopicJourney && this.props.userTopicJourney.getIn([0, 'blockBasedPractices'], false)) {
    const userBlockBasedPractices = this.props.userTopicJourney.getIn([0, 'blockBasedPractices']).toJS()
    isUnlocked = userBlockBasedPractices.some(practice => get(practice, 'isUnlocked'))
    }
    return isUnlocked
  }

  getIsLOComponentUnlocked = (filteredLO) => {
    let isUnlocked = false;
    if (filteredLO && filteredLO.length) {
        isUnlocked = filteredLO.some(LO => get(LO, 'isUnlocked'))
    }
    return isUnlocked
  }

  calcOverallComponentProgress = (videoComponent, loComponent, blockBasedProject, blockBasedPractice, shouldCodingAssignment, shouldAdjustPercentage, loComponentLen, practiceLen) => {
    if (this.props.revisitRoute || checkIfEmbedEnabled()) {
        return 100
    }
    let { totalComponents } = this.state
    if (shouldCodingAssignment) {
        totalComponents -= 1
    }
    let componentsUnlocked = 0
    componentsUnlocked = videoComponent ? componentsUnlocked + 1 : componentsUnlocked
    componentsUnlocked = loComponent ? componentsUnlocked + loComponentLen : componentsUnlocked
    componentsUnlocked = blockBasedProject ? componentsUnlocked + 1 : componentsUnlocked
    componentsUnlocked = blockBasedPractice ? componentsUnlocked + practiceLen : componentsUnlocked
    const progressPercentage = maxCap(((componentsUnlocked*100)/totalComponents), 100)
    if (progressPercentage !== 100 && shouldAdjustPercentage) {
        return (progressPercentage-5)
    }
    return progressPercentage
  }

  getLORedirectKey = (loComponentRule) => {
    const componentName = get(loComponentRule, 'componentName', 'comicStrips')
    return loComponentNameToRouteAlias[componentName]
  }

  getFilteredLoComponentRule = (learningObjective, courseLoComponentRule, topicLoComponentRule = [], index = null) => {
    let filteredLoComponent = []
    if (topicLoComponentRule && topicLoComponentRule.length && learningObjective) {
        filteredLoComponent = topicLoComponentRule.sort((a, b) => {
            return get(a, 'order') - get(b, 'order')
        }).filter((componentRule) => checkForComponentsInLo(componentRule, learningObjective))
    } else if (courseLoComponentRule && courseLoComponentRule.length && learningObjective) {
        filteredLoComponent = courseLoComponentRule.sort((a, b) => {
            return get(a, 'order') - get(b, 'order')
        }).filter((componentRule) => checkForComponentsInLo(componentRule, learningObjective))
    }
    filteredLoComponent = getFilteredLoWithOnlyOnePQ({ loComponentRule: filteredLoComponent, learningObjective })
    if ((typeof index === 'number') && filteredLoComponent && filteredLoComponent.length) {
        return [filteredLoComponent[index]]
    }
    return filteredLoComponent || []
  }

  checkIfLoStatusCompleted = (componentName, learningObjective) => {
    if (learningObjective) {
        if (componentName === message) {
            return get(learningObjective, 'chatStatus') === 'complete'
        } else if (componentName === chatbot) {
            return (
                get(learningObjective, 'chatStatus') === 'complete' &&
                get(learningObjective, 'practiceQuestionStatus') === 'complete'
            )
        } else if (componentName === learningSlide) {
            return get(learningObjective, 'learningSlideStatus') === 'complete'
        }else {
            return get(learningObjective, `${componentName}Status`) === 'complete'
        }
    }
    return false
  }

  getLoIconBasedOnComponent = (loComponent, allLoComponents = null, masterComponent = false) => {
      const isReport  = ['chatbot', 'practiceQuestion'].includes(get(loComponent, 'componentName'))
    if ((
        allLoComponents && (allLoComponents.length > 1 || isReport) && masterComponent
    )) {
        return require('../../assets/loJourneyIcon.svg')
    }
    if(isMobile()){
        switch (get(loComponent, 'componentName')) {
            case 'chatbot':
                return <Chat/>
            case 'message':
                return <Chat/>
            case 'practiceQuestion':
                return <Practice/>
            default:
                return <DocIcon/>
        }
    }
    switch (get(loComponent, 'componentName')) {
        case 'chatbot':
            return require('../../assets/message-journey-icon.svg')
        case 'message':
            return require('../../assets/message-journey-icon.svg')
        case 'practiceQuestion':
            return require('../../assets/help-circle-outline.svg')
        default:
            return require('../../assets/reader-outline.png')
    }
  }
  /** Render Methods */
  renderVideoComponent = (revisitString, courseId, topicId, computedMatch, isUserVideoCompleted, componentRule, videoId) => {
      const isActive = (get(componentRule, 'video.id', null) === videoId)
      const compname = (get(componentRule, 'componentName', ''))
      if(isMobile()){
          return(
            this.props.userTopicJourney && this.props.userTopicJourney.getIn([0, 'videos', 0, 'id'], []).length ? (
                <Link
                    to={`${revisitString}/sessions/video/${courseId}/${topicId}/${get(componentRule, 'video.id')}`}
                    key='videoComponent'
                    data-for='videoComponent'
                    data-tip='Video'
                    data-iscapture='true'
                    className={`
                        sidebar-item
                        ${(isActive || (computedMatch.path === `${revisitString}/sessions/video/:courseId/:topicId`)) && 'sidebar-item-active'}
                    `}
                >
                    <div className={`sidebar-image
                        ${(this.getisVideoComponentUnlocked() || this.props.revisitRoute || checkIfEmbedEnabled()) && 'sidebar-image-available'}
                        ${(isActive || (computedMatch.path === `${revisitString}/sessions/video/:courseId/:topicId`)) && 'sidebar-image-active'}
                    `}><VideocamIcon/></div>
                    <div className={`options
                        ${(this.getisVideoComponentUnlocked() || this.props.revisitRoute || checkIfEmbedEnabled()) && 'options-available'}
                        ${(isActive || (computedMatch.path === `${revisitString}/sessions/video/:courseId/:topicId`)) && 'options-active'}
                    `}>Video</div>
                </Link>
            ) : null
          )
      }
      return (
          this.props.userTopicJourney && this.props.userTopicJourney.getIn([0, 'videos', 0, 'id'], []).length ? (
              <Link
                  to={`${revisitString}/sessions/video/${courseId}/${topicId}/${get(componentRule, 'video.id')}`}
                  key='videoComponent'
                  data-for='videoComponent'
                  data-tip='Video'
                  data-iscapture='true'
                  className={`
                      progressIndicator-icon-ProgressCircle
                      ${(this.getisVideoComponentUnlocked() || this.props.revisitRoute || checkIfEmbedEnabled()) && 'progressIndicator-completed'}
                      ${(isActive || (computedMatch.path === `${revisitString}/sessions/video/:courseId/:topicId`)) && 'progressIndicator-active'}
                      ${(isUserVideoCompleted && isActive) && 'progressIndicator-active-completed'}
                  `}
              >
                  <div className={`progressIndicator-icon-container ${!this.getisVideoComponentUnlocked() && 'progressIndicator-icon-locked'}`}>
                      <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets/videocam-outline.png')})` }} />
                  </div>
              </Link>
          ) : null
      )
    }

    logicalName = (oldname) =>{
        if(oldname === 'message'){
            return "Message"
        }else if(oldname === "practiceQuestion"){
            return "Practice Quiz"
        }else{
            return oldname
        }
    }
    getPQRoute = () => {
        let pqRoute = 'practice-report'
        if (checkIfEmbedEnabled()) pqRoute = 'pq-report'
        return pqRoute
    }
    renderLearningObjectiveOverlayMenu = (Lo, course, revisitString, courseId, topicId, computedMatch, loId, componentRule) => {
      if(isMobile()){
          return(
              <>{
                this.getFilteredLoComponentRule(Lo, get(course, 'defaultLoComponentRule', []), (get(componentRule, 'learningObjectiveComponentsRule', []) || []))
                    .map(loComponent => (
                    <>
                    <Link
                        to={`${revisitString}/sessions/${this.getLORedirectKey(loComponent)}/${courseId}/${topicId}/${get(Lo, 'id')}`}
                        key={get(loComponent, 'componentName')}
                        data-for={`${get(Lo, 'id')}#${get(loComponent, 'componentName')}`}
                        data-tip={loComponentDisplayName[get(loComponent, 'componentName')] || ''}
                        data-iscapture='true'
                        className={`sidebar-item
                        ${((computedMatch.path === `${revisitString}/sessions/${this.getLORedirectKey(loComponent)}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'sidebar-item-active'}
                    `}
                        >
                            <div className={`sidebar-image
                         ${(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'sidebar-image-available'}
                         ${((computedMatch.path === `${revisitString}/sessions/${this.getLORedirectKey(loComponent)}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'sidebar-image-active'}
                    `}>{this.getLoIconBasedOnComponent(loComponent)}</div>
                    <div className={`options
                         ${(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'options-available'}
                         ${((computedMatch.path === `${revisitString}/sessions/${this.getLORedirectKey(loComponent)}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'options-active'}
                    `}>{loComponentDisplayName[get(loComponent, 'componentName')]}</div>
                    </Link>
                    {((get(loComponent, 'componentName', false) === chatbot)
                 && get(Lo, 'questionBankMeta.count', 0) > 0 && !isPqReportNotAllowed()
                ) && (
                        <Link
                            to={`${revisitString}/sessions/${this.getPQRoute()}/${courseId}/${topicId}/${get(Lo, 'id')}`}
                            key='Practice Report'
                            data-for={`${get(Lo, 'id')}#practiceReport`}
                            data-tip='Practice Report'
                            data-iscapture='true'
                            className={`sidebar-item
                            ${((computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'sidebar-item-active'}
                            `}
                        >
                            <div className={`sidebar-image
                         ${(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'sidebar-image-available'}
                         ${((computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'sidebar-image-active'}
                    `}><DocIcon/></div>
                    <div className={`options
                         ${(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'options-available'}
                         ${((computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'options-active'}
                    `}>Report</div>
                        </Link>
                )}
                {((get(loComponent, 'componentName', false) === learningSlide)
                 && get(Lo, 'practiceQuestionLearningSlidesMeta.count', 0) > 0 && !isPqReportNotAllowed()) && (
                        <Link
                            to={`${revisitString}/sessions/${this.getPQRoute()}/${courseId}/${topicId}/${get(Lo, 'id')}`}
                            key='Learning Slides Report'
                            data-for={`${get(Lo, 'id')}#learningSlideReport`}
                            data-tip='Learning Slides Report'
                            data-iscapture='true'
                            className={`sidebar-item
                            ${((computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'sidebar-item-active'}
                            `}
                        >
                            <div className={`sidebar-image
                         ${(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'sidebar-image-available'}
                         ${((computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'sidebar-image-active'}
                    `}><DocIcon/></div>
                    <div className={`options
                         ${(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'options-available'}
                         ${((computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'options-active'}
                    `}>Report</div>
                        </Link>
                )}
                {((get(loComponent, 'componentName', false) === practiceQuestion) && !isPqReportNotAllowed()) && (
                        <Link
                            to={`${revisitString}/sessions/${this.getPQRoute()}/${courseId}/${topicId}/${get(Lo, 'id')}`}
                            key='Practice Report'
                            data-for={`${get(Lo, 'id')}#practiceReport`}
                            data-tip='Practice Report'
                            data-iscapture='true'
                            className={`sidebar-item
                            ${((computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'sidebar-item-active'}
                        `}
                        >
                            <div className={`sidebar-image
                         ${(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'sidebar-image-available'}
                         ${((computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'sidebar-image-active'}
                    `}><DocIcon/></div>
                    <div className={`options
                         ${(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'options-available'}
                         ${((computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'options-active'}
                    `}>Report</div>
                        </Link>
                )}
                    </>
                    )
                )
              }
              </>
          )
      }
      return(
    <motion.div className='loOverlayMenu'
        initial='closed'
        animate={this.state.isLoOverlayMenuVisible ? 'open' : 'closed'}
        layout
        variants={loSubItemsParentVariant}
    >
        {get(Lo, 'title', null) ? (
            <div className='sidebar-LoTitle'>
                {get(Lo, 'title', '')}
            </div>
        ) : ''}
        {this.getFilteredLoComponentRule(Lo, get(course, 'defaultLoComponentRule', []), (get(componentRule, 'learningObjectiveComponentsRule', []) || [])).map(loComponent => (
            <>
                <motion.div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    whileHover={{y: -2}}
                    variants={loSubItemsVariant}
                >
                    <Link
                        to={`${revisitString}/sessions/${this.getLORedirectKey(loComponent)}/${courseId}/${topicId}/${get(Lo, 'id')}`}
                        key={get(loComponent, 'componentName')}
                        data-for={`${get(Lo, 'id')}#${get(loComponent, 'componentName')}`}
                        data-tip={loComponentDisplayName[get(loComponent, 'componentName')] || ''}
                        data-iscapture='true'
                        style={{transform: 'scale(0.8)',margin: 0}}
                        className={`progressIndicator-icon-ProgressCircle
                        ${(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'progressIndicator-completed'}
                        ${((computedMatch.path === `${revisitString}/sessions/${this.getLORedirectKey(loComponent)}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'progressIndicator-active'}
                        ${((this.checkIfLoStatusCompleted(get(loComponent, 'componentName'), Lo) && (computedMatch.path === `${revisitString}/sessions/${this.getLORedirectKey(loComponent)}/:courseId/:topicId/:loId`)) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'progressIndicator-active-completed'}
                    `}
                    >
                        <div className={`progressIndicator-icon-container ${(!get(Lo, 'isUnlocked', false) && !this.props.revisitRoute) && 'progressIndicator-icon-locked'}`}>
                            <div className='progressIndicator-icon' style={{ backgroundImage: `url(${this.getLoIconBasedOnComponent(loComponent)})` }} />
                        </div>
                        <ReactTooltip
                            id={`${get(Lo, 'id')}#${get(loComponent, 'componentName')}`}
                            place='bottom'
                            effect='float'
                            multiline
                            className={cx('updated-input-tooltip', 'cn-tooltip', 'cn-sub-tooltip')}
                            arrowColor='#00ADE6'
                            textColor='rgba(255, 255, 255)'
                        />
                    </Link>
                </motion.div>
                {((get(loComponent, 'componentName', false) === chatbot)
                 && get(Lo, 'questionBankMeta.count', 0) > 0 && !isPqReportNotAllowed()
                ) && (
                    <motion.div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        whileHover={{y: -2}}
                        variants={loSubItemsVariant}
                    >
                        <Link
                            to={`${revisitString}/sessions/${this.getPQRoute()}/${courseId}/${topicId}/${get(Lo, 'id')}`}
                            key='Practice Report'
                            data-for={`${get(Lo, 'id')}#practiceReport`}
                            data-tip='Practice Report'
                            data-iscapture='true'
                            style={{
                                transform: 'scale(0.8)', margin: 0
                            }}
                            className={
                                cx(
                                    'progressIndicator-icon-ProgressCircle',
                                    (this.checkIfLoStatusCompleted(get(loComponent, 'componentName'), Lo) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'progressIndicator-completed',
                                    ((computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'progressIndicator-active',
                                    ((this.checkIfLoStatusCompleted(get(loComponent, 'componentName'), Lo) && (computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`)) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'progressIndicator-active-completed',
                                )
                            }
                        >
                            <div className={`progressIndicator-icon-container ${!(this.checkIfLoStatusCompleted(get(loComponent, 'componentName'), Lo) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'progressIndicator-icon-locked'}`}>
                                <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets/reader-outline.png')})` }} />
                            </div>
                            <ReactTooltip
                                id={`${get(Lo, 'id')}#practiceReport`}
                                place='bottom'
                                effect='float'
                                multiline
                                className={cx('updated-input-tooltip', 'cn-tooltip', 'cn-sub-tooltip')}
                                arrowColor='#00ADE6'
                                textColor='rgba(255, 255, 255)'
                            />
                        </Link>
                    </motion.div>
                    )}
                {((get(loComponent, 'componentName', false) === learningSlide)
                 && get(Lo, 'practiceQuestionLearningSlidesMeta.count', 0) > 0 && !isPqReportNotAllowed()) && (
                    <motion.div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        whileHover={{y: -2}}
                        variants={loSubItemsVariant}
                    >
                        <Link
                            to={`${revisitString}/sessions/${this.getPQRoute()}/${courseId}/${topicId}/${get(Lo, 'id')}`}
                            key='Learning Slides Report'
                            data-for={`${get(Lo, 'id')}#learningSlideReport`}
                            data-tip='Learning Slides Report'
                            data-iscapture='true'
                            style={{
                                transform: 'scale(0.8)', margin: 0
                            }}
                            className={
                                cx(
                                    'progressIndicator-icon-ProgressCircle',
                                    (this.checkIfLoStatusCompleted(get(loComponent, 'componentName'), Lo) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'progressIndicator-completed',
                                    ((computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'progressIndicator-active',
                                    ((this.checkIfLoStatusCompleted(get(loComponent, 'componentName'), Lo) && (computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`)) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'progressIndicator-active-completed',
                                )
                            }
                        >
                            <div className={`progressIndicator-icon-container ${!(this.checkIfLoStatusCompleted(get(loComponent, 'componentName'), Lo) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'progressIndicator-icon-locked'}`}>
                                <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets/reader-outline.png')})` }} />
                            </div>
                            <ReactTooltip
                                id={`${get(Lo, 'id')}#learningSlideReport`}
                                place='bottom'
                                effect='float'
                                multiline
                                className={cx('updated-input-tooltip', 'cn-tooltip', 'cn-sub-tooltip')}
                                arrowColor='#00ADE6'
                                textColor='rgba(255, 255, 255)'
                            />
                        </Link>
                    </motion.div>
                )}
                {((get(loComponent, 'componentName', false) === practiceQuestion) && !isPqReportNotAllowed()) && (
                    <motion.div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        whileHover={{y: -2}}
                        variants={loSubItemsVariant}
                    >
                        <Link
                            to={`${revisitString}/sessions/${this.getPQRoute()}/${courseId}/${topicId}/${get(Lo, 'id')}`}
                            key='Practice Report'
                            data-for={`${get(Lo, 'id')}#practiceReport`}
                            data-tip='Practice Report'
                            data-iscapture='true'
                            style={{transform: 'scale(0.8)',margin: 0}}
                            className={`progressIndicator-icon-ProgressCircle
                            ${(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'progressIndicator-completed'}

                            ${((computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`) && (get(Lo, 'id') === loId)) && 'progressIndicator-active'}

                            ${((this.checkIfLoStatusCompleted(get(loComponent, 'componentName'), Lo) && (computedMatch.path === `${revisitString}/sessions/${this.getPQRoute()}/:courseId/:topicId/:loId`)) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'progressIndicator-active-completed'}
                        `}
                        >
                            <div className={`progressIndicator-icon-container ${(!get(Lo, 'isUnlocked', false) && !this.props.revisitRoute) && 'progressIndicator-icon-locked'}`}>
                                <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets/practiceReport.svg')})` }} />
                            </div>
                            <ReactTooltip
                                id={`${get(Lo, 'id')}#practiceReport`}
                                place='bottom'
                                effect='float'
                                multiline
                                className={cx('updated-input-tooltip', 'cn-tooltip', 'cn-sub-tooltip')}
                                arrowColor='#00ADE6'
                                textColor='rgba(255, 255, 255)'
                            />
                        </Link>
                    </motion.div>
                )}
            </>
        ))}
    </motion.div>
    )
  }

  renderLearningObjectiveComponent = (filteredLo, course, revisitString, courseId, topicId, computedMatch, loId, componentRule) => {
    //   const currComp = get(componentRule, 'componentName')
      const currLoId = get(componentRule, 'learningObjective.id')
      if(isMobile()){
          return(
            (filteredLo && filteredLo.length) ? filteredLo
            .filter(el => get(el, 'id') === get(componentRule, 'learningObjective.id'))
            .map((Lo) => (
                <>
                    {this.getFilteredLoComponentRule(Lo, get(course, 'defaultLoComponentRule', []), (get(componentRule, 'learningObjectiveComponentsRule', []) || []), 0)
                        .map(loComponent => (
                        <div className={`losidebar
                                ${(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'losidebar-available'}
                            `}   onClick={()=> this.showLosubMenu(currLoId)}>
                        <div
                            key={get(loComponent, 'componentName') === chatbot ? 'chatComponent' : get(loComponent, 'componentName')}
                            className={`
                            sidebar-item
                            ${(get(Lo, 'id') === loId) && 'sidebar-item-active'}
                        `}
                        >
                        <div className={`sidebar-image
                       ${(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'sidebar-image-available'}
                        ${(get(Lo, 'id') === loId) && 'sidebar-image-active'}
                    `}><Target/></div>
                    <div className={`options
                        ${(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled())  && 'options-available'}
                        ${(get(Lo, 'id') === loId) && 'options-active'}
                    `}>{get(Lo,'title', '')}</div>
                        </div>
                        <div onClick={()=> this.showLosubMenu(currLoId)} className={'forward-arrow'}>
                        {(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) ? <div>{this.state.activeLoId && this.state.activeLoId === currLoId ? <DropDown2 /> : <Dropdown />}</div> : null}
                        </div>
                        </div>
                    ))}
                    {this.state.activeLoId && this.state.activeLoId === currLoId &&
                    <>
                        {this.renderLearningObjectiveOverlayMenu(Lo, course, revisitString, courseId, topicId, computedMatch, loId, componentRule)}
                    </>
                    }
                </>
            )) : null
          )
      }
      return(
        (filteredLo && filteredLo.length) ? filteredLo
        .filter(el => get(el, 'id') === get(componentRule, 'learningObjective.id'))
        .map((Lo) => (
        <>
            {/* Render First Lo Component by default along with all the components in a overaly menu! */}
                {this.getFilteredLoComponentRule(Lo, get(course, 'defaultLoComponentRule', []), (get(componentRule, 'learningObjectiveComponentsRule', []) || []), 0)
                    .map(loComponent => (
                <Link
                    to={`${revisitString}/sessions/${this.getLORedirectKey(loComponent)}/${courseId}/${topicId}/${get(Lo, 'id')}`}
                    key={get(loComponent, 'componentName') === chatbot ? 'chatComponent' : get(loComponent, 'componentName')}
                    onMouseEnter={() => {
                        this.setState({
                            isLoOverlayMenuVisible: true,
                        })
                    }}
                    onMouseLeave={() => {
                        this.setState({
                            isLoOverlayMenuVisible: false,
                        })
                    }}
                    className={`
                    progressIndicator-icon-ProgressCircle
                    ${(get(Lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'progressIndicator-completed'}

                    ${(get(Lo, 'id') === loId) && 'progressIndicator-active'}

                    ${((this.checkIfLoStatusCompleted(get(loComponent, 'componentName'), Lo) && (get(Lo, 'id') === loId)) || this.props.revisitRoute || checkIfEmbedEnabled()) && 'progressIndicator-active-completed'}
                `}
                >
                    {(!chatbot || get(Lo, 'questionBankMeta.count', 0) > 0 || get(Lo, 'learningSlidesMeta.count', 0) > 0) && (
                        <>
                            <motion.span
                                animate={{
                                    opacity: this.state.isLoOverlayMenuVisible ? 0 : 1,
                                    transition: {
                                        duration: 0.2
                                    }
                                }}
                                className='lo-component-cicle-stretched'
                            />
                            <motion.span
                                animate={{
                                    opacity: this.state.isLoOverlayMenuVisible ? 0 : 1,
                                    transition: {
                                        duration: 0.2
                                    }
                                }}
                                className='lo-component-cicle-stretched-rightArrow'
                            />
                        </>
                    )}
                    <div className={`progressIndicator-icon-container ${(!get(Lo, 'isUnlocked', false) && !this.props.revisitRoute) && 'progressIndicator-icon-locked'}`}>
                        <div className='progressIndicator-icon' style={{ backgroundImage: `url(${this.getLoIconBasedOnComponent(loComponent, this.getFilteredLoComponentRule(Lo, get(course, 'defaultLoComponentRule', []), (get(componentRule, 'learningObjectiveComponentsRule', []) || [])), true)})` }} />
                    </div>
                    {(!chatbot || get(Lo, 'questionBankMeta.count', 0) > 0 || get(Lo, 'learningSlidesMeta.count', 0) > 0) && this.renderLearningObjectiveOverlayMenu(Lo, course, revisitString, courseId, topicId, computedMatch, loId, componentRule)}
                </Link>
            ))}
        </>
    )) : null
      )

}

  renderBlockbasedProjectComponent = (blockBasedProjects, revisitString, courseId, topicId, computedMatch, isUserBlockBasedProjectsComplete,componentRule) => {
    //const compname = get(componentRule, 'componentName', '')
    if(isMobile()){
        return(
            blockBasedProjects && blockBasedProjects.toJS().length ? (
                <Link
                    to={`${revisitString}/sessions/project/${courseId}/${topicId}/${blockBasedProjects.getIn([0, 'id'])}`}
                    key='project'
                    data-for='project'
                    data-tip='Project'
                    data-iscapture='true'
                    className={`
                        sidebar-item
                        ${(blockBasedProjects.getIn([0, 'isUnlocked'], false) || this.props.revisitRoute || checkIfEmbedEnabled()) &&'sidebar-item'}
                        ${(computedMatch.path === `${revisitString}/sessions/project/:courseId/:topicId/:projectId`) && 'sidebar-item-active'}
                    `}
                >
                    <div className={`sidebar-image
                        ${(blockBasedProjects.getIn([0, 'isUnlocked'], false) || this.props.revisitRoute || checkIfEmbedEnabled()) &&'sidebar-image-available'}
                        ${(computedMatch.path === `${revisitString}/sessions/project/:courseId/:topicId/:projectId`) && 'sidebar-image-active'}
                    `}><Brush /></div>
                    <div className={`options
                        ${(blockBasedProjects.getIn([0, 'isUnlocked'], false) || this.props.revisitRoute || checkIfEmbedEnabled()) &&'options-available'}
                        ${(computedMatch.path === `${revisitString}/sessions/project/:courseId/:topicId/:projectId`) && 'options-active'}
                    `}>Project
                    </div>
                </Link>
            ) : null
        )
    }
    return(
        blockBasedProjects && blockBasedProjects.toJS().length ? (
            <Link
                to={`${revisitString}/sessions/project/${courseId}/${topicId}/${blockBasedProjects.getIn([0, 'id'])}`}
                key='project'
                data-for='project'
                data-tip='Project'
                data-iscapture='true'
                className={`
                    progressIndicator-icon-ProgressCircle
                    ${(blockBasedProjects.getIn([0, 'isUnlocked'], false) || this.props.revisitRoute || checkIfEmbedEnabled()) &&'progressIndicator-completed'}
                    ${(computedMatch.path === `${revisitString}/sessions/project/:courseId/:topicId/:projectId`) && 'progressIndicator-active'}
                    ${(isUserBlockBasedProjectsComplete && (computedMatch.path === `${revisitString}/sessions/project/:courseId/:topicId/:projectId`)) && 'progressIndicator-active-completed'}
                `}
            >
                <div className='progressIndicator-icon-container'>
                    <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets//brush-outline.png')})` }} />
                </div>
            </Link>
        ) : null
    )

    }

  renderBlockbasedPracticeComponent = (blockBasedPractice, revisitString, courseId, topicId, computedMatch, isUserBlockBasedPracticesComplete, componentRule, projectId) => {
    const isActive = (get(componentRule, 'blockBasedProject.id', null) === projectId)
    //const compname = get(componentRule, 'componentName', '')
    const practiceDoc = ((blockBasedPractice && blockBasedPractice.toJS()) || []).filter(el => get(el, 'id') === get(componentRule, 'blockBasedProject.id', null))
    const userBlockBasedPractice =  ((this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.toJS()) || []).filter(el => get(el, 'blockBasedPractice.id') === get(componentRule, 'blockBasedProject.id', null))
    if(isMobile()){
        return (blockBasedPractice && blockBasedPractice.toJS().length) ? (
            <Link
                to={`${revisitString}/sessions/practice/${courseId}/${topicId}/${get(practiceDoc[0], 'id')}`}
                key='practice'
                data-for='practice'
                data-tip='Practice'
                data-iscapture='true'
                className={`
                    sidebar-item
                    ${(get(practiceDoc[0], 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) &&'sidebar-item'}
                    ${isActive && 'sidebar-item-active'}
                `}
            >
                <div className={`sidebar-image
                        ${(get(practiceDoc[0], 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) &&'sidebar-image-available'}
                        ${isActive && 'sidebar-image-active'}
                    `}><DocIcon /></div>
                    <div className={`options
                        ${(get(practiceDoc[0], 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) &&'options-available'}
                        ${isActive && 'options-active'}
                    `}>Practice
                    </div>
            </Link>
        ) : null
    }
    return (blockBasedPractice && blockBasedPractice.toJS().length) ? (
        <Link
            to={`${revisitString}/sessions/practice/${courseId}/${topicId}/${get(practiceDoc[0], 'id')}`}
            key='practice'
            data-for='practice'
            data-tip='Practice'
            data-iscapture='true'
            className={`
                progressIndicator-icon-ProgressCircle
                ${(get(practiceDoc[0], 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) &&'progressIndicator-completed'}
                ${isActive && 'progressIndicator-active'}
                ${((get(userBlockBasedPractice[0], 'status') === 'complete') && isActive) && 'progressIndicator-active-completed'}
            `}
        >
            <div className='progressIndicator-icon-container'>
                <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets/practice-icon.png')})` }} />
            </div>
        </Link>
    ) : null
  }
  renderCodingAssignment = (filteredLo, revisitString, courseId, topicId, computedMatch, codingAssignment,componentRule) => {
    if (filteredLo && filteredLo.length < 0) return <></>;
    const lo = get(filteredLo, filteredLo.length - 1);
    //const compname = get(componentRule, 'componentName', '')
    const isPQComplete = get(lo, 'practiceQuestionStatus') === 'complete'
    if(isMobile()){
        return(
            codingAssignment ? (
                <Link
                to={`${revisitString}/sessions/coding/${courseId}/${topicId}`}
                key='coding'
                data-for='codingAssignment'
                data-tip='Coding'
                data-iscapture='true'
                className={`
                sidebar-item
                    ${(computedMatch.path === `${revisitString}/sessions/coding/:courseId/:topicId`) && 'sidebar-item-active'}
                `}
            >
                <div className={`sidebar-image
                        ${(get(lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) &&'sidebar-image-available'}
                        ${(computedMatch.path === `${revisitString}/sessions/coding/:courseId/:topicId`) && 'sidebar-image-active'}
                    `}><Brush/></div>
                    <div className={`options
                        ${(get(lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) &&'options-available'}
                        ${(computedMatch.path === `${revisitString}/sessions/coding/:courseId/:topicId`) && 'options-active'}
                    `}>Code</div>
            </Link>
        ) : null
            )
    }
    return (
        codingAssignment ? (
            <Link
                to={`${revisitString}/sessions/coding/${courseId}/${topicId}`}
                key='coding'
                data-for='codingAssignment'
                data-tip='Coding'
                data-iscapture='true'
                className={`
                    progressIndicator-icon-ProgressCircle
                    ${(get(lo, 'isUnlocked', false) || this.props.revisitRoute || checkIfEmbedEnabled()) &&'progressIndicator-completed'}
                    ${(computedMatch.path === `${revisitString}/sessions/coding/:courseId/:topicId`) && 'progressIndicator-active'}
                    ${(isPQComplete && (computedMatch.path === `${revisitString}/sessions/coding/:courseId/:topicId`)) && 'progressIndicator-active-completed'}
                `}
            >
                <div className='progressIndicator-icon-container'>
                    <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets/code-slash-outline.svg')})` }} />
                </div>
            </Link>
        ) : null
    )
  }

  renderReactTooltips = () => (
      <>
        <ReactTooltip
            id='videoComponent'
            place='right'
            effect='float'
            multiline
            className={cx('updated-input-tooltip', 'cn-tooltip')}
            arrowColor='#005773'
            textColor='rgba(255, 255, 255)'
        />
        <ReactTooltip
            id='homeworkPracticeComponent'
            place='right'
            effect='float'
            multiline
            className={cx('updated-input-tooltip', 'cn-tooltip')}
            arrowColor='#005773'
            textColor='rgba(255, 255, 255)'
        />
        <ReactTooltip
            id='chatComponent'
            place='right'
            effect='float'
            multiline
            className={cx('updated-input-tooltip', 'cn-tooltip')}
            arrowColor='#005773'
            textColor='rgba(255, 255, 255)'
        />
        <ReactTooltip
            id='project'
            place='right'
            effect='float'
            multiline
            className={cx('updated-input-tooltip', 'cn-tooltip')}
            arrowColor='#005773'
            textColor='rgba(255, 255, 255)'
        />
        <ReactTooltip
            id='practice'
            place='right'
            effect='float'
            multiline
            className={cx('updated-input-tooltip', 'cn-tooltip')}
            arrowColor='#005773'
            textColor='rgba(255, 255, 255)'
        />
        <ReactTooltip
            id='codingAssignment'
            place='right'
            effect='float'
            multiline
            className={cx('updated-input-tooltip', 'cn-tooltip')}
            arrowColor='#005773'
            textColor='rgba(255, 255, 255)'
        />
        <ReactTooltip
            id='homeworkQuiz'
            place='right'
            effect='float'
            multiline
            className={cx('updated-input-tooltip', 'cn-tooltip')}
            arrowColor='#005773'
            textColor='rgba(255, 255, 255)'
        />
        <ReactTooltip
            id='homeworkCoding'
            place='right'
            effect='float'
            multiline
            className={cx('updated-input-tooltip', 'cn-tooltip')}
            arrowColor='#005773'
            textColor='rgba(255, 255, 255)'
        />
        <ReactTooltip
            id='quizReport'
            place='right'
            effect='float'
            multiline
            className={cx('updated-input-tooltip', 'cn-tooltip')}
            arrowColor='#005773'
            textColor='rgba(255, 255, 255)'
        />
        <ReactTooltip
            id='sessionHomeworkQuiz'
            place='bottom'
            effect='float'
            multiline
            className={cx('updated-input-tooltip', 'cn-tooltip', 'cn-sub-tooltip')}
            arrowColor='#00ADE6'
            textColor='rgba(255, 255, 255)'
        />
        <ReactTooltip
            id='sessionHomeworkPractice'
            place='bottom'
            effect='float'
            multiline
            className={cx('updated-input-tooltip', 'cn-tooltip', 'cn-sub-tooltip')}
            arrowColor='#00ADE6'
            textColor='rgba(255, 255, 255)'
        />
        <ReactTooltip
            id='sessionHomeworkCoding'
            place='bottom'
            effect='float'
            multiline
            className={cx('updated-input-tooltip', 'cn-tooltip', 'cn-sub-tooltip')}
            arrowColor='#00ADE6'
            textColor='rgba(255, 255, 255)'
        />
      </>
  )

  renderQuizReportComponent = (revisitString, courseId, topicId, computedMatch, homeworkInPreSession, prevTopicComponent, isSubmittedForReview) => {
    const { assignmentComponent, quizComponent, practiceComponent } = homeworkInPreSession
    const quizReportTopicId = get(prevTopicComponent, 'id')
    if (assignmentComponent || quizComponent || practiceComponent) {
        if (isMobile()) {
            return (
                quizReportTopicId && (
                    <Link
                        to={{ pathname: `/sessions/quiz-report-latest/${courseId}/${topicId}`,
                        state: { quizReportTopicId } }}
                        key='quizReport'
                        className={`
                        sidebar-item
                            ${((computedMatch.path === '/sessions/quiz-report-latest/:courseId/:topicId') || 
                    (computedMatch.path === '/sessions/:courseId/:topicId/quiz') ||
                    (computedMatch.path === '/sessions/:courseId/:topicId/codingAssignment') || 
                    (computedMatch.path === '/sessions/:courseId/:topicId/:projectId/practice')
                    ) && 'sidebar-item-active'}
                        `}
                    >
                        <div className={`sidebar-image sidebar-image-available
                                ${((computedMatch.path === '/sessions/quiz-report-latest/:courseId/:topicId') || 
                    (computedMatch.path === '/sessions/:courseId/:topicId/quiz') ||
                    (computedMatch.path === '/sessions/:courseId/:topicId/codingAssignment') || 
                    (computedMatch.path === '/sessions/:courseId/:topicId/:projectId/practice')
                    ) && 'sidebar-image-active'}
                            `}><Practice /></div>
                            <div className={`options options-available
                                ${((computedMatch.path === '/sessions/quiz-report-latest/:courseId/:topicId') || 
                    (computedMatch.path === '/sessions/:courseId/:topicId/quiz') ||
                    (computedMatch.path === '/sessions/:courseId/:topicId/codingAssignment') || 
                    (computedMatch.path === '/sessions/:courseId/:topicId/:projectId/practice')
                    ) && 'options-active'}
                            `}>Quiz Report</div>
                    </Link>
                )
            )
        }
        return (
            <Link
                to={{ pathname: checkIfEmbedEnabled() ? `/sessions/homework-review/${courseId}/${topicId}` : `/sessions/quiz-report-latest/${courseId}/${topicId}`,
                    state: { quizReportTopicId } }}
                key='quizReport'
                onMouseEnter={() => {this.setState({isQuizReportMenuVisible: true,})}}
                onMouseLeave={() => {this.setState({isQuizReportMenuVisible: false,})}}
                className={`progressIndicator-icon-ProgressCircle progressIndicator-completed
                ${((computedMatch.path === '/sessions/quiz-report-latest/:courseId/:topicId') || 
                (computedMatch.path === '/sessions/:courseId/:topicId/quiz') ||
                (computedMatch.path === '/sessions/:courseId/:topicId/codingAssignment') || 
                (computedMatch.path === '/sessions/:courseId/:topicId/:projectId/practice') ||
                (computedMatch.path === '/sessions/homework-review/:courseId/:topicId')
                ) && 'progressIndicator-active progressIndicator-active-completed'}
            `}
            >
                {!checkIfEmbedEnabled() ? (
                    <>
                        <motion.span animate={{ opacity: this.state.isQuizReportMenuVisible ? 0 : 1,transition: {duration: 0.2}}}
                            className='lo-component-cicle-stretched' />
                        <motion.span animate={{opacity: this.state.isQuizReportMenuVisible ? 0 : 1,transition: {duration: 0.2}}}
                            className='lo-component-cicle-stretched-rightArrow' />
                    </>
                ) : null}
                <div className='progressIndicator-icon-container'>
                    <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets/information-outline.svg')})` }} />
                </div>
                {/* OVERLAY START */}
                {isSubmittedForReview && (
                    <motion.div className='loOverlayMenu' initial='closed' animate={this.state.isQuizReportMenuVisible ? 'open' : 'closed'}
                        layout variants={loSubItemsParentVariant}>
                            {quizComponent && (
                                <motion.div style={{display: 'flex',alignItems: 'center',justifyContent: 'center', }}
                                    whileHover={{y: -2}} variants={loSubItemsVariant}>
                                    <Link
                                        to={{ pathname: `/sessions/${courseId}/${topicId}/quiz`,
                                            state: { quizReportTopicId } }}
                                        data-for='sessionHomeworkQuiz'
                                        data-tip='Quiz'
                                        data-iscapture='true'
                                        style={{transform: 'scale(0.8)',margin: 0}}
                                        className={`progressIndicator-icon-ProgressCircle progressIndicator-completed progressIndicator-active-completed`}
                                    >
                                        <div className='progressIndicator-icon-container'>
                                            <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets/help-circle-outline.svg')})` }} />
                                        </div>
                                    </Link>
                                </motion.div>
                            )}
                            {assignmentComponent && (
                                <motion.div style={{display: 'flex',alignItems: 'center',justifyContent: 'center', }}
                                    whileHover={{y: -2}} variants={loSubItemsVariant}>
                                    <Link
                                        to={{ pathname: `/sessions/${courseId}/${topicId}/codingAssignment`,
                                        state: { quizReportTopicId } }}
                                        data-for='sessionHomeworkCoding'
                                        data-tip='Coding'
                                        data-iscapture='true'
                                        style={{transform: 'scale(0.8)',margin: 0}}
                                        className={`progressIndicator-icon-ProgressCircle progressIndicator-completed progressIndicator-active-completed`}
                                    >
                                        <div className='progressIndicator-icon-container'>
                                            <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets/code-slash-outline.svg')})` }} />
                                        </div>
                                    </Link>
                                </motion.div>
                            )}
                            {practiceComponent && (
                                <motion.div style={{display: 'flex',alignItems: 'center',justifyContent: 'center', }}
                                    whileHover={{y: -2}} variants={loSubItemsVariant}>
                                    <Link
                                        to={{ pathname: `/sessions/${courseId}/${topicId}/${get(practiceComponent, 'blockBasedProject.id')}/practice`,
                                        state: { quizReportTopicId } }}
                                        data-for='sessionHomeworkPractice'
                                        data-tip='Practice'
                                        data-iscapture='true'
                                        style={{transform: 'scale(0.8)',margin: 0}}
                                        className={`progressIndicator-icon-ProgressCircle progressIndicator-completed progressIndicator-active-completed`}
                                    >
                                        <div className='progressIndicator-icon-container'>
                                            <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets/practice-icon.png')})` }} />
                                        </div>
                                    </Link>
                                </motion.div>
                            )}
                    </motion.div>
                )}
                {/* OVERLAY END */}
            </Link>
        )
    }
    return <></>
  }

  getFilteredTopicComponentRule = () => {
    const ignoreComponentMap = ['learningObjective']
    const topicComponentRule = get(this.getCurrentTopicObj(), 'topicComponentRule', [])
    const filteredRule = []
    if (topicComponentRule && topicComponentRule.length) {
        topicComponentRule.reduce((prevComponent, currentComponent) => {
            if ((get(prevComponent, 'componentName') === get(currentComponent, 'componentName'))
            && filteredRule.filter(e => get(e, 'componentName') === get(currentComponent, 'componentName')).length
            && !ignoreComponentMap.includes(get(currentComponent, 'componentName'))
            ) {
                return currentComponent
            } else {
                filteredRule.push(currentComponent)
                return currentComponent
            }
        }, topicComponentRule[0])
        return filteredRule
    }
    return []
  }

  renderSessionSideNav = (revisitString, courseId, topicId, computedMatch,
    isUserVideoCompleted, filteredLo, course, loId, blockBasedProjects, isUserBlockBasedProjectsComplete,
    blockBasedPractice, isUserBlockBasedPracticesComplete, shouldCodingAssignment, homeworkInPreSession,
    prevTopicComponent, isSubmittedForReview, videoId, projectId) => {
        const filteredTopicComponentRule = this.getFilteredTopicComponentRule()
        if(isMobile()){
            return(
                <>
                    {(revisitString === '') && (
                        this.renderQuizReportComponent(revisitString, courseId, topicId, computedMatch, homeworkInPreSession, prevTopicComponent, isSubmittedForReview)
                    )}
                    {filteredTopicComponentRule && filteredTopicComponentRule.map((componentRule) => {
                        if (get(componentRule, 'componentName') === 'video')
                            return this.renderVideoComponent(revisitString, courseId, topicId, computedMatch, isUserVideoCompleted, componentRule, videoId)
                        else if (get(componentRule, 'componentName') === 'learningObjective')
                            return this.renderLearningObjectiveComponent(filteredLo, course, revisitString, courseId, topicId, computedMatch, loId, componentRule,componentRule)
                        else if (get(componentRule, 'componentName') === 'blockBasedPractice')
                            return this.renderBlockbasedPracticeComponent(blockBasedPractice, revisitString, courseId, topicId, computedMatch, isUserBlockBasedPracticesComplete, componentRule, projectId,componentRule)
                        else if (get(componentRule, 'componentName') === 'blockBasedProject')
                            return this.renderBlockbasedProjectComponent(blockBasedProjects, revisitString, courseId, topicId, computedMatch, isUserBlockBasedProjectsComplete,componentRule)
                        else if (get(componentRule, 'componentName') === 'assignment')
                            return this.renderCodingAssignment(filteredLo, revisitString, courseId, topicId, computedMatch, shouldCodingAssignment,componentRule)
                        else { return <></> }
                    })}
                </>
            )
        }
        return (
        <>
            {(revisitString === '') && (
                this.renderQuizReportComponent(revisitString, courseId, topicId, computedMatch, homeworkInPreSession, prevTopicComponent, isSubmittedForReview)
            )}
            {filteredTopicComponentRule && filteredTopicComponentRule.map((componentRule) => {
                if (get(componentRule, 'componentName') === 'video')
                    return this.renderVideoComponent(revisitString, courseId, topicId, computedMatch, isUserVideoCompleted, componentRule, videoId)
                else if (get(componentRule, 'componentName') === 'learningObjective')
                    return this.renderLearningObjectiveComponent(filteredLo, course, revisitString, courseId, topicId, computedMatch, loId, componentRule)
                else if (get(componentRule, 'componentName') === 'blockBasedPractice')
                    return this.renderBlockbasedPracticeComponent(blockBasedPractice, revisitString, courseId, topicId, computedMatch, isUserBlockBasedPracticesComplete, componentRule, projectId)
                else if (get(componentRule, 'componentName') === 'blockBasedProject')
                    return this.renderBlockbasedProjectComponent(blockBasedProjects, revisitString, courseId, topicId, computedMatch, isUserBlockBasedProjectsComplete)
                else if (get(componentRule, 'componentName') === 'assignment')
                    return this.renderCodingAssignment(filteredLo, revisitString, courseId, topicId, computedMatch, shouldCodingAssignment)
                else { return <></> }
            })}
            {/* Vertical Progress Bar */}
            <div className='progressIndicator-progress-bar'>
            <div className='progressIndicator-progress-bar-active' style={{ height: `${this.calcOverallComponentProgress(
                    this.getisVideoComponentUnlocked(),
                    this.getIsLOComponentUnlocked(filteredLo),
                    blockBasedProjects && blockBasedProjects.getIn([0, 'isUnlocked'], false),
                    blockBasedPractice && blockBasedPractice.getIn([0, 'isUnlocked'], false),
                    shouldCodingAssignment,
                    true,
                    filteredLo ? filteredLo.length : 1,
                    (blockBasedPractice && blockBasedPractice.toJS()) ? blockBasedPractice.toJS().length : 1,
                )}%` }} />
            </div>
        </>
        )
    }

  calcHomeworkProgress = (isQuizSubmitted, isAssignmentSubmitted, isSubmittedForReview, isPracticeSubmitted) => {
    let componentsUnlocked=0,totalComponents=0
    const {quizComponent, assignmentComponent, practiceComponent} = this.getHomeWorkComponents()
    totalComponents = quizComponent ? totalComponents+1 : totalComponents
    totalComponents = assignmentComponent ? totalComponents+1 : totalComponents
    totalComponents = practiceComponent ? totalComponents+1 : totalComponents
    if (isSubmittedForReview) {
        totalComponents += 1
        componentsUnlocked += 1
    }
    if (isQuizSubmitted && quizComponent) {
        componentsUnlocked += 1
    }
    if (isAssignmentSubmitted && assignmentComponent) {
        componentsUnlocked += 1
    }
    if (isPracticeSubmitted && practiceComponent) {
        componentsUnlocked += 1
    }
    return (componentsUnlocked/totalComponents)*100
  }

  getHomeWorkComponents = (prevTopic) => {
      let topicComponentRule = []
      if (prevTopic) {
        topicComponentRule = get(prevTopic, 'topicComponentRule', [])
      } else {
        topicComponentRule = get(this.getCurrentTopicObj(), 'topicComponentRule', [])
      }
      const homeworkComponentRule = topicComponentRule.filter(e => homeworkComponents.includes(get(e, 'componentName')))
      const quizComponent = topicComponentRule.filter(rule => get(rule, 'componentName') === 'quiz')[0] || null
      const assignmentComponent = topicComponentRule.filter(rule => get(rule, 'componentName') === 'homeworkAssignment')[0] || null
      const practiceComponent = topicComponentRule.filter(rule => get(rule, 'componentName') === 'homeworkPractice')[0] || null
      return {
          quizComponent,
          assignmentComponent,
          practiceComponent,
          homeworkComponentRule,
      }
  }

  renderHomeworkSideNav = (revisitString, courseId, topicId, computedMatch, isSubmittedForReview) => {
    const { mentorMenteeSession } = this.props
    const isQuizSubmitted = mentorMenteeSession && mentorMenteeSession.getIn([0, 'isQuizSubmitted'])
    const isAssignmentSubmitted = mentorMenteeSession && mentorMenteeSession.getIn([0, 'isAssignmentSubmitted'])
    const isPracticeSubmitted = mentorMenteeSession && mentorMenteeSession.getIn([0, 'isPracticeSubmitted'])
    const {quizComponent, assignmentComponent, practiceComponent} = this.getHomeWorkComponents()
    if (isMobile()) {
        return (
          <>
            {(isSubmittedForReview && quizComponent) && (
              <Link
                to={`/quiz-report-latest/${courseId}/${topicId}`}
                className={`
                            sidebar-item
                            ${computedMatch.path ===
                              `/quiz-report-latest/:courseId/:topicId` &&
                              "sidebar-item-active"}
                        `}
              >
                <div
                  className={`sidebar-image sidebar-image-available
                            ${computedMatch.path ===
                              `/quiz-report-latest/:courseId/:topicId` &&
                              "sidebar-image-active"}
                        `}
                >
                  <HintIcon />
                </div>
                <div
                  className={`options options-available
                            ${computedMatch.path ===
                              `/quiz-report-latest/:courseId/:topicId` &&
                              "options-active"}
                        `}
                >
                  Report
                </div>
              </Link>
            )}
            {quizComponent && (
              <Link
                to={`${revisitString}/homework/${courseId}/${topicId}/quiz`}
                className={`sidebar-item
                    ${computedMatch.path ===
                      `${revisitString}/homework/:courseId/:topicId/quiz` &&
                      "sidebar-item-active"}
                `}
              >
                <div
                  className={`sidebar-image sidebar-image-available
                            ${computedMatch.path ===
                              `${revisitString}/homework/:courseId/:topicId/quiz` &&
                              "sidebar-image-active"}
                        `}
                >
                  <DocIcon />
                </div>
                <div
                  className={`options options-available
                            ${computedMatch.path ===
                              `${revisitString}/homework/:courseId/:topicId/quiz` &&
                              "options-active"}
                        `}
                >
                  Quiz
                </div>
              </Link>
            )}
            {assignmentComponent && (
              <Link
                to={`${revisitString}/homework/${courseId}/${topicId}/codingAssignment`}
                className={`sidebar-item
                    ${computedMatch.path ===
                      `${revisitString}/homework/:courseId/:topicId/codingAssignment` &&
                      "sidebar-item-active"}
                `}
              >
                <div
                  className={`sidebar-image sidebar-image-available
                            ${computedMatch.path ===
                              `${revisitString}/homework/:courseId/:topicId/codingAssignment` &&
                              "sidebar-image-active"}
                        `}
                >
                  <Brush />
                </div>
                <div
                  className={`options options-available
                            ${computedMatch.path ===
                              `${revisitString}/homework/:courseId/:topicId/codingAssignment` &&
                              "options-active"}
                        `}
                >
                  Assignment
                </div>
              </Link>
            )}
            {practiceComponent && (
              <Link
                to={`/homework/${courseId}/${topicId}/${get(
                  practiceComponent,
                  "blockBasedProject.id"
                )}/practice`}
                className={`sidebar-item
                    ${computedMatch.path ===
                      `${revisitString}/homework/:courseId/:topicId/:projectId/practice` &&
                      "sidebar-item-active"}
                `}
              >
                <div
                  className={`sidebar-image sidebar-image-available
                            ${computedMatch.path ===
                              `${revisitString}/homework/:courseId/:topicId/:projectId/practice` &&
                              "sidebar-image-active"}
                        `}
                >
                  <Practice />
                </div>
                <div
                  className={`options options-available
                            ${computedMatch.path ===
                              `${revisitString}/homework/:courseId/:topicId/:projectId/practice` &&
                              "options-active"}
                        `}
                >
                  Practice
                </div>
              </Link>
            )}
            {(!isSubmittedForReview && !checkIfEmbedEnabled()) && (
                <div className='progressIndicator-individual-progress' style={{
                    position: 'absolute', bottom: '10px', left: '50%', margin: '20px 0px 8px', zIndex: '9999', transform: 'translateX(-50%)',
                }}>
                    <Button3D
                        outerContainerStyle={{marginTop: '22px', pointerEvents: 'all'}}
                        innerTextContainerStyle={{fontSize: '12px'}}
                        style={{whiteSpace: 'nowrap'}}
                        title='SUBMIT FOR REVIEW'
                        disabled={!this.checkIfHomeworkCompleted(mentorMenteeSession)}
                        onClick={this.checkIfHomeworkCompleted(mentorMenteeSession) && this.showSubmitOverlay}
                    />
                </div>
            )}
          </>
        );
    }
    return (
        <>
        {(isSubmittedForReview && quizComponent) && (
            <Link
                to={`/quiz-report-latest/${courseId}/${topicId}`}
                key='quizReport'
                data-for='quizReport'
                data-tip='Report'
                data-iscapture='true'
                className={`
                    progressIndicator-icon-ProgressCircle
                    ${(true || this.props.revisitRoute) &&'progressIndicator-completed'}
                    ${(computedMatch.path === `/quiz-report-latest/:courseId/:topicId`) && 'progressIndicator-active'}
                    ${(computedMatch.path === `/quiz-report-latest/:courseId/:topicId`) && 'progressIndicator-active-completed'}
                `}
            >
                <div className='progressIndicator-icon-container'>
                    <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets/information-outline.svg')})` }} />
                </div>
            </Link>
        )}
        {quizComponent && (
            <Link
                to={`${revisitString}/homework/${courseId}/${topicId}/quiz`}
                key='homeworkQuiz'
                data-for='homeworkQuiz'
                data-tip='Quiz'
                data-iscapture='true'
                className={`
                    progressIndicator-icon-ProgressCircle progressIndicator-completed
                    ${(computedMatch.path === `${revisitString}/homework/:courseId/:topicId/quiz`) && 'progressIndicator-active'}
                    ${(isQuizSubmitted && (computedMatch.path === `${revisitString}/homework/:courseId/:topicId/quiz`)) && 'progressIndicator-active-completed'}
                `}
            >
                <div className='progressIndicator-icon-container'>
                    <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets/help-circle-outline.svg')})` }} />
                </div>
            </Link>
        )}
        {assignmentComponent && (
            <Link
                to={`${revisitString}/homework/${courseId}/${topicId}/codingAssignment`}
                key='homeworkCoding'
                data-for='homeworkCoding'
                data-tip='Coding'
                data-iscapture='true'
                className={`
                    progressIndicator-icon-ProgressCircle progressIndicator-completed
                    ${(computedMatch.path === `${revisitString}/homework/:courseId/:topicId/codingAssignment`) && 'progressIndicator-active'}
                    ${(isAssignmentSubmitted && (computedMatch.path === `${revisitString}/homework/:courseId/:topicId/codingAssignment`)) && 'progressIndicator-active-completed'}
                `}
            >
                <div className='progressIndicator-icon-container'>
                    <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets/code-slash-outline.svg')})` }} />
                </div>
            </Link>
        )}
        {practiceComponent && (
            <Link
                to={`/homework/${courseId}/${topicId}/${get(practiceComponent, 'blockBasedProject.id')}/practice`}
                key='homeworkPracticeComponent'
                data-for='homeworkPracticeComponent'
                data-tip='Practice'
                data-iscapture='true'
                className={`
                    progressIndicator-icon-ProgressCircle progressIndicator-completed
                    ${(computedMatch.path === `${revisitString}/homework/:courseId/:topicId/:projectId/practice`) && 'progressIndicator-active'}
                    ${(isPracticeSubmitted && (computedMatch.path === `${revisitString}/homework/:courseId/:topicId/:projectId/practice`)) && 'progressIndicator-active-completed'}
                `}
            >
                <div className='progressIndicator-icon-container'>
                    <div className='progressIndicator-icon' style={{ backgroundImage: `url(${require('../../assets/practice-icon.png')})` }} />
                </div>
            </Link>
        )}
        {/* Vertical Progress Bar */}
        <div className='progressIndicator-progress-bar'>
                <div className='progressIndicator-progress-bar-active'
                    style={{
                      height: `${this.calcHomeworkProgress(isQuizSubmitted, isAssignmentSubmitted, isSubmittedForReview, isPracticeSubmitted)}%`
                    }} />
        </div>
        </>
    )
  }

  submitForReview = async () => {
    const { mentorMenteeSession, computedMatch } = this.props
    const shouldSubmit = this.checkIfHomeworkCompleted(mentorMenteeSession)
    const topicId = computedMatch.params.topicId
    let sessionId = null
    //   const badgeInCache = unlockBadge &&
    //     filterKey(unlockBadge, `unlockBadge/quiz/${topicId}`)
    if (mentorMenteeSession && mentorMenteeSession.toJS().length > 0) {
        mentorMenteeSession.toJS().forEach((session) => {
            if (session.topicId === topicId) {
                sessionId = session.id
            }
        })
    }

    if (shouldSubmit && sessionId) {
        const input = {
            isSubmittedForReview: true
        }
    //   if(badgeInCache){
    //     const badgeToJS  = badgeInCache.toJS()
    //     if (badgeToJS, badgeToJS.length) {
    //         this.setState({
    //           showBadgeOverlay: true,
    //           badge: badgeToJS[0].badge
    //         })
    //     }
    //   } else if (badgeInCache && !badgeInCache.size) {
    //       //directly assigning the destructured variables to local variables
    //       await fetchBadge(topicId, 'video', true).call()
    //   }
      updateMentorMenteeSession(sessionId, input, topicId, true).call()
    }
  }

  getSubmitOverlayMsg = () => {
      const { mentorMenteeSession, computedMatch } = this.props
      const { quizComponent, assignmentComponent, practiceComponent } = this.getHomeWorkComponents()
      if (mentorMenteeSession) {
        if (quizComponent && assignmentComponent && practiceComponent) {
            if (!mentorMenteeSession.getIn([0, 'isQuizSubmitted']) && this.state.reviewSubmitClicked) {
                return 'Complete quiz before submitting!'
            } else if (!mentorMenteeSession.getIn([0, 'isAssignmentSubmitted']) && this.state.reviewSubmitClicked) {
                return 'Complete coding assignment before submitting!'
            } else if (!mentorMenteeSession.getIn([0, 'isPracticeSubmitted']) && this.state.reviewSubmitClicked) {
                return 'Complete practice before submitting!'
            }
        } else if (quizComponent && assignmentComponent) {
            if (!mentorMenteeSession.getIn([0, 'isQuizSubmitted']) && this.state.reviewSubmitClicked) {
                return 'Complete quiz before submitting!'
            } else if (!mentorMenteeSession.getIn([0, 'isAssignmentSubmitted']) && this.state.reviewSubmitClicked) {
                return 'Complete coding assignment before submitting!'
            }
        } else if (quizComponent || assignmentComponent || practiceComponent) {
            if (quizComponent && !mentorMenteeSession.getIn([0, 'isQuizSubmitted']) && this.state.reviewSubmitClicked) {
                return 'Complete quiz before submitting!'
            }
            if (assignmentComponent && !mentorMenteeSession.getIn([0, 'isAssignmentSubmitted']) && this.state.reviewSubmitClicked) {
                return 'Complete coding assignment before submitting!'
            }
            if (practiceComponent && !mentorMenteeSession.getIn([0, 'isPracticeSubmitted']) && this.state.reviewSubmitClicked) {
                return 'Complete practice before submitting!'
            }
        }
        if (this.state.reviewSubmitClicked) {
            return 'Are you sure you want to submit the homework for review?'
        } else if (this.state.showSubmitOverlay) {
            return (
                <>
                    Homework completed!
                    <span>You can submit it for review now.<br /><i>(Note: Once submitted, you cannot change the answers)</i></span>
                </>
            )
        }
      }
  }

  showSubmitOverlay = () => {
      this.setState({
          reviewSubmitClicked: true
      })
  }

  closeOverlay = () => {
      this.setState({
          reviewSubmitClicked: false,
          showSubmitOverlay: false
      })
  }

  getTopicsArr = (allTopics = false) => {
    const { topicsData, courseData } = this.state
    let topics = this.props.topic && this.props.topic.toJS()
    if (allTopics) {
        topics = courseData.topics
    } else if (topicsData && topicsData.length) {
        topics = topicsData
    }
    return topics
  }
  getCurrentTopicObj = () => {
      const { topicId: currentTopicId } = this.props.computedMatch.params
      const topics = this.getTopicsArr()
      if (currentTopicId && topics && topics.length) {
        return topics.filter(topic => get(topic, 'id') === currentTopicId)[0] || {}
      }
      return {}
  }

  getPreviousTopicComponent = (currentTopicId) => {
      const topics = this.getTopicsArr(true)
      let topicComponentRule = []
      let prevTopicId = null
      if (topics && topics.length) {
        const prevTopic = topics.filter(topic => get(topic, 'id') === getPrevTopicId(topics, currentTopicId))[0]
        topicComponentRule = get(prevTopic, 'topicComponentRule', [])
        prevTopicId = get(prevTopic, 'id')
      }
      return {topicComponentRule, id: prevTopicId}
  }

  sidebarData = () => {
      return(
          [
            {
                title: 'Video',
                icon: videocam
            },
            {
            title: 'Intro to coding',
            icon: videocam
            },
            {
                title: 'Code',
                icon: videocam
            },
            {
                title: 'Video',
                icon: videocam
            }
          ]
      )
  }


  render() {
    const breakPoint = 900
    const isDesktop = window.innerWidth > breakPoint
    const { computedMatch, revisitRoute, parent, mentorMenteeSessionUpdateStatus } = this.props
    const revisitString = revisitRoute ? '/revisit' : ''
    const { topicId, loId, videoId, projectId } = this.props.computedMatch.params
    const courseId = getCourseId(topicId)
    const { mentorMenteeSession } = this.props
    const isSubmittedForReview = mentorMenteeSession && mentorMenteeSession.getIn([0, 'isSubmittedForReview'])
    const isQuizSubmitted = mentorMenteeSession && mentorMenteeSession.getIn([0, 'isQuizSubmitted'])
    const isAssignmentSubmitted = mentorMenteeSession && mentorMenteeSession.getIn([0, 'isAssignmentSubmitted'])
    const isPracticeSubmitted = mentorMenteeSession && mentorMenteeSession.getIn([0, 'isPracticeSubmitted'])
    const course = this.props.course && this.props.course.toJS()
    const sortedLO = this.props.learningObjective && sort.ascend(this.props.learningObjective, ['order'])
    const learningObjectives = this.props.userTopicJourney.getIn([0, 'learningObjectives'])
    const loIds = learningObjectives && learningObjectives.toJS() && learningObjectives.toJS().map(el => el.id)
    const filteredLo = sortedLO && sortedLO.toJS().filter(lo => loIds.includes(lo.id))
    const blockBasedProjects = this.props.userTopicJourney.getIn([0, 'blockBasedProjects'], false)
    const blockBasedPractice = this.props.userTopicJourney.getIn([0, 'blockBasedPractices'], false)
    const shouldCodingAssignment = !!get(this.getCurrentTopicObj(), 'topicComponentRule', []).find(component => get(component, 'componentName') === 'assignment')
    const isUserVideoCompleted = this.props.userVideo.getIn([0, 'status']) === 'complete'
    const isUserBlockBasedPracticesComplete = this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.getIn([0, 'status']) === 'complete'
    const isUserBlockBasedProjectsComplete = this.props.userBlockBasedProjects && this.props.userBlockBasedProjects.getIn([0, 'status']) === 'complete'
    const overallComponentsProgress = this.calcOverallComponentProgress(this.getisVideoComponentUnlocked(),
        this.getIsLOComponentUnlocked(filteredLo),
        blockBasedProjects && blockBasedProjects.getIn([0, 'isUnlocked'], false),
        this.getIsPracticeComponentUnlocked(),
        shouldCodingAssignment,
        false,
        filteredLo ? filteredLo.length : 1,
        (blockBasedPractice && blockBasedPractice.toJS()) ? blockBasedPractice.toJS().length : 1,
    )
    const prevTopicComponent = this.getPreviousTopicComponent(topicId)
    const homeworkInPreSession = this.getHomeWorkComponents(prevTopicComponent)
    const isChatPage = computedMatch.path.includes('/sessions/chat')
    const filteredTopicComponentRule = this.getFilteredTopicComponentRule()
    return <></>
    if (this.props.mobileNav) {
        if (isMobile()) {
            return(
                <>
                    <div>
                        {this.state.sidebar && (<div className='flashContainer' onClick={()=>this.showSidebar()}/>)}
                        <div className="navbar">
                            <div className="front-bar">
                                <div onClick={()=>this.showSidebar()}>
                                    <div className='hamburger-icon' />
                                    <div className='hamburger-icon' />
                                    <div className='hamburger-icon' />
                                </div>
                                {this.props.pageTitle && (
                                    <div className='updatedSidebar-heading'>
                                        {this.props.pageTitle}
                                    </div>
                                )}
                            </div>
                            {this.props.additionalRenderer && (
                                <div className='additionalRenderer'>{this.props.additionalRenderer()}</div>
                            )}
                        </div>
                        <nav className={this.state.sidebar ? 'nav-menu active' : 'nav-menu'}>
                            <Link to={`${(parent === 'homework') ? '/homework' : '/sessions'}`} className='sidebar-top'>
                                <img className='arrow-back' src={arrowback} alt="arrow-back" />
                                <span className='sidebar-top-heading'>
                                    Back to {(parent === 'homework') ? 'homework' : 'all sessions'}
                                </span>
                            </Link>
                            <div className='nav-menu-items'>
                                {(parent === 'homework') ? (
                                    this.renderHomeworkSideNav(revisitString, courseId, topicId, computedMatch, isSubmittedForReview)
                                ) : (
                                    this.renderSessionSideNav(revisitString, courseId, topicId, computedMatch, isUserVideoCompleted,
                                        filteredLo, course, loId, blockBasedProjects, isUserBlockBasedProjectsComplete, blockBasedPractice, isUserBlockBasedPracticesComplete, shouldCodingAssignment, homeworkInPreSession, prevTopicComponent,
                                        isSubmittedForReview, videoId, projectId)
                                )}
                            </div>
                        </nav>

                    </div>
                    {(parent === 'homework' && !isSubmittedForReview)
                    ? (
                        <SubmitOverlayMenu
                            title='Submit for Review'
                            visible={this.state.showSubmitOverlay || this.state.reviewSubmitClicked}
                            onQuizSubmit={this.onQuizSubmit}
                            message={this.getSubmitOverlayMsg()}
                            closeOverlay={this.closeOverlay}
                            isLoading={mentorMenteeSessionUpdateStatus && mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'loading'])}
                            isSuccess={mentorMenteeSessionUpdateStatus && mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'success'])}
                            submitForReviewOverlay={true}
                            closeImmediately={true}
                            onSubmitForReview={this.submitForReview}
                            isHomeworkComplete={this.checkIfHomeworkCompleted(this.props.mentorMenteeSession)}
                            userFirstAndLatestQuizReport={this.props.userFirstAndLatestQuizReport}
                            userId={this.props.userId}
                            topicId={computedMatch.params.topicId}
                            courseId={computedMatch.params.courseId}
                            topicComponentRule={get(this.getCurrentTopicObj(), 'topicComponentRule', [])  }
                            disabled={
                                !this.checkIfHomeworkCompleted(this.props.mentorMenteeSession)
                            }
                            setSubmitForReviewClicked={(value) => {
                                this.setState({
                                    submitForReviewClicked: value
                                })
                            }}
                            history={this.props.history}
                        />
                    ) :
                    (
                        <div />
                    )
            }
                </>
            )
        }
        return <></>
    }
    const isElectron = typeof window !== 'undefined' && window.native
    return (
        <MainSideBar 
            topicId={topicId}
            currentRoute={computedMatch.url}
            topicComponentRule={this.getFilteredTopicComponentRule()}
            getFilteredLoComponentRule={this.getFilteredLoComponentRule}
            courseDefaultLoComponentRule={get(course, 'defaultLoComponentRule', [])}
            revisitString={revisitString}
            getLORedirectKey={this.getLORedirectKey}
            getPQRoute={this.getPQRoute}
            courseId={courseId}
            history={this.props.history}
        />
    )
    return (
    <>
        <div className={cx('blockBased-side-navbar-bgOverlay', isChatPage && 'blockBased-side-navbar-chatBgOverlay')} />
        <div 
            className={cx(
                'blockBased-side-navbar-container',
                isElectron && 'blockBased-side-navbar-container-electron'
            )} 
            style={{ position: checkIfEmbedEnabled() ? 'relative' : '' }}
        >
            {this.state.isPageLoading ? (
                <>
                    <ContentLoader
                        className='sidebar-loader-card'
                        speed={5}
                        interval={0.1}
                        backgroundColor={'#f5f5f5'}
                        foregroundColor={'#dbdbdb'}
                    >
                        <rect className='sidebar-loader-1' />
                        <rect className='sidebar-loader-2'/>
                        <rect className='sidebar-loader-3'/>
                    </ContentLoader>
                </>
            ) : (
                <motion.div
                    initial={{
                        opacity: this.state.isPageLoading ? 0 : 1
                    }}
                    animate={{
                        opacity: this.state.isPageLoading ? 0 : 1
                    }}
                    className='progressIndicator-mainContainer'
                >
                    <div
                        className='progressIndicator-individual-progress'
                        style={{
                            marginLeft: `${((parent === 'homework') && !isSubmittedForReview) ? '24px' : ''}`
                        }}
                    >
                        {(parent === 'homework') ? (
                            this.renderHomeworkSideNav(revisitString, courseId, topicId, computedMatch, isSubmittedForReview)
                        ) : (
                            this.renderSessionSideNav(revisitString, courseId, topicId, computedMatch, isUserVideoCompleted,
                            filteredLo, course, loId, blockBasedProjects, isUserBlockBasedProjectsComplete, blockBasedPractice, isUserBlockBasedPracticesComplete, shouldCodingAssignment, homeworkInPreSession, prevTopicComponent,
                            isSubmittedForReview, videoId, projectId)
                        )}
                    </div>
                    {this.renderReactTooltips()}
                    {((parent === 'homework') && !isSubmittedForReview && !checkIfEmbedEnabled()) && (
                        <div className='progressIndicator-individual-progress' style={{
                            position: 'absolute', bottom: checkIfEmbedEnabled() ? "-55px" : '-2px', left: checkIfEmbedEnabled() ? '5px' : '22px', margin: '20px 0px 8px', zIndex: '9999'
                        }}>
                            <Button3D
                                outerContainerStyle={{marginTop: '22px', pointerEvents: 'all'}}
                                innerTextContainerStyle={{fontSize: '12px'}}
                                style={{whiteSpace: 'nowrap'}}
                                title='SUBMIT FOR REVIEW'
                                disabled={!this.checkIfHomeworkCompleted(mentorMenteeSession)}
                                onClick={this.checkIfHomeworkCompleted(mentorMenteeSession) && this.showSubmitOverlay }
                            />
                        </div>
                    )}
                    {(parent !== 'homework') && (
                        <>
                            {/* Circular Progress Bar */}
                            <div className='progressIndicator-overall-progress'>
                                <CircularProgressBar
                                    strokeWidth="8"
                                    sqSize={isDesktop ? '80' : '60'}
                                    percentage={overallComponentsProgress}
                                >
                                    <div className={`
                                        progressIndicator-icon-container
                                        ${overallComponentsProgress === 100 ? 'overallProgressIndicator-success' : ''}
                                    `}>
                                        <div className='progressIndicator-icon progressIndicator-wh-40'
                                        style={{ backgroundImage: `url(${require('../../assets/checkmark-outline.png')})` }} />
                                    </div>
                                </CircularProgressBar>
                            </div>
                        </>
                    )}
                </motion.div>
            )}
            {
                (parent === 'homework' && !isSubmittedForReview)
                    ? (
                        <SubmitOverlayMenu
                            title='Submit for Review'
                            visible={this.state.showSubmitOverlay || this.state.reviewSubmitClicked}
                            onQuizSubmit={this.onQuizSubmit}
                            message={this.getSubmitOverlayMsg()}
                            closeOverlay={this.closeOverlay}
                            isLoading={mentorMenteeSessionUpdateStatus && mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'loading'])}
                            isSuccess={mentorMenteeSessionUpdateStatus && mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'success'])}
                            submitForReviewOverlay={true}
                            closeImmediately={true}
                            onSubmitForReview={this.submitForReview}
                            isHomeworkComplete={this.checkIfHomeworkCompleted(this.props.mentorMenteeSession)}
                            userFirstAndLatestQuizReport={this.props.userFirstAndLatestQuizReport}
                            userId={this.props.userId}
                            topicId={computedMatch.params.topicId}
                            courseId={computedMatch.params.courseId}
                            topicComponentRule={get(this.getCurrentTopicObj(), 'topicComponentRule', [])  }
                            disabled={
                                !this.checkIfHomeworkCompleted(this.props.mentorMenteeSession)
                            }
                            history={this.props.history}
                        />
                    ) :
                    (
                        <div />
                    )
            }
        </div>
      </>
    )
  }
}

export default withScale(withRouter(BlockBasedSideNavBar), {})

const CircularProgressBar = (props) => {
    // Size of the enclosing square
    const sqSize = props.sqSize;
    // SVG centers the stroke width on the radius, subtract out so circle fits in square
    const radius = (props.sqSize - props.strokeWidth) / 2;
    // Enclose cicle in a circumscribing square
    const viewBox = `0 0 ${sqSize} ${sqSize}`;
    // Arc length at 100% coverage is the circle circumference
    const dashArray = radius * Math.PI * 2;
    // Scale 100% coverage overlay with the actual percent
    const dashOffset = dashArray - dashArray * props.percentage / 100;

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
            <svg
                width={props.sqSize}
                height={props.sqSize}
                viewBox={viewBox}>
                <circle
                    className="circle-background"
                    cx={props.sqSize / 2}
                    cy={props.sqSize / 2}
                    r={radius}
                    strokeWidth={`${props.strokeWidth}px`} />
                <circle
                    className="circle-progress"
                    cx={props.sqSize / 2}
                    cy={props.sqSize / 2}
                    r={radius}
                    strokeWidth={`${props.strokeWidth}px`}
                    // Start progress marker at 12 O'Clock
                    transform={`rotate(-90 ${props.sqSize / 2} ${props.sqSize / 2})`}
                    style={{
                        strokeDasharray: dashArray,
                        strokeDashoffset: dashOffset
                    }}
                />
                {/* <foreignObject width='50' height='50'>
                </foreignObject> */}
            </svg>
            {props.children ? (
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    {props.children}
                </div>
                ) : null}
        </div>
    );
}
