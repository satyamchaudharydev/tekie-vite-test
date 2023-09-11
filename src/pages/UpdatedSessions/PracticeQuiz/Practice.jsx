import React from 'react'
import styles from './Practice.module.scss'
import QuestionArea from './components/QuestionArea'
import Footer from './components/Footer'
import WrongAnswer from './components/WrongAnswerOverlay'
import HelpOverlay from './components/HelpOverlay'
import cx from 'classnames'
import CorrectAnswerOverlay from './components/CorrectAnswerOverlay'
import { Map } from 'immutable'
import dumpPracticeQuestions from '../../../queries/dumpPracticeQuestion'
import duck from '../../../duck'
import sort from '../../../utils/immutable/sort'
import {
    visibleHintOverlay,
    visibleCorrectAnswerOverlay,
    isAnswerUsed,
    isHintUsed,
    attemptNumber,
    ARRANGE,
    FIBBLOCK,
    FIBINPUT,
    MCQ,
    STATUS
  } from './constants'
import PQStoryOverlay from './components/PQStoryOverlay/PQStoryOverlay'
import Skeleton from '../../../components/QuestionTypes/Skeleton'
import PreserveState from '../../../components/PreserveState'
import mentorMenteeSessionAddOrDelete from '../../../utils/mmSessionAddOrDelete'
import { checkIfEmbedEnabled, isPqReportNotAllowed } from '../../../utils/teacherApp/checkForEmbed'
import get from 'lodash/get'
import isMobile from '../../../utils/isMobile'
import getCourseId from '../../../utils/getCourseId'
import { getFilteredLoComponentRule, getInSessionRoute, getLoComponentMapping, getLORedirectKey, getNextLoComponentRoute } from '../utils'
import ShowSolutionToggle from '../../../components/ShowSolutionToggle'
import fetchComponents from '../../../queries/fetchComponents'
import { learningObjectiveComponents } from '../../../config'
import { thisComponentRule } from '../../../components/UpdatedSideNavBar/utils'
import goBackToTeacherApp from '../../../utils/teacherApp/goBackToTeacherApp'

const initialPQState = {
  visible: false,
  answers: [],
  questionSelected: 0,
  visiblePqStoryOverlay: false,
  visibleHintOverlay: false,
  visibleCorrectAnswerOverlay: false,
  visibleWrongAnswerMessage: false,
  answersAdditionalInfo: [],
  response: null,
  pqStatus: false,
  prevAnswer: null,
  isSeeAnswers: false
}
export default class PracticeQuestionRoot extends React.Component {
    state = {
      ...initialPQState
    }

    initialPracticeQuestionStatus = ''

    componentDidMount = async () => {
      
      await this.fetchPQ()
      if (this.props.practiceQuestionStatus === 'incomplete' && !checkIfEmbedEnabled()) {
        this.setState({ visiblePqStoryOverlay: true })
      }
      mentorMenteeSessionAddOrDelete(this.props.userId, this.props.topicId, '', 'started', 'other', null, false)
    }

    fetchPQ = async () => {
      const loId = this.props.learningObjectiveId
      const { courseId, topicId } = this.props

      await fetchComponents(
        topicId,
        courseId,
      ).components([
        {type: learningObjectiveComponents.practiceQuestion, arg: {
          loId: loId,
          doesPracticeExist: get(
            thisComponentRule('learningObjective', topicId, loId), 
            'learningObjective.questionBankMeta.count',
            0
          ) > 0
        }}
      ])
    }

    componentDidUpdate = async (prevProps, prevState) => {
      if (this.initialPracticeQuestionStatus === '') {
        if (this.props.practiceQuestionStatus === 'complete' || this.props.practiceQuestionStatus === 'incomplete') {
          this.initialPracticeQuestionStatus = this.props.practiceQuestionStatus
        }
      }
      if (
        this.props.hasFetched &&
        this.state.answersAdditionalInfo.length === 0 &&
        this.props.userPracticeQuestions.getIn(['practiceQuestions'])
      ) {
        const practiceQuestions = this.props.userPracticeQuestions.getIn([
          'practiceQuestions'
        ])
        const practiceQuestionStatus =
          this.props.userPracticeQuestions.get('practiceQuestionStatus') || Map({})
        const answers = []
        let answersAdditionalInfo = []
        for (let i = 0; i < practiceQuestions.size; i++) {
          answers.push([])
          const info = {
            isHintUsed: false,
            isAnswerUsed: false,
            attemptNumber: 0,
            status: practiceQuestions.getIn([i, STATUS]),
          }
          answersAdditionalInfo.push(info)
        }
        if (answersAdditionalInfo.length) {
          answersAdditionalInfo[0].startTime = new Date().toISOString()
        }
        try {
          const learningObjectiveId = this.props.learningObjectiveId
          const { userId } = this.props
          const data = localStorage.getItem(
            `pq/${userId}/${learningObjectiveId}`
          )
          const parsedData = JSON.parse(data)
          if (parsedData) {
            answersAdditionalInfo = parsedData
          } else {
            localStorage.setItem(
              `pq/${userId}/${learningObjectiveId}`,
              JSON.stringify(answersAdditionalInfo)
            )
          }
        } catch (error) {
          // error
        }
        this.setState({ answers, answersAdditionalInfo, pqStatus: practiceQuestionStatus })
      }
      if (this.state.questionSelected !== prevState.questionSelected) {
        this.setState({
          visiblePqStoryOverlay: false,
          visibleHintOverlay: false,
          visibleCorrectAnswerOverlay: false,
          visibleWrongAnswerMessage: false,
          isSeeAnswers: false,
        })
      }
      if (this.state.isSeeAnswers !== prevState.isSeeAnswers) {
        if (!this.state.isSeeAnswers) {
          this.setState({
            visibleCorrectAnswerOverlay: false,
          })
        }
      }

      if (this.props.pQDumpStatus.get('success', false) &&
          !prevProps.pQDumpStatus.get('success', false)
      ) {
        this.afterDump()
      }
      const { loId } = this.props.match.params
      if (get(prevProps, 'match.params.loId') !== loId) {
        this.setState({ ...initialPQState })
        await this.fetchPQ()
        this.setState({ questionSelected: 0 })
        if (!this.props.hasFetched) {
        } else {
          if (this.props.practiceQuestionStatus === 'incomplete' && !checkIfEmbedEnabled()) {
            this.setState({ visiblePqStoryOverlay: true })
          }
        }
      }
    }

