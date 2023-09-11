import React, { Component } from 'react'
import { fromJS, Map } from 'immutable'
import { filterKey } from "../../utils/data-utils";
import styles from './PQReport.module.scss'
import ArrowButton from '../../components/Buttons/ArrowButton'
import fetchBadge from '../../queries/fetchBadge'
import fetchPQReport from '../../queries/fetchPQReport'
import fetchMentorMenteeSession from '../../queries/sessions/fetchMentorMenteeSession'
import updateMentorMenteeSession from '../../queries/sessions/updateMentorMenteeSession'
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'
import fetchMentorFeedback from '../../queries/fetchMentorFeedback'
import BadgeModal from '../Achievements/BadgeModal'
import MentorFeedback from '../../components/MentorFeedback'
import Tube from './components/Tube'
import Next from '../../components/Next'
import tubeConfig from './tubeConfig'
import fetchChatPractice from '../../queries/fetchChatPractice'
import fetchQuizQuestions from '../../queries/fetchQuizQuestions'
import { sort } from '../../utils/immutable'
import duck from '../../duck'
import withArrowScroll from '../../components/withArrowScroll'
import store from '../../store'
import { get, truncate } from 'lodash'
import gql from 'graphql-tag'
import requestToGraphql from '../../utils/requestToGraphql'
import { getInSessionRoute, getNextLoComponentRoute } from '../UpdatedSessions/utils'
import { getCourseName } from '../../utils/getCourseId';
import { learningObjectiveComponents, PYTHON_COURSE } from '../../config';
import Arrange from '../../components/QuestionTypes/Arrange';
import Mcq from '../../components/QuestionTypes/Mcq';
import FibBlock from '../../components/QuestionTypes/FibBlock';
import FibInput from '../../components/QuestionTypes/FibInput';
import parseMetaTags from '../../utils/parseMetaTags';
import isMobile from '../../utils/isMobile';
import TekieCEParser from '../../components/Preview/Preview';
import CredentialsPopup from '../Signup/schoolLiveClassLogin/components/CredentialsPopup/CredentialsPopup';
import mentorMenteeSessionAddOrDelete from '../../utils/mmSessionAddOrDelete';
import { checkIfEmbedEnabled, getEmbedData } from '../../utils/teacherApp/checkForEmbed';
import goBackToTeacherApp from '../../utils/teacherApp/goBackToTeacherApp';
import { NextFooterButton } from '../../components/NextFooter/NextFooter';
import NextFooter from '../../components/NextFooter';
import fetchComponents from '../../queries/fetchComponents';
import { thisComponentRule } from '../../components/UpdatedSideNavBar/utils';


const DownArrowIcon = (props) => {
  return (
    <svg className={styles.downArrow} viewBox='0 0 19 11' fill="none" {...props} style={props.reverse && { transform: 'scale(-1)' }}>
      <path
        d="M1.516 1.447L9.39 9.322l7.875-7.875"
        stroke="#005773"
        strokeWidth={2.625}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>

  )
}

const ExplainationIcon = (props) => (
  <svg className={styles.explainationIcon} viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.5338 0C5.50554 0 0.601562 5.15865 0.601562 11.5C0.601562 17.8414 5.50554 23 11.5338 23C17.5621 23 22.4661 17.8414 22.4661 11.5C22.4661 5.15865 17.5621 0 11.5338 0ZM11.5338 18.2083C11.0309 18.2083 10.6229 17.7791 10.6229 17.25C10.6229 16.7209 11.0309 16.2917 11.5338 16.2917C12.0368 16.2917 12.4448 16.7209 12.4448 17.25C12.4448 17.7791 12.0368 18.2083 11.5338 18.2083ZM12.9759 12.1152C12.6535 12.2714 12.4448 12.6136 12.4448 12.9865V13.4167C12.4448 13.9456 12.0376 14.375 11.5338 14.375C11.0301 14.375 10.6229 13.9456 10.6229 13.4167V12.9865C10.6229 11.868 11.2477 10.8427 12.2126 10.374C13.1409 9.92458 13.8113 8.73134 13.8113 8.14577C13.8113 6.82532 12.7901 5.75 11.5338 5.75C10.2776 5.75 9.25633 6.82532 9.25633 8.14577C9.25633 8.67484 8.84897 9.10423 8.34519 9.10423C7.84142 9.10423 7.43423 8.67484 7.43423 8.14577C7.43423 5.76825 9.27351 3.83327 11.5338 3.83327C13.7941 3.83327 15.6334 5.76825 15.6334 8.14577C15.6334 9.44061 14.5657 11.3438 12.9759 12.1152Z" fill="#00ADE6" />
  </svg>
)

