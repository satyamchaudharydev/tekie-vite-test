import React, { Component } from 'react'
import { fromJS, Map, List } from 'immutable'
import { filterKey } from "../../utils/data-utils";
import styles from './PQReport.module.scss'
import fetchBadge from '../../queries/fetchBadge'
import fetchPQReport from '../../queries/fetchPQReport'
import updateMentorMenteeSession from '../../queries/sessions/updateMentorMenteeSession'
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'
import fetchMentorFeedback from '../../queries/fetchMentorFeedback'
import fetchChatPractice from '../../queries/fetchChatPractice'
import fetchQuizQuestions from '../../queries/fetchQuizQuestions'
import { sort } from '../../utils/immutable'
import duck from '../../duck'
import withArrowScroll from '../../components/withArrowScroll'
import store from '../../store'
import { get, sortBy, truncate } from 'lodash'
import gql from 'graphql-tag'
import requestToGraphql from '../../utils/requestToGraphql'
import { getFilteredLoComponentRule, getLORedirectKey } from '../UpdatedSessions/utils'
import Arrange from '../../components/QuestionTypes/Arrange';
import Mcq from '../../components/QuestionTypes/Mcq';
import FibBlock from '../../components/QuestionTypes/FibBlock';
import FibInput from '../../components/QuestionTypes/FibInput';
import parseMetaTags from '../../utils/parseMetaTags';
import isMobile from '../../utils/isMobile';
import TekieCEParser from '../../components/Preview/Preview';
import CredentialsPopup from '../Signup/schoolLiveClassLogin/components/CredentialsPopup/CredentialsPopup';
import { checkIfEmbedEnabled } from '../../utils/teacherApp/checkForEmbed';
import getPath from '../../utils/getPath';
import moment from 'moment';
import goBackToTeacherApp from '../../utils/teacherApp/goBackToTeacherApp';

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