    updateAnswers = (questionIndex, value) => {
      const { answers } = this.state
      const newAnswers = answers.map((answer, index) => {
        if (index === questionIndex) {
          return value
        } else {
          return answer
        }
      })
      this.setState({ answers: newAnswers })
    }

  openOverlay = (overlayName, isHintTextExist = true) => {
      this.setState({ [overlayName]: true })
      if (overlayName === visibleHintOverlay) {
        if (isHintTextExist) this.updateAnswersAdditionalInfo(true)
        else this.updateAnswersAdditionalInfo(false, true)
      }
    }

    closeOverlay = overlayName => {
      this.setState({ [overlayName]: false })
    }

    changeQuestion = questionNumber => {
      const { userPracticeQuestions } = this.props
      const noOfQuestions = userPracticeQuestions.getIn(['practiceQuestions'])
        .size
      const nextQuestion = userPracticeQuestions.getIn(['practiceQuestions', questionNumber]) && userPracticeQuestions.getIn(['practiceQuestions', questionNumber]).toJS()
      if (questionNumber >= 0 && questionNumber < noOfQuestions) {
        this.setState({ questionSelected: questionNumber }, () => this.updateStartEndTimeForAnswer(nextQuestion, 'next'))
      }
    }
    
    updateStartEndTimeForAnswer = (questionObj, type = 'next') => {
      const { userPracticeQuestions } = this.props
      const questions = (userPracticeQuestions.getIn(['practiceQuestions']) && userPracticeQuestions.getIn(['practiceQuestions']).toJS()) || []
      if (questions && questions.length) {
        const findQuestionIndex = questions.findIndex(question => get(question, 'question.id') === get(questionObj, 'question.id'))
        if (findQuestionIndex !== -1) {
          const newAnswersAdditionalInfo = [...this.state.answersAdditionalInfo]
          if (type === 'prev' && get(this.state.answersAdditionalInfo, `[${findQuestionIndex}].startTime`) && newAnswersAdditionalInfo[findQuestionIndex]) {
            newAnswersAdditionalInfo[findQuestionIndex].endTime = new Date().toISOString()
          } else if (type === 'next' && !get(this.state.answersAdditionalInfo, `[${findQuestionIndex}].startTime`) && newAnswersAdditionalInfo[findQuestionIndex]) {
            newAnswersAdditionalInfo[findQuestionIndex].startTime = new Date().toISOString()
          }
          this.setState({
            answersAdditionalInfo: newAnswersAdditionalInfo
          })
        }
      }
      if (type === 'next') {
        this.setState({
          prevAnswer: null
        })
      }
    }