class PQReport extends Component {
  state = {
    poseState: 'inActive',
    firstTryCount: 0,
    secondTryCount: 0,
    threeOrMoreTryCount: 0,
    answerUsedCount: 0,
    helpUsedCount: 0,
    newFlow: false,
    isBadgeModalVisible: false,
    detailedReport: [],
    showCredentialModal: false,
  }

  async componentDidMount() {
    this.setState({
      newFlow: this.props.match.params.courseId ? true : false
    })
    const { topicId, courseId, loId } = this.props
    if (courseId) {
      await fetchComponents(
        topicId,
        courseId,
      ).components([
        {type: learningObjectiveComponents.learningSlide, arg: {
          loId: loId,
          doesPracticeExist: get(
            thisComponentRule('learningObjective', topicId, this.props.loId), 
            'learningObjective.practiceQuestionLearningSlidesMeta.count',
            0
          ) > 0 || get(
            thisComponentRule('learningObjective', topicId, loId), 
            'learningObjective.questionBankMeta.count',
            0
          ) > 0
        }}
      ])
    }
    this.fetchReport()
    const lo = this.props.learningObjective.find(lo => lo.get('id') === this.props.loId)
    if (lo && lo.get('practiceQuestionStatus')) {
      if (lo.get('practiceQuestionStatus') === 'complete') {
        this.fetchReport()
      }
    } else {
      this.fetchReport()
    }
    const menteeId = this.props.userId
    mentorMenteeSessionAddOrDelete(menteeId, this.props.topicId, '', 'started', 'other', () => fetchMentorMenteeSession(
      null,
      null,
      menteeId,
      'menteeTopicFilter',
      null,
      true,
      this.props.topicId,
      null
    ).call())
    let showCredentialModalStatus = localStorage.getItem('showCredentialsModal')
    if (showCredentialModalStatus) {
      this.setState({
        showCredentialModal: true
      })
    }
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.loId !== this.props.loId) {
      this.fetchReport()
    }