const scheme = {
  firstTry: 5,
  secondTry: 4,
  thirdTry: 3,
}
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
    detailedReports: [],
    showCredentialModal: false,
    sessionProficiency: '',
    topicTitle: '',
    submittedOn: '',
  }


  async componentDidMount() {
    this.setState({
      newFlow: this.props.match.params.courseId ? true : false
    })
    // if (this.props.courseId) {
    //   fetchChatPractice(this.props.userId, this.props.loId, false, true, this.props.courseId).call()
    // }
    this.fetchReport()
    // const menteeId = this.props.userId
    // mentorMenteeSessionAddOrDelete(menteeId, this.props.topicId, '', 'started', 'other', () => fetchMentorMenteeSession(
    //   null,
    //   null,
    //   menteeId,
    //   'menteeTopicFilter',
    //   null,
    //   true,
    //   this.props.topicId,
    //   null
    // ).call())
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
      fetchChatPractice(this.props.userId, this.props.nextComponent.getIn(['learningObjective', 'id']), false, false, '', this.props.topicId)
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

  async fetchReport() {
    await fetchPQReport(this.props.match.params.userId, undefined, undefined, true, undefined, this.props.match.params.topicId).call()
    setTimeout(() => {
      const userPracticeQuestionReport = this.props.userPracticeQuestionReport || List({})

      let reports = userPracticeQuestionReport.toJS()
      
      reports = reports.map(report => ({
        ...report,
        learningObjective: this.props.learningObjectives.toJS()
          .find((lo) => get(lo, 'id') === get(report, 'learningObjective.id'))
      }))
      reports = sortBy(reports, 'learningObjective.order')

      let detailedReports = []
      let totalScore = 0
      let score = 0
      let lastSubmissionISODate = ''
      reports.forEach((report) => {
        let detailedReport = []
        const pqDetailedReport = get(report, 'detailedReport', [])
        if (pqDetailedReport.length > 0) {
          detailedReport = pqDetailedReport.map((report, i) => ({ ...report, isOpen: false }))
        }
        const loId = get(report, 'learningObjective.id', '')
        const thisLO = this.props.learningObjectives.toJS()
          .filter((lo) => get(lo, 'id') === loId)
        
        const firstTryCount = get(report, 'firstTryCount')
        const secondTryCount = get(report, 'secondTryCount')
        const threeOrMoreTryCount = get(report, 'threeOrMoreTryCount')
        lastSubmissionISODate = get(report, 'createdAt', '')

        totalScore = totalScore + firstTryCount * scheme.firstTry + secondTryCount * scheme.firstTry + threeOrMoreTryCount * scheme.firstTry
        score = score + firstTryCount * scheme.firstTry + secondTryCount * scheme.secondTry + threeOrMoreTryCount * scheme.thirdTry
        detailedReports.push({
          title: get(thisLO, '0.title', ''),
          detailedReport,
          totalScore: firstTryCount * scheme.firstTry + secondTryCount * scheme.firstTry + threeOrMoreTryCount * scheme.firstTry,
          score: firstTryCount * scheme.firstTry + secondTryCount * scheme.secondTry + threeOrMoreTryCount * scheme.thirdTry,
        })
      })
      const thisTopic = this.props.topics.toJS()
        .find((topic) => get(topic, 'id') === this.props.match.params.topicId)
      this.setState({
        detailedReports,
        sessionProficiency: Math.round((score / totalScore) * 100),
        topicTitle: get(thisTopic, 'title', ''),
        submittedOn: moment(lastSubmissionISODate).format('MMMM Do, YYYY'),
      })
    }, 500)
  }

  getProgress = count => {
    const userPracticeQuestionReport = this.props.userPracticeQuestionReport.getIn([0]) || Map({})
    const total = userPracticeQuestionReport.get('firstTryCount') +
      userPracticeQuestionReport.get('secondTryCount') +
      userPracticeQuestionReport.get('threeOrMoreTryCount')
    return (count / total) * 100
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
      return nextComponent
    }
    return null
  }

  routeToNextSession = async () => {
    const { topicId, loId, courseId } = this.props.match.params
    const nextComponent = await this.getNextComponent()
    const revistRoute = this.props.match.path.includes('/revisit') ? '/revisit' : ''
    const { course } = this.props
    const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
    let filteredLo = this.props.learningObjective && this.props.learningObjective.toJS().filter(lo => lo.id === loId)
    let filteredLoComponentRule = getFilteredLoComponentRule(filteredLo[0], sortedLoComponentRule, (get(nextComponent, 'learningObjectiveComponentsRule', []) || []))
    if (filteredLoComponentRule && filteredLoComponentRule.length) {
      const currentLoComponentIndex = filteredLoComponentRule.findIndex(componentRule => get(componentRule, 'componentName') === 'practiceQuestion' || get(componentRule, 'componentName') === 'chatbot' || get(componentRule, 'componentName') === 'learningSlide')
      const nextLoComponent = filteredLoComponentRule[currentLoComponentIndex + 1]
      if (nextLoComponent && Object.keys(nextLoComponent).length) {
        // this.props.history.push(`${revistRoute}/sessions/${getLORedirectKey(nextLoComponent)}/${courseId}/${topicId}/${loId}`)
        return
      }
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
      if (nextComponent.componentName === 'learningObjective') {
        filteredLo = this.props.learningObjective && this.props.learningObjective.toJS().filter(lo => lo.id === nextComponent.learningObjective.id)
        let LoRedirectKey = 'comic-strip'
        if (filteredLo && filteredLo.length && sortedLoComponentRule && sortedLoComponentRule.length) {
          filteredLoComponentRule = getFilteredLoComponentRule(filteredLo[0], sortedLoComponentRule, (get(nextComponent, 'learningObjectiveComponentsRule', []) || []))
          if (filteredLoComponentRule && filteredLoComponentRule.length) {
            LoRedirectKey = getLORedirectKey(filteredLoComponentRule[0])
          }
        }
        this.props.history.push(`${revistRoute}/sessions/${LoRedirectKey}/${courseId}/${topicId}/${nextComponent.learningObjective.id}`)
      } else if (nextComponent.componentName === 'blockBasedProject') {
        this.props.history.push(`${revistRoute}/sessions/project/${courseId}/${topicId}/${nextComponent.blockBasedProject.id}`)
      } else if (nextComponent.componentName === 'blockBasedPractice') {
        this.props.history.push(`${revistRoute}/sessions/practice/${courseId}/${topicId}/${nextComponent.blockBasedProject.id}`)
      } else if (nextComponent.componentName === 'assignment') {
        this.props.history.push(`${revistRoute}/sessions/coding/${courseId}/${topicId}`)
      } else if (nextComponent.componentName === 'video') {
        this.props.history.push(`${revistRoute}/sessions/video/${courseId}/${topicId}/${nextComponent.video.id}`)
      }
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
    const nextComponent = this.getNextComponent()
    if (nextComponent) {
      return 'Next'
    }
    return 'End Session'
  }

  renderClosedQuestionReport(report, loOrder, questionOrder) {
    const question = get(report, 'question', {})
    return (
      <div
        className={styles.questionContainerClose}
        onClick={() => {
          this.setState({ 
            detailedReports: this.state.detailedReports
              .map((report, index) =>  index + 1 === loOrder
                ? {
                  ...report, 
                  detailedReport: report.detailedReport.map((report, index) => 
                    index + 1 === questionOrder
                      ? {...report, isOpen: !report.isOpen}
                      : report.isOpen
                        ? {...report, isOpen: false}
                        : report
                  )} 
                : report
            )
          })
        }}
      >
        <div className={styles.titleContainer}>
          <div className={styles.questionContainerHead}>
            <div className={styles.questionNumberText}>Question {questionOrder}: </div>
            <div style={{ display: "flex", alignItems: "center" }}>

              {report.firstTry && <div className={styles.threeOrMoreTryTag}>{scheme.firstTry} / {scheme.firstTry}</div>}
              {report.secondTry && <div className={styles.secondTryTag}>{scheme.secondTry} / {scheme.firstTry}</div>}
              {report.thirdOrMoreTry && <div className={styles.firstTryTag}>{scheme.thirdTry} / {scheme.firstTry}</div>}
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
                truncate(statement, {
                  length: 75,
                  omission: "...",
                  separator: "",
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
    let isSubmittedForReview = true
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

  renderOpenQuestionReport(report, loOrder, questionOrder) {
    const question = get(report, 'question', {})
    return (
      <div className={styles.questionContainer}>
        <div className={styles.titleContainerOpen} onClick={() => {
          this.setState({ 
            detailedReports: this.state.detailedReports
              .map((report, index) =>  index + 1 === loOrder
                ? {
                  ...report, 
                  detailedReport: report.detailedReport.map((report, index) => 
                    index + 1 === questionOrder
                      ? {...report, isOpen: !report.isOpen}
                      : report
                  )} 
                : report
            )
          })
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className={styles.questionNumberText}>
              Question {questionOrder}:{' '}
            </div>

            {/* <div className={styles.questionStatement}>&nbsp;{truncate(question.statement, {length: 90, omission: '...', 'separator': ''})}</div> */}
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
              {report.firstTry && <div className={styles.threeOrMoreTryTag}>{scheme.firstTry} / {scheme.firstTry}</div>}
              {report.secondTry && <div className={styles.secondTryTag}>{scheme.secondTry} / {scheme.firstTry}</div>}
              {report.thirdOrMoreTry && <div className={styles.firstTryTag}>{scheme.thirdTry} / {scheme.firstTry}</div>}

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
          {get(question, 'explanation', '') && (
            <div className={styles.explainationContainer}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <ExplainationIcon />
                <div className={styles.explainationHeading}>
                  Explanation:
                </div>
              </div>
              <div className={styles.explainationText}>
                {parseMetaTags({ statement: get(question, 'explanation', '') })}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  renderDetailedReport(detailedReport, title, order, scoreText, totalPercentage) {
    return (
      <>
        <div className={styles.loTitle}>
          {order}. {title}: <span>{scoreText}</span>{' '}<span>({totalPercentage}%)</span>
        </div>
        {detailedReport.map((report, i) => report.isOpen
          ? this.renderOpenQuestionReport(report, order, i + 1)
          : this.renderClosedQuestionReport(report, order, i + 1)
        )}
      </>
    )
  }

  render() {
    const { course } = this.props
    const revisitRoute = this.props.match.path === '/revisit/sessions/practice-report/:courseId/:topicId/:loId'
    const { newFlow } = this.state
    const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
    // let filteredLo = this.props.learningObjective && this.props.learningObjective.toJS().filter(lo => lo.id === this.props.loId)
    const isChatbot = (sortedLoComponentRule && Object.keys(sortedLoComponentRule).length) ? !!sortedLoComponentRule.find(loRule => get(loRule, 'componentName') === 'chatbot') : false
    const nextComponent = this.getNextComponent()
    const user = this.props.user && this.props.user.toJS()
    const schoolLogo = get(user, '0.schools.0.logo.uri', '')
    const schoolName = get(user, '0.schools.0.name', '')
    const userName = get(user, '0.name', '')
    return (
      <>
        <div className={styles.container} style={{
          marginTop: `${isMobile() ? '60px' : ''}`
        }}>
          {schoolLogo && (
            <img className={styles.schoolLogo} src={getPath(schoolLogo)} alt={schoolName + ' ' + schoolLogo} />
          )}
          {schoolName && (
            <div className={styles.schoolName}>{schoolName}</div>
          )}
          <div className={styles.schoolRow}>
            <div>
              <div className={styles.infoText}>
                <span>Teacher Name:</span> {userName}<br/>
                <span>Session Name:</span> {this.state.topicTitle}
              </div>
            </div>
            <div>
              <div className={styles.infoText}>
                <span>Submitted On:</span> {this.state.submittedOn}<br/>
                <span>Session Proficiency:</span> <span className={styles.sessionProficiencyText}>{this.state.sessionProficiency}%</span>
              </div>
            </div>
          </div>
          {this.state.detailedReports.map((report, index) =>
            this.renderDetailedReport(
              get(report, 'detailedReport', []),
              get(report, 'title', {}),
              index + 1,
              `${get(report, 'score', 0)} / ${get(report, 'totalScore', 0)}`,
              Math.round((get(report, 'score', 0) / get(report, 'totalScore', 0)) * 100)
            )
          )}
        </div>
        {this.state.showCredentialModal && <CredentialsPopup email={get(this.props.loggedInUser.toJS(), 'email')} password={get(this.props.loggedInUser.toJS(), 'savedPassword')} onClickFn={() => {
          this.props.dispatch({ type: 'LOGOUT' })
        }} />}
      </>
    )
  }
}

export default withArrowScroll(PQReport, 'tk-route-container')