    updateAnswersAdditionalInfo = async (
      hintUsed = false,
      answerUsed = false,
      attempted = false,
      isStatusComplete = false
    ) => {
      const learningObjectiveId = this.props.learningObjectiveId
      const { userId } = this.props
      const { questionSelected, answersAdditionalInfo } = this.state
      if (hintUsed && answersAdditionalInfo[questionSelected] &&!answersAdditionalInfo[questionSelected][isHintUsed]) {
        const newAnswersAddtionalInfo = answersAdditionalInfo.map(
          (answerInfo, index) => {
            if (index === questionSelected) {
              return { ...answerInfo, isHintUsed: true }
            } else {
              return answerInfo
            }
          }
        )
        localStorage.setItem(
          `pq/${userId}/${learningObjectiveId}`,
          JSON.stringify(newAnswersAddtionalInfo)
        )
        this.setState({ answersAdditionalInfo: newAnswersAddtionalInfo })
      } else if (
        answerUsed &&
        !answersAdditionalInfo[questionSelected][isAnswerUsed]
      ) {
        const newAnswersAddtionalInfo = answersAdditionalInfo.map(
          (answerInfo, index) => {
            if (index === questionSelected) {
              return { ...answerInfo, isAnswerUsed: true }
            } else {
              return answerInfo
            }
          }
        )
        localStorage.setItem(
          `pq/${userId}/${learningObjectiveId}`,
          JSON.stringify(newAnswersAddtionalInfo)
        )
        this.setState({ answersAdditionalInfo: newAnswersAddtionalInfo })
      } else if (attempted) {
        const newAnswersAddtionalInfo = answersAdditionalInfo.map(
          (answerInfo, index) => {
            if (index === questionSelected) {
              if (isStatusComplete === true) {
                return {
                  ...answerInfo,
                  attemptNumber: answerInfo.attemptNumber + 1,
                  status: 'complete'
                }
              } else {
                return {
                  ...answerInfo,
                  attemptNumber: answerInfo.attemptNumber + 1,
                  status: 'incomplete'
                }
              }
            } else {
              return answerInfo
            }
          }
        )

        localStorage.setItem(
          `pq/${userId}/${learningObjectiveId}`,
          JSON.stringify(newAnswersAddtionalInfo)
        )
        this.setState({ answersAdditionalInfo: newAnswersAddtionalInfo })
      }
    }

    displayCorrectAnswerMessage = () => {
      this.openOverlay(visibleCorrectAnswerOverlay)
      // const { questionSelected } = this.state
      // const { userPracticeQuestions } = this.props
      this.setState({
        visibleWrongAnswerMessage: false,
        visibleHintOverlay: false
      })
      // if (
      //   questionSelected ===
      //   userPracticeQuestions.getIn(['practiceQuestions']).size - 1
      // ) {
      //   this.dumpPracticeQuestions()
      // }
    }

    displayWrongAnswerMessage = () => {
      this.setState(
        {
          visibleWrongAnswerMessage: true
        },
        () => {
          if (this.state.visibleHintOverlay) {
            this.setState({ visibleHintOverlay: false })
          }
          setTimeout(() => {
            // this.setState({ visibleWrongAnswerMessage: false })
          }, isMobile() ? 2000 : 6000)
        }
      )
    }

    dumpPracticeQuestions = async () => {
      const { userPracticeQuestions } = this.props
      const { answersAdditionalInfo } = this.state
      const dumpInput = []
      for (let i = 0; i < answersAdditionalInfo.length; i++) {
        const questionId = userPracticeQuestions.getIn([
          'practiceQuestions',
          i,
          'question',
          'id'
        ])
        const questionInput = {
          questionConnectId: questionId,
          isHintUsed: answersAdditionalInfo[i][isHintUsed],
          isAnswerUsed: answersAdditionalInfo[i][isAnswerUsed],
          attemptNumber: answersAdditionalInfo[i][attemptNumber],
          // attemptNumber:
          //   i === answersAdditionalInfo.length - 1
          //     ? answersAdditionalInfo[i][attemptNumber] + 1
          //     : answersAdditionalInfo[i][attemptNumber],
          isCorrect: true,
          questionAction: 'next',
        }
        if (answersAdditionalInfo[i].startTime) {
          questionInput.startTime = answersAdditionalInfo[i].startTime
        }
        if (answersAdditionalInfo[i].endTime) {
          questionInput.endTime = answersAdditionalInfo[i].endTime
        }
        dumpInput.push(questionInput)
      }
      const learningObjectiveId = this.props.learningObjectiveId
      this.practiceQuestionStatusBeforeDump = this.props.userPracticeQuestions.get('practiceQuestionStatus')
      const connectCourseId = this.props.topicId ? getCourseId(this.props.topicId) : this.props.courseId
      this.response = await dumpPracticeQuestions(
        this.props.userId,
        learningObjectiveId,
        dumpInput,
        this.props.nextComponent,
        this.props.topicId,
        this.props.userLearningObjective.get('id'),
        'withMenteeMentorToken',
        connectCourseId
      )
    }