    if (this.props.pQDumpStatus.get('success', false) &&
      !prevProps.pQDumpStatus.get('success', false)
    ) {
      this.afterDump()
      this.fetchReport()
    }
  }

  fetchReportOffline = () => {
    const answers = get(this.props, 'location.state.answersAdditionalInfo', [])
    const payload = {
      id: this.props.loId,
      firstTryCount: 0,
      secondTryCount: 0,
      threeOrMoreTryCount: 0,
      answerUsedCount: 0,
      helpUsedCount: 0,
    }

    for (const answer of answers) {
      if (get(answer, 'attemptNumber') === 1) {
        payload.firstTryCount = payload.firstTryCount + 1
      }
      if (get(answer, 'attemptNumber') === 2) {
        payload.secondTryCount = payload.secondTryCount + 1
      }
      if (get(answer, 'attemptNumber') >= 3) {
        payload.threeOrMoreTryCount = payload.threeOrMoreTryCount + 1
      }
      if (get(answer, 'isHintUsed')) {
        payload.helpUsedCount = payload.helpUsedCount + 1
      }
      if (get(answer, 'isAnswerUsed')) {
        payload.answerUsedCount = payload.answerUsedCount + 1
      }
    }

    setTimeout(() => {
      this.setState({
        poseState: 'active',
        ...payload,
      })
    }, 200)

    store.dispatch({
      type: 'userPracticeQuestionReport/fetch/success',
      autoReducer: true,
      key: 'userPracticeQuestionReport/' + this.props.loId,
      payload: fromJS({
        extractedData: {
          userPracticeQuestionReport: payload
        }
      }),
      uniqId: 'userpracticequestionreport'
    })
  }


  afterDump = () => {
    const learningObjectiveId = this.props.loId
    if (this.props.nextComponent.get('nextComponentType') === 'message') {
      // fetchChatPractice(this.props.userId, this.props.nextComponent.getIn(['learningObjective', 'id']), false, false, '', this.props.topicId)
    } else {
      fetchQuizQuestions(this.props.userId, this.props.topicId)
    }
    const filteredLO = this.props.learningObjectives.filter(learningObjective => learningObjective.getIn(['topics', 0, 'id']) === this.props.topicId)
    const order = sort.ascend(filteredLO, ['order']).findIndex((learningObjective, i) => learningObjective.get('id') === learningObjectiveId)
    const nextComponentToUpdate = order + 1 === this.props.learningObjectives.size
      ? {
        userTopicJourney: {
          id: this.props.topicId,
          quiz: { isUnlocked: true }
        },
        learningObjective: [{
          id: learningObjectiveId,
          practiceQuestionStatus: 'complete'
        }]
      }
      : {
        learningObjective: [{
          id: this.props.nextComponent.getIn(['learningObjective', 'id']),
          isUnlocked: true,
        }, {
          id: learningObjectiveId,
          practiceQuestionStatus: 'complete'
        }]
      }
    duck.merge(() => ({
      currentTopicComponent: this.props.nextComponent.get('nextComponentType'),
      currentTopicComponentDetail: {
        currentLearningObjectiveId: this.props.nextComponent.getIn(['learningObjective', 'id']),
        componentTitle: this.props.nextComponent.get('nextComponentType') === 'message'
          ? this.props.nextComponent.getIn(['learningObjective', 'title'])
          : 'Quiz',
        thumbnail: this.props.nextComponent.getIn(['learningObjective', 'thumbnail']),
        description: this.props.nextComponent.getIn(['learningObjective', 'description']),
        percentageCovered: ((((order + 1) * 2) + 1) / ((filteredLO.size * 2) + 2)) * 100
      },
      ...nextComponentToUpdate
    }))
  }

  fetchReport() {
    setTimeout(async () => {
      this.setState({ poseState: 'inActive' })
      if (get(this.props, 'location.state.shouldFetchReportOffline')) {
        this.fetchReportOffline()
        await fetchPQReport(this.props.userId, this.props.loId, this.props.courseId, true).call()

        let detailedReport = []
        const userPracticeQuestionReport = this.props.userPracticeQuestionReport.getIn([0]) || Map({})
        const pqDetailedReport = get(userPracticeQuestionReport.toJS(), 'detailedReport', [])
        if (pqDetailedReport.length > 0) {
          detailedReport = pqDetailedReport.map((report, i) => ({ ...report, isOpen: i === 0 }))
        }
        this.setState({
          detailedReport
        })
      } else {
        await fetchPQReport(this.props.userId, this.props.loId, this.props.courseId, true).call()
        setTimeout(() => {
          const userPracticeQuestionReport = this.props.userPracticeQuestionReport.getIn([0]) || Map({})
          let detailedReport = []

          const pqDetailedReport = get(userPracticeQuestionReport.toJS(), 'detailedReport', [])
          if (pqDetailedReport.length > 0) {
            detailedReport = pqDetailedReport.map((report, i) => ({ ...report, isOpen: i === 0 }))
          }
          const firstTryCount = userPracticeQuestionReport.get('firstTryCount') || 0
          const secondTryCount = userPracticeQuestionReport.get('secondTryCount') || 0
          const newThreeOrMoreTryCount = detailedReport ? (detailedReport.length - (firstTryCount + secondTryCount)) : userPracticeQuestionReport.get('threeOrMoreTryCount')
          this.setState({
            poseState: 'active',
            firstTryCount: userPracticeQuestionReport.get('firstTryCount'),
            secondTryCount: userPracticeQuestionReport.get('secondTryCount'),
            threeOrMoreTryCount: newThreeOrMoreTryCount,
            answerUsedCount: userPracticeQuestionReport.get('answerUsedCount'),
            helpUsedCount: userPracticeQuestionReport.get('helpUsedCount'),
            detailedReport
          })
        }, 500)
      }
    }, 10)
  }

  getProgress = count => {
    const userPracticeQuestionReport = this.props.userPracticeQuestionReport.getIn([0]) || Map({})
    let { userLearningObjective } = this.props
    userLearningObjective =(userLearningObjective && userLearningObjective.toJS()) || []
    const totalPracticeQuestions = get(userLearningObjective, '[0].practiceQuestions', []).length
    const total = userPracticeQuestionReport.get('firstTryCount') +
      userPracticeQuestionReport.get('secondTryCount') +
      userPracticeQuestionReport.get('threeOrMoreTryCount')
    return (count / totalPracticeQuestions) * 100
  }

  getNextComponent = () => {
    const { topicId, loId } = this.props.match.params
    const topicJS = this.props.topics.toJS().filter(topic => topic.id === topicId)
    const { topicComponentRule = [] } = topicJS[0] || {}
    if (topicComponentRule) {
      let sortedTopicComponentRule = topicComponentRule.sort((a, b) => a.order > b.order)
      sortedTopicComponentRule = (sortedTopicComponentRule || []).filter(el => !['homeworkAssignment', 'quiz', 'homeworkPractice'].includes(get(el, 'componentName')))
      const currentTopicComponentIndex = sortedTopicComponentRule.findIndex(el => el.learningObjective && el.learningObjective.id === loId)
      let nextComponent = null
      if (sortedTopicComponentRule[currentTopicComponentIndex + 1]) {
        nextComponent = sortedTopicComponentRule[currentTopicComponentIndex + 1]
      }
      return {
        nextComponent,
        currentComponent: sortedTopicComponentRule[currentTopicComponentIndex]
      }
    }
    return {
      nextComponent: null,
      currentComponent: null
    }
  }

  getNextLoComponent = () => {
    const { topicId, loId, courseId } = this.props.match.params
    const {currentComponent} = this.getNextComponent()
    const { course } = this.props
    const nextLoRoute = getNextLoComponentRoute({
        course,
        learningObjective: this.props.learningObjective,
        learningObjectiveId: loId,
        topicComponentRule: currentComponent,
        courseId,
        topicId,
        childComponentsName: ['practiceQuestion', 'chatbot', 'learningSlide']
    })
    return nextLoRoute
  }
  routeToNextSession = async () => {
    const { topicId, loId, courseId } = this.props.match.params
    const {nextComponent, currentComponent} = await this.getNextComponent()
    // const revistRoute = this.props.match.path.includes('/revisit') ? '/revisit' : ''
    const { course } = this.props
    const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
    // let filteredLo = this.props.learningObjective && this.props.learningObjective.toJS().filter(lo => lo.id === loId)
    // let filteredLoComponentRule = getFilteredLoComponentRule(filteredLo[0], sortedLoComponentRule, get(nextComponent, 'learningObjectiveComponentsRule', []))
    // if (filteredLoComponentRule && filteredLoComponentRule.length) {
    //   const currentLoComponentIndex = filteredLoComponentRule.findIndex(componentRule => get(componentRule, 'componentName') === 'practiceQuestion' || get(componentRule, 'componentName') === 'chatbot' || get(componentRule, 'componentName') === 'learningSlide')
    //   const nextLoComponent = filteredLoComponentRule[currentLoComponentIndex + 1]
    //   if (nextLoComponent && Object.keys(nextLoComponent).length) {
    //     this.props.history.push(`${revistRoute}/sessions/${getLORedirectKey(nextLoComponent)}/${courseId}/${topicId}/${loId}`)
    //     return
    //   }
    // }
    const redirectUrl = getNextLoComponentRoute({
        course,
        learningObjective: this.props.learningObjective,
        learningObjectiveId: loId,
        topicComponentRule: currentComponent,
        courseId,
        topicId,
        childComponentsName: ['practiceQuestion', 'chatbot', 'learningSlide']
    })
    if (redirectUrl) {
      return this.props.history.push(redirectUrl)
    }
    if (!nextComponent) {
      await fetchBadge(topicId, 'practiceQuestion', false, { courseId }).call();
      const badge = this.props.unlockBadge && filterKey(this.props.unlockBadge, `unlockBadge/practiceQuestion/${topicId}`)
      const badgeJS = badge && badge.toJS()
      if (badgeJS && badgeJS.length) {
        this.setState({
          isBadgeModalVisible: true,
          badge: badgeJS,
        })
        return
      }
    }
    if (nextComponent) {
      const { redirectUrl } = getInSessionRoute({
          topicComponentRule: nextComponent,
          course: {
              id: courseId,
              defaultLoComponentRule: sortedLoComponentRule
          },
          topicId,
          learningObjectives: this.props.learningObjective,
          goToNextComponent: true,
      })
      if (redirectUrl) {
          return this.props.history.push(redirectUrl)
      }
      // if (nextComponent.componentName === 'learningObjective') {
      //   filteredLo = this.props.learningObjective && this.props.learningObjective.toJS().filter(lo => lo.id === nextComponent.learningObjective.id)
      //   let LoRedirectKey = 'comic-strip'
      //   if (filteredLo && filteredLo.length && sortedLoComponentRule && sortedLoComponentRule.length) {
      //     filteredLoComponentRule = getFilteredLoComponentRule(filteredLo[0], sortedLoComponentRule, get(nextComponent, 'learningObjectiveComponentsRule', []))
      //     if (filteredLoComponentRule && filteredLoComponentRule.length) {
      //       LoRedirectKey = getLORedirectKey(filteredLoComponentRule[0])
      //     }
      //   }
      //   this.props.history.push(`${revistRoute}/sessions/${LoRedirectKey}/${courseId}/${topicId}/${nextComponent.learningObjective.id}`)
      // } else if (nextComponent.componentName === 'blockBasedProject') {
      //   this.props.history.push(`${revistRoute}/sessions/project/${courseId}/${topicId}/${nextComponent.blockBasedProject.id}`)
      // } else if (nextComponent.componentName === 'blockBasedPractice') {
      //   this.props.history.push(`${revistRoute}/sessions/practice/${courseId}/${topicId}/${nextComponent.blockBasedProject.id}`)
      // } else if (nextComponent.componentName === 'assignment') {
      //   this.props.history.push(`${revistRoute}/sessions/coding/${courseId}/${topicId}`)
      // } else if (nextComponent.componentName === 'video') {
      //   this.props.history.push(`${revistRoute}/sessions/video/${courseId}/${topicId}/${nextComponent.video.id}`)
      // }
    } else {
      if (checkIfEmbedEnabled()) goBackToTeacherApp("endSession")
      this.endSession()
    }
  }

  fetchFeedbackForm = () => {
    fetchMentorFeedback(this.props.mentorMenteeSessionEndSession.getIn([0, 'id'])).call()
  }

  endSession = async () => {
    const { topicId, courseId } = this.props.match.params
    const menteeId = this.props.userId
    this.fetchFeedbackForm()
    this.setState({
      fetchingMentorMenteeSession: true
    })
    const fetchMentorMenteeSessionToEnd = await requestToGraphql(
      gql`
              query {
                  mentorMenteeSessions(filter:{
                      and:[
                          {menteeSession_some: {user_some: {id: "${menteeId}"}}}
                          {topic_some: {id: "${topicId}"}}
                      ]
                  }) {
                      id
                      sessionStatus
                  }
              }   
          `
    )
    if (fetchMentorMenteeSessionToEnd) {
      this.setState({
        fetchingMentorMenteeSession: false
      })
      if (
        get(fetchMentorMenteeSessionToEnd, 'data.mentorMenteeSessions') &&
        get(fetchMentorMenteeSessionToEnd, 'data.mentorMenteeSessions').length
      ) {
        const res = await updateMentorMenteeSession(
          get(fetchMentorMenteeSessionToEnd, 'data.mentorMenteeSessions.0.id'),
          { sessionStatus: 'completed' },
          topicId,
          true,
          courseId
        ).call()
        if (res) {
          if (this.props.mentor && this.props.mentor.getIn(['id'])) {
            store.dispatch({
              type: 'user/delete/success',
              payload: fromJS({
                extractedData: {
                  user: {
                    id: this.props.mentor && this.props.mentor.getIn(['id'])
                  }
                }
              }),
              autoReducer: true
            })
          }
        }
      }
    }
  }

  closeBadgeModal = () => {
    this.setState({
      isBadgeModalVisible: false
    })
    if (checkIfEmbedEnabled()) goBackToTeacherApp("endSession")
    this.endSession()
  }

  checkIfCourseCompleted = async () => {
    let menteeCourseSyllabus = this.props.menteeCourseSyllabus && this.props.menteeCourseSyllabus.toJS()
    if (menteeCourseSyllabus && !menteeCourseSyllabus.length) {
      await fetchMenteeCourseSyllabus()
    }
    if (this.props.menteeCourseSyllabus && this.props.menteeCourseSyllabus.toJS()) {
      const upcomingSessions = this.props.menteeCourseSyllabus.getIn([0, 'upComingSession']).toJS()
      if ((upcomingSessions && upcomingSessions.length < 1)) {
        return true
      }
    }
    return false
  }

  getButtonTitle = () => {
    const { nextComponent } = this.getNextComponent()
    const nextLoComponent = this.getNextLoComponent()
    if (nextComponent || nextLoComponent) {
      return 'Next'
    }
    return 'End Session'
  }

  renderClosedQuestionReport(report, i) {
    const question = get(report, 'question', {})
    return (
      <div
        className={styles.questionContainerClose}
        onClick={() => {
          this.setState({
            detailedReport: this.state.detailedReport.map((report, index) =>
              index + 1 === i
                ? { ...report, isOpen: !report.isOpen }
                : report.isOpen
                  ? { ...report, isOpen: false }
                  : report
            ),
          });
        }}
      >
        <div className={styles.titleContainer}>
          <div className={styles.questionContainerHead}>
            <div className={styles.questionNumberText}>Question {i}: </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              {report.firstTry && (
                <div className={styles.firstTryTag}>1st Try</div>
              )}
              {report.secondTry && (
                <div className={styles.secondTryTag}>2nd Try</div>
              )}
              {report.thirdOrMoreTry && (
                <div className={styles.threeOrMoreTryTag}>3rd Try</div>
              )}
              <DownArrowIcon />
            </div>
          </div>
          <div className={styles.questionStatement}>
            <TekieCEParser
              value={question.statement}
              useNativeHtmlParser
              truncateText
              init={{ selector: `PQ-Report-Overview_${question.Id}` }}
              legacyParser={(statement) =>
                parseMetaTags({
                  statement: truncate(statement, {
                    length: 75,
                    omission: "...",
                    separator: "",
                    removeCodeTag: true
                  })
                })
              }
            />
          </div>
        </div>
      </div>
    );
  }


  renderQuestion = (question) => {
    let questionComponent = <></>
    let answers = [];
    let isSubmittedForReview = true
    // const { question } = message;
    if (question) {
      if (get(question, 'questionType') === 'arrange') {
        questionComponent = (
          <Arrange
            isSeeAnswers
            answerType='RS'
            key={get(question, 'id')}
            question={question}
            withUpdatedDesign
            showOnlyAnswer
            answers={[
              get(question, 'arrangeOptions', [])
            ]}
            isSubmittedForReview={isSubmittedForReview}
            updateAnswers={this.updateAnswers}
            activeQuestionIndex={0}
            isMobile={isMobile()}
            fromChatbot
          />
        )
      }
      if (get(question, 'questionType') === 'mcq') {
        questionComponent = (
          <Mcq
            key={get(question, "id")}
            question={question}
            showOnlyAnswer
            withUpdatedDesign
            answers={[
              get(question, "mcqOptions", []).map((answer) =>
                get(answer, "answers[0]")
              ),
            ]}
            isSubmittedForReview={isSubmittedForReview}
            updateAnswers={this.updateAnswers}
            activeQuestionIndex={0}
            isMobile={isMobile()}
            fromChatbot
          />
        );
      }
      if (get(question, 'questionType') === 'fibBlock') {
        questionComponent = (
          <FibBlock
            terminalAuto
            answerType="RS"
            key={get(question, "id")}
            showOnlyAnswer
            question={question}
            withUpdatedDesign
            answers={[
              get(question, "fibBlocksOptions", []).map((answer) =>
                get(answer, "answers[0]")
              ),
            ]}
            fromPQ
            isSubmittedForReview={isSubmittedForReview}
            updateAnswers={this.updateAnswers}
            activeQuestionIndex={0}
            isMobile={isMobile()}
            fromChatbot
          />
        );
      }
      if (get(question, 'questionType') === 'fibInput') {
        questionComponent = (
          <FibInput
            terminalAuto
            key={get(question, "id")}
            question={question}
            showOnlyAnswer
            withUpdatedDesign
            answers={[
              get(question, "fibInputOptions", []).map((answer) =>
                get(answer, "answers[0]")
              ),
            ]}
            isSubmittedForReview={isSubmittedForReview}
            // updateAnswers={this.updateAnswers}
            activeQuestionIndex={0}
            isMobile={isMobile()}
            fromChatbot
          />
        );
      }
    }
    return (
      <div className={styles.questionData}>
        {questionComponent}
      </div>
    )
  }

  renderOpenQuestionReport(report, i) {
    const question = get(report, 'question', {})
    return (
      <div className={styles.questionContainer}>
        <div className={styles.titleContainerOpen} onClick={() => {
          this.setState({
            detailedReport: this.state.detailedReport.map((r, index) => index + 1 === i ? ({ ...r, isOpen: !r.isOpen }) : r)
          })
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className={styles.questionNumberText}>
              Question {i}:{' '}
            </div>

            {/* <div className={styles.questionStatement}>&nbsp;{truncate(question.statement, {length: 90, omission: '...', 'separator': ''})}</div> */}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {report.firstTry && <div className={styles.firstTryTag}>1st Try</div>}
            {report.secondTry && <div className={styles.secondTryTag}>2nd Try</div>}
            {report.thirdOrMoreTry && <div className={styles.threeOrMoreTryTag}>3rd Try</div>}
            <DownArrowIcon reverse />
          </div>
        </div>
        <div className={styles.questionbodyContainer}>
          <div className={styles.questionStatementFull}>
            <TekieCEParser
              value={question.statement}
              init={{ selector: `PQ-Report_${question.Id}` }}
              legacyParser={(statement) => parseMetaTags({ statement, removeCodeTag: true })}
            />
          </div>
          <div className={styles.detailedReportHeading}>Correct Answer</div>
          {this.renderQuestion(question)}
          {/* <div className={styles.detailedReportHeading}>Explaination</div> */}
          {get(question, 'explanation', '') ? (
            <div className={styles.explainationContainer}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <ExplainationIcon />
                <div className={styles.explainationHeading}>
                  Explanation:
                </div>
              </div>
              <div className={styles.explainationText}>
                {<TekieCEParser
                  value={get(question, 'explanation', '')}
                  init={{ selector: `PQ-Report_Explanation_${question.Id}` }}
                  legacyParser={(statement) =>
                    parseMetaTags({ statement, removeCodeTag: true })
                  }
                />}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  renderDetailedReport() {
    const { detailedReport } = this.state
    return detailedReport.map((report, i) => report.isOpen ? this.renderOpenQuestionReport(report, i + 1) : this.renderClosedQuestionReport(report, i + 1))
  }

  render() {
    const { course } = this.props
    const userPracticeQuestionReport = this.props.userPracticeQuestionReport.getIn([0]) || Map({})
    const revisitRoute = this.props.match.path === '/revisit/sessions/practice-report/:courseId/:topicId/:loId'
    const { newFlow } = this.state
    const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
    // let filteredLo = this.props.learningObjective && this.props.learningObjective.toJS().filter(lo => lo.id === this.props.loId)
    const { nextComponent, currentComponent } = this.getNextComponent()
    const nextLoComponent = this.getNextLoComponent()
    let loComponentRule = sortedLoComponentRule
    if ((get(currentComponent, 'learningObjectiveComponentsRule', []) || []).length) {
      loComponentRule = get(currentComponent, 'learningObjectiveComponentsRule', [])
    }
    const shouldShowDetailedReport = (loComponentRule && Object.keys(loComponentRule).length) ? !!loComponentRule.find(loRule => get(loRule, 'componentName') === 'chatbot' || get(loRule, 'componentName') === 'learningSlide') : false
    return (
      <>
        {this.state.isBadgeModalVisible &&
          <BadgeModal
            closeModal={this.closeBadgeModal}
            shouldAnimate
            unlockBadge={this.state.badge}
          />
        }
        {!revisitRoute && (
          <MentorFeedback
            sessionId={this.props.mentorMenteeSessionEndSession.getIn([0, 'id'])}
            postSubmit={async () => {
              const isCompleted = await this.checkIfCourseCompleted()
              let loginWithCode = this.props.loggedInUser && this.props.loggedInUser.toJS() && get(this.props.loggedInUser.toJS(), 'fromOtpScreen')
              if (loginWithCode && !isCompleted) {
                localStorage.setItem('showCredentialsModal', true)
                this.setState({
                  showCredentialModal: true
                })
                return
              }
              if (isCompleted) {
                localStorage.setItem('showCourseCompletionCertificateModal', 'show')
              }
              this.props.history.push('/sessions')
            }}
          />
        )}
        {/* <UpdatedSideNavBar
          parent='sessions'
          revisitRoute={this.props.match.path.includes('/revisit')}
          mobileNav
          computedMatch={this.props.computedMatch || this.props.match}
          pageTitle='Report'
        /> */}
        <div className={styles.container} style={{
          marginTop: `${isMobile() ? '60px' : ''}`
        }}>
          <div className={styles.congratsContainer}>
            <div>You have nailed it!</div>
          </div>
          {this.state.poseState === 'active' ? <span className='practice-report-page-mixpanel-identifier' /> : null}
          <div className={styles.tubesContainer}>
            <Tube
              tubeConfig={tubeConfig.green}
              // color='#f7941d'
              // filledTextColor='#FFFCCA'
              color='#25bfa1'
              filledTextColor='#3EFFDA'
              i={0}
              colors={['#F8EC44', '#F7941D']}
              poseState={this.state.poseState}
              fill={this.state.firstTryCount}
              progress={this.getProgress(this.state.firstTryCount)}
            />
            <Tube
              fill={this.state.secondTryCount}
              color='#976bd6'
              filledTextColor='#C9B3FF'
              tubeConfig={tubeConfig.blue}
              i={1}
              colors={['#9669D3', '#834B9B']}
              poseState={this.state.poseState}
              progress={this.getProgress(this.state.secondTryCount)}
            />
            <Tube
              fill={this.state.threeOrMoreTryCount}
              // color='#25bfa1'
              // filledTextColor='#3EFFDA'
              color='#f7941d'
              filledTextColor='#FFFCCA'
              tubeConfig={tubeConfig.yellow}
              i={2}
              colors={['#6EE4AC', '#1CA6A0']}
              poseState={this.state.poseState}
              progress={this.getProgress(this.state.threeOrMoreTryCount)}
            />
          </div>
          <div className={styles.labelsContainer}>
            <div className={styles.labelFirst}>1st try</div>
            <div className={styles.labelSecond}>2nd try</div>
            <div className={styles.labelThird}>3rd try</div>
          </div>
          {!shouldShowDetailedReport && (
            <>
              <div className={styles.infoLabel}>
                <span>Help used</span>
                <span>{userPracticeQuestionReport.get('helpUsedCount')}</span>
              </div>
              <div className={styles.infoLabel}>
                <span>Answer seen</span>
                <span>{userPracticeQuestionReport.get('answerUsedCount')}</span>
              </div>
            </>
          )}
          {shouldShowDetailedReport && this.renderDetailedReport()}
          <div className={shouldShowDetailedReport ? styles.buttonContainerChatBot : styles.buttonContainer}>
            <NextFooter
              match={this.props.match}
              topicId={this.props.topicId}
              url={this.props.match.url}

              lastItem={true}
            ></NextFooter>
            {/* {(newFlow && getCourseName() !== PYTHON_COURSE) ? (
              (!revisitRoute || nextComponent || nextLoComponent) ? (
                <ArrowButton
                  title={this.getButtonTitle()}
                  onClick={() => {
                    this.routeToNextSession()
                  }}
                  buttonContainer={styles.arrowButtonContainer}
                />
              ) : <ArrowButton
                title={`${checkIfEmbedEnabled() ? `Back to ${getEmbedData("backToPage")}` : 'Back to Sessions'}`}
                onClick={() => {
                  if (checkIfEmbedEnabled()) {
                    goBackToTeacherApp("backToSession")
                    return
                  }
                  this.props.history.push('/sessions')
                }}
                buttonContainer={styles.arrowButtonContainer}
              />
            ) : (
              <Next
                nextComponent={this.props.userLearningObjective.getIn([0])}
                isReportPage
                className={styles.arrowButtonContainer}
              />
            )} */}
          </div>
        </div>
      </>
    )
  }
}

export default withArrowScroll(PQReport, 'tk-route-container')