    afterDump = () => {
      const learningObjectiveId = this.props.learningObjectiveId
      // if (this.props.nextComponent.get('nextComponentType') === 'message') {
      //   fetchChatPractice(this.props.userId, this.props.nextComponent.getIn(['learningObjective', 'id']))
      // } else {
      //   fetchQuizQuestions(this.props.userId, this.props.topicId)
      // }
      if (this.practiceQuestionStatusBeforeDump === 'incomplete') {
        const filteredLO = this.props.learningObjectives.filter(learningObjective => learningObjective.getIn(['topics', 0, 'id']) === this.props.topicId)
        const order = sort.ascend(filteredLO, ['order']).findIndex((learningObjective, i) => learningObjective.get('id') === this.props.learningObjectiveId)
        const userTopicJourneyQuiz = this.props.userTopicJourney.getIn([0, 'quiz'])
        const quiz = (userTopicJourneyQuiz &&  userTopicJourneyQuiz.toJS) ? userTopicJourneyQuiz.toJS() : {}

        // Topic title issue bug.
        const nextComponentToUpdate = order + 1 === this.props.learningObjectives.size
          ? {
            userTopicJourney: {
              id: this.props.topicId,
              quiz: { isUnlocked: true, ...quiz }
            },
            learningObjective: [{
              id: learningObjectiveId,
              practiceQuestionStatus : 'complete'
            }]
          }
          : {
            learningObjective: [{
              id: this.props.nextComponent.getIn(['learningObjective', 'id']),
              isUnlocked: true,
            }, {
              id: learningObjectiveId,
              practiceQuestionStatus : 'complete'
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
        const loId = this.props.learningObjectiveId
        duck.stale({
          root: 'chatPractice',
          key: loId
        })
      }
      this.setState({ response: this.response })
      this.onReportButtonClick()
    }
    getNextComponent = () => {
      const { topicId, loId } = this.props.match.params
      const { topics } = this.props
      const topicJS = (topics && topics.toJS().filter(topic => topic.id === topicId)) || []
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
      getNextComponentDetails = () => {
        const {nextComponent, currentComponent} = this.getNextComponent()
        let componentDetail = {
            title: '',
            id: ''
        }
        const nextLoComponentKey = this.getNextLoOfCurrentComponent(currentComponent)
        if (nextLoComponentKey) {
          const LoTitle = get(currentComponent, 'learningObjective.title') ? `( ${get(currentComponent, 'learningObjective.title')} )` : ''
          const LoId = get(currentComponent, 'learningObjective.id')
          componentDetail = getLoComponentMapping(nextLoComponentKey, LoId, LoTitle)
          return componentDetail
        }

        if (nextComponent && nextComponent.componentName === 'video') {
            const videoId = get(nextComponent, 'video.id')
            componentDetail = {
              id: videoId,
              title: 'Video'
            }
        } else if (nextComponent && nextComponent.componentName === 'learningObjective') {
            const LoRedirectKey = this.getNextLoComponent(nextComponent)
            const LoTitle = get(nextComponent, 'learningObjective.title') ? `( ${get(nextComponent, 'learningObjective.title')} )` : ''
            const LoId = get(nextComponent, 'learningObjective.id')
            componentDetail = getLoComponentMapping(LoRedirectKey, LoId, LoTitle)
        } else if (nextComponent && nextComponent.componentName === 'blockBasedProject') {
            const projectTitle = get(nextComponent, 'blockBasedProject.title') ? `( ${get(nextComponent, 'blockBasedProject.title')} )` : ''
            componentDetail = {
                id: get(nextComponent, 'blockBasedProject.id'),
                title: 'Project',
            }
        } else if (nextComponent && nextComponent.componentName === 'blockBasedPractice') {
            const projectTitle = get(nextComponent, 'blockBasedProject.title') ? `( ${get(nextComponent, 'blockBasedProject.title')} )` : ''
            componentDetail = {
                id: get(nextComponent, 'blockBasedProject.id'),
                title: 'Practice',
            }
        } else if (nextComponent && nextComponent.componentName === 'assignment') {
            componentDetail = {
                id: null,
                title: 'Coding Assignment',
            }
        }
        return componentDetail
  }
    getNextLoComponent = (nextComponent) => {
      const { course } = this.props
      const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
      let filteredLo = this.props.learningObjective && this.props.learningObjective.toJS().filter(lo => get(lo, 'id') === nextComponent.learningObjective.id)
      let LoRedirectKey = 'comic-strip'
      if (filteredLo && filteredLo.length && sortedLoComponentRule && sortedLoComponentRule.length) {
          const filteredLoComponentRule = getFilteredLoComponentRule(filteredLo[0], sortedLoComponentRule, (get(nextComponent, 'learningObjectiveComponentsRule', []) || []))
          if (filteredLoComponentRule && filteredLoComponentRule.length) {
              LoRedirectKey = getLORedirectKey(filteredLoComponentRule[0])
          }
      }
      return LoRedirectKey
    }
  getNextLoOfCurrentComponent = (currentComponent) => {
      const { course } = this.props
      const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
      let filteredLo = this.props.learningObjective && this.props.learningObjective.toJS().filter(lo => get(lo, 'id') === currentComponent.learningObjective.id)
      let LoRedirectKey = ''
      if (filteredLo && filteredLo.length && sortedLoComponentRule && sortedLoComponentRule.length) {
          const filteredLoComponentRule = getFilteredLoComponentRule(filteredLo[0], sortedLoComponentRule, (get(currentComponent, 'learningObjectiveComponentsRule', []) || []))
          const currentLoComponentIndex = filteredLoComponentRule.findIndex(componentRule => get(componentRule, 'componentName') === 'practiceQuestion')
          const nextLoComponent = filteredLoComponentRule[currentLoComponentIndex + 1]
          if (nextLoComponent && Object.keys(nextLoComponent).length) {
              LoRedirectKey = getLORedirectKey(nextLoComponent)
          }
      }
      return LoRedirectKey
    }
    onReportButtonClick = async () => {
      const {learningObjectiveId,topicId, courseId} = this.props
      const { userId } = this.props
        this.closeOverlay(visibleCorrectAnswerOverlay)
        localStorage.removeItem(`pq/${userId}/${learningObjectiveId}`)
      if (this.props.match.path === '/sessions/practice-quiz/:courseId/:topicId/:loId') {
        if (checkIfEmbedEnabled()) {
          this.props.history.push(
            `/sessions/pq-report/${courseId}/${topicId}/${learningObjectiveId}`,
              {
                answers: this.state.answers,
                answersAdditionalInfo: this.state.answersAdditionalInfo,
                shouldFetchReportOffline: true
              }
          )
        } else {
          this.props.history.push(
            `/sessions/practice-report/${courseId}/${topicId}/${learningObjectiveId}`,
              {
                answers: this.state.answers,
                answersAdditionalInfo: this.state.answersAdditionalInfo,
                shouldFetchReportOffline: true
              }
          )
        }
      } else if (this.props.match.path === '/revisit/sessions/practice-quiz/:courseId/:topicId/:loId') {
        if (checkIfEmbedEnabled()) {
          if (isPqReportNotAllowed()) {
            const {nextComponent, currentComponent} = this.getNextComponent()
            // const revistRoute = '/revisit'
            const redirectUrl = getNextLoComponentRoute({
              course: this.props.course,
              learningObjective: this.props.learningObjective,
              learningObjectiveId: learningObjectiveId,
              topicComponentRule: currentComponent,
              courseId,
              topicId,
              childComponentsName: ["practiceQuestion"]
            })
            if (redirectUrl) {
                return this.props.history.push(redirectUrl)
            }
            if (nextComponent) {
              const { course } = this.props
              const sortedLoComponentRule = course && sort.ascend(course.getIn(['defaultLoComponentRule'], Map([])), ['order']).toJS()
              const { redirectUrl } = getInSessionRoute({
                  topicComponentRule: nextComponent,
                  course: {
                      id: courseId,
                      defaultLoComponentRule: sortedLoComponentRule
                  },
                  topicId,
                  learningObjectives: this.props.learningObjective,
                  goToNextComponent: true
              })
              if (redirectUrl) {
                  return this.props.history.push(redirectUrl)
              }
            } else {
              if (checkIfEmbedEnabled()) return goBackToTeacherApp()
            }
          }
          this.props.history.push(
            `/revisit/sessions/pq-report/${courseId}/${topicId}/${learningObjectiveId}`,
            {
              learningObjectiveId,
              topicId: this.props.topicId,
              isFirstTime: this.initialPracticeQuestionStatus === 'incomplete'
            }
        )
        } else {
          this.props.history.push(
            `/revisit/sessions/practice-report/${courseId}/${topicId}/${learningObjectiveId}`,
            {
              learningObjectiveId,
              topicId: this.props.topicId,
              isFirstTime: this.initialPracticeQuestionStatus === 'incomplete'
            }
        )
        }
      }
        // this.props.navigation.navigate('PQReport', {
        //   learningObjectiveId,
        //   topicId: this.props.topicId,
        //   isFirstTime: this.initialPracticeQuestionStatus === 'incomplete'
        // })
    }

    onCheckButtonClick = () => {
      const { userPracticeQuestions } = this.props
      const { questionSelected, answers } = this.state
      const practiceQuestions =
        userPracticeQuestions.getIn(['practiceQuestions']) || Map({})
      const questionData = practiceQuestions.get(questionSelected) || Map({})
      let isStatusComplete = false
      const prevQuestion = userPracticeQuestions.getIn(['practiceQuestions', questionSelected]) && userPracticeQuestions.getIn(['practiceQuestions', questionSelected]).toJS()
      if (questionData.getIn(['question', 'questionType']) === ARRANGE) {
        const options = questionData.getIn(['question', 'arrangeOptions'])
        let isCorrect = true
        if (answers[questionSelected]) {
        for (let i = 0; i < options.size; i++) {
          /* pick the element in at each index and get its correct position from props data
           then compare the position with current position which is index + 1
          */
          const correctPosition = options.getIn([
            answers[questionSelected][i],
            'correctPosition'
          ])
          const correctPositions = options.getIn([
            answers[questionSelected][i],
            'correctPositions'
          ]).toJS()
          // one is added because the order returned in answers is 0 indexed
          const currentPosition = i + 1
          if (correctPositions && correctPositions.length) {
            if (currentPosition !== null && correctPositions.indexOf(currentPosition) === -1) {
              this.displayWrongAnswerMessage()
              isCorrect = false
              break
            }
          } else {
            if (currentPosition !== null && currentPosition !== correctPosition) {
              this.displayWrongAnswerMessage()
              isCorrect = false
              break
            }
          }
        }
        }
        if (isCorrect) {
          isStatusComplete = true
          this.updateStartEndTimeForAnswer(prevQuestion, 'prev')
          this.displayCorrectAnswerMessage()
        }
      } else if (questionData.getIn(['question', 'questionType']) === FIBINPUT) {
        const options = questionData.getIn(['question', 'fibInputOptions'])
        let allBlanksCorrect = true
        for (let i = 0; i < options.size; i++) {
          const correctPosition = options.getIn([i, 'correctPosition']) || Map({})
          const correctAnswers = options.getIn([i, 'answers']) || Map({})
          const attemptedAnswer = answers[questionSelected][correctPosition - 1]
          let isAnswerCorrect = false
          for (
            let answerindex = 0;
            answerindex < correctAnswers.size;
            answerindex++
          ) {
            if (attemptedAnswer === correctAnswers.get(answerindex)) {
              isAnswerCorrect = true
              break
            }
          }
          if (!isAnswerCorrect) {
            allBlanksCorrect = false
            break
          }
        }
        if (allBlanksCorrect) {
          isStatusComplete = true
          this.updateStartEndTimeForAnswer(prevQuestion, 'prev')
          this.displayCorrectAnswerMessage()
        } else {
          this.displayWrongAnswerMessage()
        }
      } else if (questionData.getIn(['question', 'questionType']) === FIBBLOCK) {
        const options = questionData.getIn(['question', 'fibBlocksOptions'])
        let allBlanksCorrect = true
        for (let i = 0; i < options.size; i++) {
          const correctPositions = options.getIn([i, 'correctPositions'])
          const statement = options.getIn([i, 'statement'])
          let isAnswerCorrect = false
          for (
            let positionIndex = 0;
            positionIndex < correctPositions.size;
            positionIndex++
          ) {
            const position = correctPositions.get(positionIndex)
            const attemptedAnswer = answers[questionSelected][position - 1]
            if (attemptedAnswer === statement) {
              isAnswerCorrect = true
              break
            }
          }
          if (!isAnswerCorrect && correctPositions.size > 0) {
            allBlanksCorrect = false
          }
        }
        if (allBlanksCorrect) {
          isStatusComplete = true
          this.updateStartEndTimeForAnswer(prevQuestion, 'prev')
          this.displayCorrectAnswerMessage()
        } else {
          this.displayWrongAnswerMessage()
        }
      } else if (questionData.getIn(['question', 'questionType']) === MCQ) {
        const options = questionData.getIn(['question', 'mcqOptions'])
        let correctAnswer = true
        for (let i = 0; i < options.size; i++) {
          const isCorrect = options.getIn([i, 'isCorrect'])
          const isSelected = answers[questionSelected][i]
          /*  1. option is true and its not selected
              2.option is false and it selected
              both are wrong answer cases */
          if ((isCorrect && !isSelected) || (!isCorrect && isSelected)) {
            correctAnswer = false
          }
        }
        if (correctAnswer) {
          isStatusComplete = true
          this.updateStartEndTimeForAnswer(prevQuestion, 'prev')
          this.displayCorrectAnswerMessage()
        } else {
          this.displayWrongAnswerMessage()
        }
      }
      if (!isStatusComplete) {
        this.setState({ prevAnswer: answers[questionSelected] })
      } else {
        this.setState({ prevAnswer: null })
      }
      this.updateAnswersAdditionalInfo(
        undefined,
        undefined,
        true,
        isStatusComplete
      )
    }

    /* function is used for fibinput ,fibblock  and mcq to
    check the user has attempted the question */
    checkIfFibOrMcqAttempted = () => {
      const { questionSelected, answers } = this.state
      for (let i = 0; i < answers[questionSelected].length; i = i + 1) {
        if (answers[questionSelected][i] && answers[questionSelected][i] !== '') {
          return true
        }
      }
      return false
    }

    checkIfAttempted = () => {
      const { userPracticeQuestions } = this.props
      const { questionSelected, answers } = this.state
      let isCheckButtonActive = false
      const practiceQuestions =
        userPracticeQuestions.getIn(['practiceQuestions']) || Map({})
      const questionData = practiceQuestions.get(questionSelected) || Map({})
      if (
        questionData.getIn(['question', 'questionType']) === ARRANGE &&
        answers[questionSelected] &&
        answers[questionSelected].length !== 0 &&
        JSON.stringify(answers[questionSelected]) !==
          JSON.stringify([
            ...Array(
              questionData.getIn(['question', 'arrangeOptions']).size
            ).keys()
          ])
      ) {
        isCheckButtonActive = true
      } else if (
        (questionData.getIn(['question', 'questionType']) === FIBINPUT ||
          questionData.getIn(['question', 'questionType']) === FIBBLOCK ||
          questionData.getIn(['question', 'questionType']) === MCQ) &&
        answers[questionSelected] &&
        answers[questionSelected].length !== 0
      ) {
        if (this.checkIfFibOrMcqAttempted()) {
          isCheckButtonActive = true
        }
      }
      return isCheckButtonActive
    }
    
    checkIfAnotherAnsSelected = () =>{
      const { prevAnswer, questionSelected, answers } = this.state
      if (prevAnswer && answers[questionSelected] && prevAnswer === answers[questionSelected]) return true
      return false
    }

    updateComponentDetailAfterChatDump = () => {
      const filteredLO = this.props.learningObjectives.filter(learningObjective => learningObjective.getIn(['topics', 0, 'id']) === this.props.topicId)
      const order = sort.ascend(filteredLO, ['order']).findIndex((learningObjective, i) => learningObjective.get('id') === this.props.learningObjectiveId)
      duck.merge(() => ({
        currentTopicComponent: 'practiceQuestion',
        currentTopicComponentDetail: {
          percentageCovered: (((order + 1) * 2) / ((filteredLO.size * 2) + 2)) * 100
        }
      }))
    }

    getVideoPath = (topicId, learningObjective, courseId) => {
      const loId = learningObjective && learningObjective.id
      if (this.props.match.path === '/sessions/practice-quiz/:courseId/:topicId/:loId') {
        return `/sessions/video/${courseId}/${topicId}`
      } else if (this.props.match.path === '/revisit/sessions/practice-quiz/:courseId/:topicId/:loId') {
        return `/revisit/sessions/video/${courseId}/${topicId}`
      }

      return `/sessions/video/${courseId}/${topicId}`
    }

    onToggleButtonClick = () => {
      this.setState({ isSeeAnswers: !this.state.isSeeAnswers })
    }

    render() {
      const isMobile = window !== 'undefined' ? window.innerWidth <= 768 : false
      const {
        hasFetched,
        userPracticeQuestions,
        learningObjectiveData,
        courseId
      } = this.props
      if (hasFetched) {
        const {
          questionSelected,
          answers,
          visibleCorrectAnswerOverlay,
          visibleWrongAnswerMessage,
          answersAdditionalInfo,
          isSeeAnswers
        } = this.state
        //     const { nextComponent } = this.props
        //     const videoThumbnail = this.props.topicData.get('videoThumbnail')
        const { topicId } = this.props
        const learningObjective = learningObjectiveData.toJS()
        const practiceQuestions =
          userPracticeQuestions.getIn(['practiceQuestions']) || Map({})
        const practiceQuestionStatus =
          userPracticeQuestions.get('practiceQuestionStatus') || Map({})
        const isCheckButtonActive = this.checkIfAttempted()
        const questionData = userPracticeQuestions.getIn(['practiceQuestions', questionSelected]) || Map({})
        const hint = questionData.getIn(['question', 'hint'])
        let hints = questionData.getIn(['question', 'hints']) ? questionData.getIn(['question', 'hints']).toJS() : []
        if (hints && hints.length) {
          hints = hints.filter(el => el.hint)
        }
        if (hints && (hints.length === 0) && hint) {
          hints.push({hint, hintPretext: ''})
        }
        const answer = questionData.getIn(['question', 'explanation'])
        const hintTextArray = hints.filter(hint => (get(hint, 'hint', '') || '').trim())
        return (
            <div className={cx(isMobile ? styles.mbContainer : styles.container, checkIfEmbedEnabled() && styles.containerForTeacherApp)}>
              {(this.state.visibleHintOverlay && isMobile) ? (
                <div 
                  style={{
                    background: 'rgba(0,0,0,0.22)',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 99,
                    width: '100%',
                    height: '100%',
                  }} 
                />
              ) : null}
              <span className='practice-quiz-page-mixpanel-identifier' />
              <PreserveState
                state={this.state}
                setState={(state, callback = () => {}) => {
                  this.setState({
                    ...state,		
                  },		
                  callback)
                }}		
                persistIf={id => {
                  return id === this.props.match.url
                }}		
                saveIf={this.state}
                id={this.props.match.url}		
              />
              {/* <UpdatedSideNavBar
                parent='sessions'
                revisitRoute={this.props.match.path.includes('/revisit')}
                mobileNav
                computedMatch={this.props.computedMatch || this.props.match}
                pageTitle="Practice"
                additionalRenderer = {() => (
                  <div className={(isMobile && this.state.visibleHintOverlay) ? styles.infoAndCheck : ''} style={{display: 'flex',justifyContent: 'space-around',}}>
                    {(hintTextArray.length || answer) && (
                      <HintIcon
                        style={{
                          marginRight: '16px'
                        }}
                        className={styles.hintIcon}
                        onClick={()=>{
                          if (!this.state.visibleCorrectAnswerOverlay) {
                            this.setState((prevState) => ({
                            ...prevState,
                            visibleHintOverlay: !prevState.visibleHintOverlay
                          }))
                          }
                        }} />
                    )}
                    <button className={(!isCheckButtonActive || this.state.visibleCorrectAnswerOverlay) ? styles.mbUnactiveCheckButton : styles.mbaActiveCheckButton}
                        onClick={()=>{if (isCheckButtonActive && !this.state.visibleCorrectAnswerOverlay){
                          this.onCheckButtonClick()
                          }}}
                        >Check
                    </button>
                  </div>
                )}
              /> */}
              <QuestionArea
                userPracticeQuestions={this.props.userPracticeQuestions}
                activeQuestionIndex={questionSelected}
                changeQuestion={this.changeQuestion}
                updateAnswers={this.updateAnswers}
                answersAdditionalInfo={answersAdditionalInfo}
                numberOfQuestions={practiceQuestions.size}
                practiceQuestionStatus={practiceQuestionStatus}
                isPqStoryPresent={learningObjective.pqStory}
                answers={answers}
                // isCheckButtonActive={isCheckButtonActive}
                onCheckButtonClick={this.onCheckButtonClick}
                openOverlay={this.openOverlay}
                onReportButtonClick={this.onReportButtonClick}
                visibleHintOverlay={this.state.visibleHintOverlay}
                closeOverlay={this.closeOverlay}
                revisitRoute={this.props.match && this.props.match.path.includes('/revisit')}
                isMobile={isMobile}
                isOverlayOpen={this.state.visibleHintOverlay}
                isSeeAnswers={isSeeAnswers}
                answerType={isSeeAnswers ? "RS" : undefined}
                renderComponent={() => <div className={styles.solutionToggleContainer}>
                  <ShowSolutionToggle isSeeAnswers={isSeeAnswers} handleToggleClick={this.onToggleButtonClick} />
                </div>}
              />
                {
                  !isMobile ?
                  (
                    <Footer
                      closeOverlay={this.closeOverlay}
                      openOverlay={this.openOverlay}
                      isCheckButtonActive={isCheckButtonActive}
                      onCheckButtonClick={this.onCheckButtonClick}
                      showHelp={hintTextArray.length || answer}
                      isMobile={isMobile}
                      isHintTextExist={hintTextArray.length}
                    />
                  ): null
                }
                {(!this.state.visibleCorrectAnswerOverlay && (hintTextArray.length || answer)) ? <HelpOverlay
                visible={this.state.visibleHintOverlay}
                closeOverlay={this.closeOverlay}
                hints={hints}
                answer={answer}
                isHintTextExist={hintTextArray.length}
                history={this.props.history}
                videoStartTime= {learningObjective.videoStartTime}
                videoEndTime= {learningObjective.videoEndTime}
                videoPath={this.getVideoPath(topicId, learningObjective, courseId)}
                isCheckButtonActive={isCheckButtonActive}
                updateAnswersAdditionalInfo={this.updateAnswersAdditionalInfo}
                onCheckButtonClick={this.onCheckButtonClick}
                isMobile={isMobile}
                /> : null}
                <CorrectAnswerOverlay 
                  visible={visibleCorrectAnswerOverlay} 
                  answer={answer}
                  changeQuestion={this.changeQuestion}
                  pqDumpLoading={this.props.pQDumpStatus.get('loading', false)}
                  onReportButtonClick={this.onReportButtonClick}
                  dumpPracticeQuestions={this.dumpPracticeQuestions}
                  activeQuestionIndex={questionSelected}
                  numberOfQuestions={practiceQuestions.size}
                  practiceQuestionStatus={practiceQuestionStatus}
                  isMobile={isMobile}
                  reportButtonText={this.getNextComponentDetails().title}
                  revisitRoute={this.props.match.path.includes('/revisit')}
                  userLearningObjective={this.props.userLearningObjective && this.props.userLearningObjective.toJS()}
                  loggedInUser={this.props.loggedInUser && this.props.loggedInUser.toJS()}
                  nextButtonDetails={
                    {
                      topicId,
                      url: this.props.match.url,
                      lastItem:practiceQuestions.size === questionSelected + 1,
                      dumpSession: this.dumpPracticeQuestions,       
                    }
                  }
                />
            <WrongAnswer visible={visibleWrongAnswerMessage} isMobile={isMobile} isUpdatedDesign openHintOverLay={() => {
              this.closeOverlay('visibleWrongAnswerMessage')
              this.openOverlay("visibleHintOverlay", hintTextArray.length);
            }}
              closeWrongOverlay={() => this.closeOverlay('visibleWrongAnswerMessage')}
              showHelp={hintTextArray.length || answer}
              onCheckButtonClick={this.onCheckButtonClick}
              checkIfAnotherAnsSelected={this.checkIfAnotherAnsSelected()}
              isHintTextExist={hintTextArray.length}
            />
                {learningObjective.pqStory && (
                  <PQStoryOverlay
                  visible={this.state.visiblePqStoryOverlay}
                  closeOverlay={this.closeOverlay}
                  pqStory={learningObjective.pqStory}
                  isMobile={isMobile}
                  />
                )}
            </div>
        )
      }
      else{
        return ( 
          <>
            {/* <UpdatedSideNavBar
              mobileNav
              parent='sessions'
              revisitRoute={this.props.match.path.includes('/revisit')}
              computedMatch={this.props.computedMatch || this.props.match}
              pageTitle="Practice"
            /> */}
            <Skeleton isMobile={isMobile} />
          </>
        )
      }
    }
  }
