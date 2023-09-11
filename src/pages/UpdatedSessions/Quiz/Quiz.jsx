import React from 'react'
import cx from 'classnames'
import {isEmpty, get as getFromLoadash, sortBy, debounce} from 'lodash'
import fetchQuizQuestions from '../../../queries/fetchQuizQuestions'
import styles from './Quiz.module.scss'
import dumpQuiz from '../../../queries/dumpQuiz'
import { filterKey } from '../../../utils/data-utils'
import duck from '../../../duck'
import QuestionArea from './components/QuestionArea'
import Skeleton from '../../../components/QuestionTypes/Skeleton'
import fetchMentorMenteeSession from '../../../queries/sessions/fetchMentorMenteeSession'
import updateMentorMenteeSession from '../../../queries/sessions/updateMentorMenteeSession'
import fetchQuizReport from '../../../queries/fetchQuizReport'
import fetchQuizAnswers from '../../../queries/fetchQuizAnswers'
import {ARRANGE, FIBBLOCK, FIBINPUT, MCQ} from "../../Practice/constants";
import { motion } from 'framer-motion'
import { get } from 'immutable'
import QuestionAreaReview from './components/QuestionAreaReview'
import { getFirstComponentFromLocalStorage, getLORedirectKey, getPreviousTopicIdFromLocalStorage } from '../utils'
import PreserveState from '../../../components/PreserveState'
import isMobile from '../../../utils/isMobile'
import UpdatedSideNavBar from '../../../components/UpdatedSideNavBar'
import mentorMenteeSessionAddOrDelete from '../../../utils/mmSessionAddOrDelete'
import { checkIfEmbedEnabled, getEmbedData, isAccessingTrainingResources } from '../../../utils/teacherApp/checkForEmbed'
import ShowSolutionToggle from '../../../components/ShowSolutionToggle'
import goBackToTeacherApp from '../../../utils/teacherApp/goBackToTeacherApp'
import NextFooter from '../../../components/NextFooter'
import { fetchHomeworkDetails, updateHomeworkAttempted } from '../../../components/NextFooter/utils'
import { HOMEWORK_COMPONENTS_CONFIG } from '../../../constants/topicComponentConstants'
import { backToPageConst } from '../../TeacherApp/constants'


const fibBlock = 'fibBlock'
const arrange = 'arrange'
const fibInput = 'fibInput'
const mcq = 'mcq'

export const getSortedQuizAnswers = (quizAnswers) => {
    const quizAnswersByLO = {}
    const sortedQuizAnswers = []
    if (quizAnswers) {
        quizAnswers.forEach((quiz) => {
            if (quiz.question && get(quiz.question.learningObjectives[0], 'id')) {
                if (quizAnswersByLO[get(quiz.question.learningObjectives[0], 'id')]) {
                    (quizAnswersByLO[get(quiz.question.learningObjectives[0], 'id')]).push(quiz)
                } else {
                    quizAnswersByLO[get(quiz.question.learningObjectives[0], 'id')] = [quiz]
                }
            } else {
                if (quizAnswersByLO[quiz.question.learningObjective.id]) {
                    (quizAnswersByLO[quiz.question.learningObjective.id]).push(quiz)
                } else {
                    quizAnswersByLO[quiz.question.learningObjective.id] = [quiz]
                }
            }
        })
        const keys = Object.keys(quizAnswersByLO)
        let newOrder = 1
        keys.forEach((key) => {
            const sortedQuizAnswersWithinLO = sortBy(quizAnswersByLO[key], 'question.order')
            sortedQuizAnswersWithinLO.forEach((quizAnswer) => {
                quizAnswer.question.order = newOrder
                sortedQuizAnswers.push(quizAnswer)
                newOrder += 1
            })
        })
    }
    return sortedQuizAnswers
}


export const getOptions = (answer, questionType) => {
  switch (questionType) {
    case MCQ:
      return getFromLoadash(answer, "userMcqAnswer");
    case FIBBLOCK:
      return getFromLoadash(answer, "userFibBlockAnswer");
    case FIBINPUT:
      return getFromLoadash(answer, "userFibInputAnswer");
    case ARRANGE:
      return getFromLoadash(answer, "userArrangeAnswer");
    default:
        return null
  }
};

export const getPrevAnswer = (options, questionType) => {
  const answer = [];
  switch (questionType) {
    case MCQ:
      options.forEach((option) => {
        if (option.isSelected) {
          answer.push(true);
        } else {
          answer.push(false);
        }
      });
      break;
    case FIBBLOCK:
      let modOptions = sortBy(options, "position");
      const positionsIncluded = [];
      modOptions.forEach((option) => {
        if (!positionsIncluded.includes(get(option, "position"))) {
          answer.push(option.statement);
          positionsIncluded.push(get(option, "position"));
        }
      });
      break;
    case FIBINPUT:
      modOptions = sortBy(options, "position");
      modOptions.forEach((option) => {
        answer.push(option.answer);
      });
      break;
    case ARRANGE:
      // options = sortBy(options, 'position')
      options.forEach((option, index) => (option.index = index));
      const sortedOptions = sortBy(options, "position");
      sortedOptions.forEach((option) => {
          
        answer.push(getFromLoadash(option, "index"));
      });
      break;
    default:
        return null
    
  }

  return answer;
};

export const getLastAttemptAnswers = (userQuizAnswers, userQuizs) => {
  let payload = [];
  let finalPayload = null;
  if (userQuizAnswers && userQuizAnswers.toJS().length > 0) {
    const quizAnswers = userQuizAnswers.getIn([0, "quizAnswers"]);
    if (get(quizAnswers.toJS(), "question.learningObjectives[0].order")) {
      payload = getSortedQuizAnswers(
        sortBy(quizAnswers.toJS(), "question.learningObjectives[0].order")
      );
    } else {
      payload = getSortedQuizAnswers(
        sortBy(quizAnswers.toJS(), "question.learningObjective.order")
      );
    }
  }
  if (userQuizs && userQuizs.toJS()) {
    finalPayload = [];
    sortBy(userQuizs.toJS(), "questionDisplayOrder").forEach((el) => {
      const answer = payload.filter(
        (ansEl) =>
          getFromLoadash(ansEl, "question.id") ===
          getFromLoadash(el, "question.id")
      )[0];
      if (answer) {
        finalPayload.push(answer);
      }
    });
  }
  return finalPayload || payload;
}

export default class QuizRoot extends React.Component {
    constructor(props) {
        super(props)
        this.UpdatedSideNavBarRef = React.createRef();
    }
    state = {
        questionSelected: 0,
        questionLength: 6,
        visibleSubmitOverlay: false,
        visibleAbortOverlay: false,
        answers: [],
        debounceAnswers: [],
        isQuizDumpLoading: false,
        infoVisible: false,
        isSeeAnswers: false
    }

    getQuizReportId = () => {
        const quizReportTopicId = (this.props.location.state && this.props.location.state.quizReportTopicId) || getPreviousTopicIdFromLocalStorage()
        if (quizReportTopicId && (this.props.match.path === '/sessions/:courseId/:topicId/quiz')) {
            return quizReportTopicId
        }
        return null
    }
    

    updateQuizSubmittedStatus = (sessionId) => {
        const input = {
            isQuizSubmitted: true,
            quizSubmitDate: new Date(new Date().setHours(0, 0, 0, 0))
        }
        const { params: { topicId } } = this.props.match
        updateMentorMenteeSession(sessionId, input, topicId, true).call()
    }

    async componentDidUpdate(prevProps, prevState) {
        const { params: { topicId, courseId } } = this.props.match
        const activeQuestionIndex = this.props.location.state && this.props.location.state.activeQuestionIndex
        const prevActiveQuestionIndex = prevProps.location.state && prevProps.location.state.activeQuestionIndex
        if ((typeof activeQuestionIndex === 'number') && (activeQuestionIndex !== prevActiveQuestionIndex)) {
            this.changeQuestion(activeQuestionIndex)
            this.props.history.replace(this.props.history.pathname)
        }
        if (
            this.props.hasFetched !== prevProps.hasFetched &&
            this.props.userQuizs
        ) {
            if (this.state.answers.length === 0) {
                this.setAnswer()
            }
        }
       if(this.props.location.search !== prevProps.location.search){
        
        const questionNumber = this.props.history.location.search.split('=')[1]
            if(questionNumber){
                this.setState({questionSelected: parseInt(questionNumber) - 1})
            }
        }
      

        
        if (this.state.answers !== prevState.answers) {
            debounce(
                () => {
                    this.setState({ debounceAnswers: this.state.answers })
                },
                2000
            )()
            
            const activeQuiz =  sortBy(this.props.userQuizs.toJS(), 'questionDisplayOrder')[this.state.questionSelected]       
            const getActiceQuizId =  activeQuiz && activeQuiz.question.id
            const isQuizAnswered = this.state.answers[this.state.questionSelected] && this.state.answers[this.state.questionSelected].length > 0

            if (isQuizAnswered) {
            
                updateHomeworkAttempted(
                    getActiceQuizId,
                    'quiz'
                )
            }

        }
        if (this.state.debounceAnswers !== prevState.debounceAnswers) {
            this.onQuizSubmit()
        }

        if (
            this.props.mentorMenteeSessionFetchStatus &&
            prevProps.mentorMenteeSessionFetchStatus
        ) {
            if (
                this.props.mentorMenteeSessionFetchStatus.getIn([`mentorMenteeSession/${topicId}`, 'success']) &&
                !prevProps.mentorMenteeSessionFetchStatus.getIn([`mentorMenteeSession/${topicId}`, 'success'])
            ) {
                const { mentorMenteeSession } = this.props
                const session = filterKey(mentorMenteeSession, `mentorMenteeSession/${topicId}`)
                if (
                    session &&
                    session.getIn([0, 'id'])
                ) {
                    const input = {
                        isQuizSubmitted: true,
                        quizSubmitDate: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    updateMentorMenteeSession(session.getIn([0, 'id']), input, topicId, true)
                }
            }
        }

        if (
            this.props.mentorMenteeSessionUpdateStatus &&
            prevProps.mentorMenteeSessionUpdateStatus
        ) {
            if (
                this.props.mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'success']) &&
                !prevProps.mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'success'])
            ) {
                const { mentorMenteeSession, userId } = this.props
                const { params: { topicId } } = this.props.match
                if (mentorMenteeSession) {
                    const modifiedSession = mentorMenteeSession
                    mentorMenteeSession.toJS().forEach((session, index) => {
                        if (session && session.topicId === topicId) {
                            session.isQuizSubmitted = true
                            session.quizSubmitDate = new Date(new Date().setHours(0, 0, 0, 0))
                            modifiedSession[index] = session
                        }
                    })
                    duck.merge(() => ({
                        mentorMenteeSession: modifiedSession
                    }))
                }
                
            }
        }
        if (
            this.props.userQuizReportStatus && this.props.userQuizReportStatus.success &&
            !(prevProps.userQuizReportStatus && prevProps.userQuizReportStatus.success)
        ) {
            const quizReportId = this.getLatestQuizReportId(this.props.userFirstAndLatestQuizReport)
            if (quizReportId && quizReportId.length > 0) {
                await fetchQuizAnswers(quizReportId, null, true, courseId).call()
                this.setPrevAnswersInState()
            }
        }
    }

    setAnswer() {
        const answers = []
        for (let i = 0; i < this.props.userQuizs.toJS().length; i++) {
            answers.push([])
        }
        this.setState({ answers })
    }

    getLatestQuizReportId = (userFirstAndLatestQuizReport) => {
        return userFirstAndLatestQuizReport ?
            userFirstAndLatestQuizReport.getIn([0, 'latestQuizReport', 'quizReportId']) :
            ''
    }

    async componentDidMount() {
       const quizReportTopicId = this.getQuizReportId()
       const navigationId = quizReportTopicId ? quizReportTopicId : this.props.topicId
       const courseId = this.props.courseId
       if (isAccessingTrainingResources()) {
           fetchHomeworkDetails({
               topicId: this.props.match.params.topicId, courseId
           }).then(res => {
                    duck.merge(() => ({
                            homeWorkMeta: res,
                            }),
                            {
                                key : 'homeWorkMeta'
                            }
                    )     
           })
        }
       const activeQuestionIndex = this.props.location.state && this.props.location.state.activeQuestionIndex
        if(this.props.location.search){
            const questionNumber = this.props.location.search.split('=')[1]
            if(questionNumber){
                this.setState({questionSelected: parseInt(questionNumber) - 1})
            }
        }
       if (quizReportTopicId) {
           await fetchQuizReport(quizReportTopicId, courseId).call()
            mentorMenteeSessionAddOrDelete(this.props.userId, quizReportTopicId, '', 'completed', 'other', 
                        () => fetchMentorMenteeSession(
               null, null, this.props.userId,'menteeTopicFilter', null,true, quizReportTopicId
           ).call())
           
       } else {
           await fetchQuizReport(this.props.match.params.topicId, courseId).call()
           mentorMenteeSessionAddOrDelete(this.props.userId, this.props.topicId, '', 'completed', 'other', 
                        () => fetchMentorMenteeSession(
               null, null, this.props.userId,'menteeTopicFilter', null,true, this.props.topicId
           ).call())
       }
       const { path } = this.props.match
       const courseIdString = courseId ? '/:courseId' : ''
        if (path === `/homework${courseIdString}/:topicId/quiz`) {
            const { topicId } = this.props.match.params
            if(!this.props.hasFetched) {
                await fetchQuizQuestions(this.props.userId, topicId, courseId)
                this.setPrevAnswersInState()
            } else if (this.state.answers.length === 0) {
                this.setAnswer()
            }
        } else {
            if (!this.props.hasFetched) {
                await fetchQuizQuestions(this.props.userId, navigationId, courseId)
                this.setPrevAnswersInState()
            } else if (this.state.answers.length === 0) {
                this.setAnswer()
            }
        }
        if (typeof activeQuestionIndex === 'number') {
            this.changeQuestion(activeQuestionIndex)
            this.props.history.replace(this.props.history.pathname)
        }
        const isThisCurrentTopic =
            this.props.currentTopicComponentDetail.get('currentTopicId') === this.props.topicId
        const isQuizCurrentComponent = this.props.currentTopicComponent === 'quiz'

        if (!this.props.mentorMenteeSession.getIn([0, 'isQuizSubmitted']) && !localStorage.getItem('masteryLevelModalOpened')) {
            this.setState({ infoVisible: true })
            localStorage.setItem('masteryLevelModalOpened', true)
        }
       
    }

    changeQuestion = questionNumber => {
        this.setState({ questionSelected: questionNumber})
        this.props.history.push({
            search: `?question=${questionNumber + 1}`
        })
    }

    onBackButtonClick = () => {
        this.openOverlay('visibleAbortOverlay')
        return true
    }

    onBackButtonConfirm = () => {
        this.props.navigation.goBack()
    }

    closeOverlay = overlayName => {
        this.setState({ [overlayName]: false })
    }

    onQuizSubmit = async () => {
        const navigationId = this.props.topicId
        this.setState({
            isQuizDumpLoading: true
        })
        const userQuizs = sortBy(this.props.userQuizs.toJS(), 'questionDisplayOrder')
        const { answers } = this.state
       
        const quizDumpInput = { topicId: navigationId, quizQuestions: [], courseId: this.props.courseId }
        for (let i = 0; i < userQuizs.length; i = i + 1) {
            const { questionType } = userQuizs[i].question
            if (
                answers[i] &&
                answers[i].length !== 0 &&
                this.checkIfAttempted(questionType, i)
            ) {
                const questionDumpData = {
                    questionConnectId: userQuizs[i].question.id,
                    questionDisplayOrder: userQuizs[i].questionDisplayOrder,
                    isAttempted: true
                }
                const optionsDumpData = []
                if (questionType === mcq) {
                    const { mcqOptions } = userQuizs[i].question
                    for (
                        let optionIndex = 0;
                        optionIndex < mcqOptions.length;
                        optionIndex = optionIndex + 1
                    ) {
                        const option = {
                            statement: mcqOptions[optionIndex].statement,
                            isSelected: !!answers[i][optionIndex]
                        }
                        optionsDumpData.push(option)
                    }
                    questionDumpData.userMcqAnswer = optionsDumpData
                } else if (questionType === fibBlock) {
                    for (
                        let optionIndex = 0;
                        optionIndex < answers[i].length;
                        optionIndex = optionIndex + 1
                    ) {
                        if (answers[i][optionIndex] && answers[i][optionIndex] !== '') {
                            const option = {
                                statement: answers[i][optionIndex],
                                position: optionIndex + 1
                            }
                            optionsDumpData.push(option)
                        }
                    }
                    questionDumpData.userFibBlockAnswer = optionsDumpData
                } else if (questionType === fibInput) {
                    for (
                        let optionIndex = 0;
                        optionIndex < answers[i].length;
                        optionIndex = optionIndex + 1
                    ) {
                        if (answers[i][optionIndex]
                            && answers[i][optionIndex] !== ''
                            && typeof answers[i][optionIndex] === 'string'
                        ) {
                            const option = {
                                answer: answers[i][optionIndex],
                                position: optionIndex + 1
                            }
                            optionsDumpData.push(option)
                        }
                    }
                    questionDumpData.userFibInputAnswer = optionsDumpData
                } else if (questionType === arrange) {
                    const { arrangeOptions } = userQuizs[i].question
                    for (
                        let optionIndex = 0;
                        optionIndex < arrangeOptions.length;
                        optionIndex = optionIndex + 1
                    ) {
                        if (
                            !(answers[i][optionIndex] == null) &&
                            answers[i][optionIndex] !== ''
                        ) {
                            const index = parseInt(answers[i][optionIndex], 10)
                            const option = {
                                statement: arrangeOptions[index] && arrangeOptions[index].statement,
                                position: optionIndex + 1
                            }
                            optionsDumpData.push(option)
                        }
                    }
                    questionDumpData.userArrangeAnswer = optionsDumpData
                }
                quizDumpInput.quizQuestions.push(questionDumpData)
            } else {
                const questionDumpData = {
                    questionConnectId: userQuizs[i].question.id,
                    questionDisplayOrder: userQuizs[i].questionDisplayOrder,
                    isAttempted: false
                }
                quizDumpInput.quizQuestions.push(questionDumpData)
            }
        }
        
        const badgeInCache = filterKey(
            this.props.unlockBadge,
            `unlockBadge/quiz/${this.props.topicId}`
        )
        let badge
        // if ((!badgeInCache.size)) {
        //     const { getUnlockedUserBadge } = await fetchUnlockBadge(this.props.topicId, 'quiz')
        //     if (getUnlockedUserBadge && getUnlockedUserBadge.badge) {
        //         badge = getUnlockedUserBadge.badge
        //     }
        // }
        const quizDumpResponse = await dumpQuiz(
            navigationId,
            quizDumpInput,
            this.props.nextTopic && this.props.nextTopic.get('id')
        )

        // Updating mentor Mentee Session with quiz completed for session that started with path /homework/:topicId/quiz.
        const { path, params: { topicId, courseId } } = this.props.match
        const courseIdString = courseId ? '/:courseId' : ''
        if (path === `/homework${courseIdString}/:topicId/quiz`) {
            const { mentorMenteeSession } = this.props
            if (mentorMenteeSession && mentorMenteeSession.toJS().length > 0) {
                let sessionId = null
                mentorMenteeSession.toJS().forEach((session) => {
                    if (session.topicId === topicId) {
                        sessionId = session.id
                    }
                })
                if (sessionId) {
                    this.updateQuizSubmittedStatus(sessionId)
                } else {
                    mentorMenteeSessionAddOrDelete(this.props.userId, topicId, '', 'started', 'other', 
                        () => fetchMentorMenteeSession(null, null, this.props.userId,
                        'menteeTopicFilter', null, true, topicId).call())
                    
                }
            }
        }
        if (quizDumpResponse) {
            
            const isThisCurrentTopic =
                this.props.currentTopicComponentDetail.get('currentTopicId') === this.props.topicId
            const isQuizCurrentComponent = this.props.currentTopicComponent === 'quiz'
            if (isThisCurrentTopic && isQuizCurrentComponent) {
                const userTopicJourney = getFromLoadash(this.props.userTopicJourney.toJS(), '[0]', {})
                duck.merge(() => ({
                    currentTopicComponent: 'video',
                    currentTopicComponentDetail: {
                        componentTitle: this.props.nextTopic.get('videoTitle'),
                        currenttopic: this.props.nextTopic.get('id'),
                        topicTitle: this.props.nextTopic.get('title'),
                        topicStatus: 'complete',
                        thumbnail: this.props.nextTopic.get('videoThumbnail'),
                        percentageCovered: 0,
                        description: this.props.nextTopic.get('videoDescription')
                    },
                    userTopicJourney: {
                        ...userTopicJourney,
                        id: navigationId,
                        topicStatus: 'complete',
                        quiz: {
                            ...getFromLoadash(userTopicJourney, 'quiz', {}),
                            status: 'complete'
                        }
                    }
                }))
            }
            if (
                quizDumpResponse && quizDumpResponse.getQuizReport &&
                !isEmpty(quizDumpResponse.getQuizReport.firstQuizReport)
            ) {
                // const navigateAction = StackActions.reset({
                //     index: 1,
                //     actions: [
                //         NavigationActions.navigate({ routeName: 'bottomTab' }),
                //         NavigationActions.navigate({
                //             routeName: 'quizReports',
                //             params: {
                //                 topicId: navigationId,
                //                 nextTopic: this.props.nextTopic,
                //                 unlockBadge: badge,
                //                 displayBadge,
                //                 previousScreen: 'quiz'
                //             }
                //         })
                //     ]
                // })
                // this.props.navigation.dispatch(navigateAction)
            } else if (
                quizDumpResponse &&
                !isEmpty(getFromLoadash(quizDumpResponse, 'getQuizReport.latestQuizReport'))
            ) {
                // const navigateAction = StackActions.reset({
                //     index: 1,
                //     actions: [
                //         NavigationActions.navigate({ routeName: 'bottomTab' }),
                //         NavigationActions.navigate({
                //             routeName: 'quizReportSingle',
                //             params: {
                //                 topicId: navigationId,
                //                 nextTopic: this.props.nextTopic,
                //                 unlockBadge: badge,
                //                 displayBadge,
                //                 previousScreen: 'quiz'
                //             }
                //         })
                //     ]
                // })
                // this.props.navigation.dispatch(navigateAction)
            }
        }
        this.closeOverlay('visibleSubmitOverlay')
    }

    openOverlay = overlayName => {
        this.setState({ [overlayName]: true })
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

    setPrevAnswersInState = () => {
        const { userQuizAnswers } = this.props
        const { userQuizs } = this.props;
        let isQuizAnswered = false
        const prevAnswers = []
        let quizAnswers = []
        if (userQuizAnswers && userQuizAnswers.getIn([0, 'quizAnswers'])) {
            if (userQuizAnswers.getIn([0, 'quizAnswers']).toJS() && get(userQuizAnswers.getIn([0, 'quizAnswers']).toJS(), 'question.order')) {
                quizAnswers = userQuizAnswers.getIn([0, 'quizAnswers']).toJS() &&
                    getSortedQuizAnswers(sortBy(userQuizAnswers.getIn([0, 'quizAnswers']).toJS(), 'question.order'))
            } else {
                quizAnswers = userQuizAnswers.getIn([0, 'quizAnswers']).toJS() &&
                    getSortedQuizAnswers(sortBy(userQuizAnswers.getIn([0, 'quizAnswers']).toJS(), 'question.learningObjective.order'))
            }
            if (userQuizs && userQuizs.toJS() && quizAnswers) {
                sortBy(userQuizs.toJS(), 'questionDisplayOrder').forEach(el => {
                    const answer = quizAnswers.filter(ansEl => getFromLoadash(ansEl, 'question.id') === getFromLoadash(el, 'question.id') )[0]
                    if (answer && answer.isAttempted) {
                        const questionType = getFromLoadash(answer, 'question.questionType')
                        prevAnswers.push(getPrevAnswer(getOptions(answer, questionType), questionType))
                        isQuizAnswered = true
                    } else {
                        prevAnswers.push([])
                    }
                })
            }
            // quizAnswers && quizAnswers.forEach((answer, index) => {
            // })
        }
        if (isQuizAnswered) {
            this.setState({
                answers: prevAnswers,
                quizAnswers,
            })
        }
    }

    checkIfAttempted = (questionType, index) => {
        const { answers } = this.state
        const { userQuizs } = this.props
        if (
            questionType === 'mcq' ||
            questionType === 'fibBlock' ||
            questionType === 'fibInput'
        ) {
            if (this.checkIfFibOrMcqAttempted(index)) {
                return true
            } else {
                return false
            }
        } else if (questionType === 'arrange') {
            if (
                JSON.stringify(answers[index]) !==
                JSON.stringify([
                    ...Array(
                        userQuizs.getIn([index, 'question', 'arrangeOptions']).size
                    ).keys()
                ])
            ) {
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }

    /* function is used for fibinput ,fibblock  and mcq to
    check the user has attempted the question */
    checkIfFibOrMcqAttempted = index => {
        const { answers } = this.state
        for (let i = 0; i < answers[index].length; i = i + 1) {
            if (answers[index][i] && answers[index][i] !== '') {
                return true
            }
        }
        return false
    }

    shouldShowLoader = () => {
        const {
            mentorMenteeSessionFetchStatus,
            mentorMenteeSessionUpdateStatus,
            quizDumpStatus,
            badgeFetchStatus
        } = this.props
        let { params: { topicId } } = this.props.match
        const quizReportTopicId = this.getQuizReportId()
        topicId = quizReportTopicId ? quizReportTopicId : topicId
        return (
            (
                mentorMenteeSessionFetchStatus &&
                mentorMenteeSessionFetchStatus.getIn([`mentorMenteeSession/${topicId}`, 'loading'])
            ) ||
            (
                mentorMenteeSessionUpdateStatus &&
                mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'loading'])
            ) ||
            quizDumpStatus || (badgeFetchStatus && badgeFetchStatus.getIn(['loading']))
        )
    }

    checkIfAnsweredPreviously = (quizAnswers, currQuestionId) => {
        let isAnswered = false
        if (quizAnswers) {
           quizAnswers.forEach((answer) => {
               if (answer.question.id === currQuestionId && answer.isAttempted) {
                   isAnswered = true
               }
           })
        }
        return isAnswered
    }
    getActiveQuestion = () => {
        return parseInt(this.props.history.location.search.split('=')[1]) - 1
    }

    getHomeworkComponents = (sessionTopicId) => {
        let { topics } = this.props
        topics = (topics && topics.toJS()) || []
        const filteredTopic = topics.filter(topic => get(topic, 'id') === sessionTopicId)
        if (filteredTopic && filteredTopic.length) {
            const topicComponentRuleDoc = get(filteredTopic[0], 'topicComponentRule', [])
            const sortedTopicComponentRule = topicComponentRuleDoc.sort((a, b) => a.order > b.order)
            const currentTopicComponentIndex = sortedTopicComponentRule.findIndex(el => (get(el, 'componentName') === 'quiz'))
            const nextComponent = sortedTopicComponentRule[currentTopicComponentIndex+1]
            return nextComponent || null
        }
        return null
    }

    routeToNextTopicSession = () => {
        const courseId = get(this.props, 'match.params.courseId')
        const topicId = get(this.props, 'match.params.topicId')
        let firstComponent = this.props.location.state && this.props.location.state.firstComponent
        if (!firstComponent && localStorage.getItem('firstComponent')) firstComponent = getFirstComponentFromLocalStorage()
        const componentName = get(firstComponent, 'componentName', '')
        const childComponentName = get(firstComponent, 'childComponentName', null)
        if (componentName === 'blockBasedProject') {
            this.props.history.push(`sessions/project/${courseId}/${topicId}/${get(firstComponent, 'componentId')}`)
        } else if (componentName === 'blockBasedPractice') {
            this.props.history.push(`sessions/practice/${courseId}/${topicId}/${get(firstComponent, 'componentId')}`)
        } else if (componentName === 'learningObjective') {
            this.props.history.push(`sessions/${getLORedirectKey({ componentName: childComponentName })}/${courseId}/${topicId}/${get(firstComponent, 'componentId')}`)
        } else {
            if (get(firstComponent, 'componentId') !== this.props.match.params.topicId) {
                this.props.history.push(`/sessions/video/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId', null) || ''}`)
            } else {
                this.props.history.push(`/sessions/video/${courseId}/${this.props.match.params.topicId}`)
            }
        }
    }

    getFooterButtonTitle = (isSubmittedForReview, isCodingAssignmentExists, isHomeworkPracticeExists) => {
        if (!isSubmittedForReview && isMobile() && !isCodingAssignmentExists && !isHomeworkPracticeExists) {
            return 'Submit For Review'
        }
        if (isSubmittedForReview) {
            if (isCodingAssignmentExists) {
                return 'Go to Coding Assignment'
            } else if (isHomeworkPracticeExists) {
                return 'Go to Practice'
            } else if (!isCodingAssignmentExists && !isHomeworkPracticeExists) {
                return 'Back to Homework'
            } else {
                return 'Next'
            }
        }
        if (checkIfEmbedEnabled()) {
            if (!isCodingAssignmentExists && !isHomeworkPracticeExists) {
                return `Back to ${getEmbedData("backToPage")}`
            }
            return 'Next'
        }
        return 'Save Quiz'
    }

    onToggleButtonClick = () => {
        this.setState({ isSeeAnswers: !this.state.isSeeAnswers })
    }
    renderShowAnswerToggle = () => {
        const { isSeeAnswers } = this.state
        if (checkIfEmbedEnabled()) {
        const backToPage = getEmbedData('backToPage')
        if (backToPage !== backToPageConst.trainingResourcesAssessment) {
            return <div className='solutionToggleContainer'>
                <ShowSolutionToggle isSeeAnswers={isSeeAnswers} handleToggleClick={this.onToggleButtonClick} />
                </div>
        }
        } return null
    }

    render() {
        const { isSeeAnswers } = this.state
        const {
            mentorMenteeSession,
            match: { path },
            userQuizAnswersStatus,
            userQuizReportStatus,
            hasFetched
        } = this.props
        const { params: { topicId, courseId } } = this.props.match
        const quizReportTopicId = this.getQuizReportId()
        const courseIdString = courseId ? '/:courseId' : ''
        const homeworkComponents = this.getHomeworkComponents(quizReportTopicId || topicId)
        const isCodingAssignmentExists = (homeworkComponents && (get(homeworkComponents, 'componentName') === 'homeworkAssignment'))
        const isHomeworkPracticeExists = (homeworkComponents && (get(homeworkComponents, 'componentName') === 'homeworkPractice'))
        const session = filterKey(mentorMenteeSession, `mentorMenteeSession/${quizReportTopicId || topicId}`)
        const quizAnswers = getLastAttemptAnswers(this.props.userQuizAnswers, this.props.userQuizs)
        const isElectron = typeof window !== 'undefined' && window.native
        const isSubmittedForReview = session && session.getIn([0, 'isSubmittedForReview'])
        // To check if all the queries have been fetched.
        const isAnswerLoading =
            getFromLoadash(userQuizReportStatus, 'loading') || (userQuizAnswersStatus && getFromLoadash(
                userQuizAnswersStatus.toJS(), 
                `userQuizAnswers/${this.getLatestQuizReportId(this.props.userFirstAndLatestQuizReport)}.loading`
            ))

        let isAnswered = null
        let unansweredQuestionCount = 0
        if (!isAnswerLoading && hasFetched) {
            const { answers } = this.state
            // let answeredQuestionCount = 0
            isAnswered = this.props.userQuizs.map((quiz, index) => {
                if (quiz && getFromLoadash(answers, [index, 'length'])) {
                    const questionType = quiz.getIn(['question', 'questionType'])
                    if (this.checkIfAttempted(questionType, index)) {
                        // answeredQuestionCount++
                        return true
                    } else {
                        if (this.checkIfAnsweredPreviously(quizAnswers, quiz.getIn(['question', 'id']))) {
                            return true
                        }
                        unansweredQuestionCount++
                        return false
                    }
                } else {
                    if (this.checkIfAnsweredPreviously(quizAnswers, quiz.getIn(['question', 'id']))) {
                        return true
                    }
                    unansweredQuestionCount++
                    return false
                }
            })
        }
        return (
          <>
            {/* <UpdatedSideNavBar
              parent={quizReportTopicId ? 'sessions' : 'homework'}
              revisitRoute={this.props.match.path.includes("/revisit")}
              mobileNav
              computedMatch={this.props.computedMatch || this.props.match}
              pageTitle="Quiz"
              showSubmitOverlay={submitForReviewFn => this.submitForReview = submitForReviewFn}
            /> */}
            {(isAnswerLoading || !hasFetched) && (
              <Skeleton isMobile={isMobile()} />
            )}
            {/* <PreserveState
                state={this.state}
                setState={(state, callback = () => {}) => {
                    this.setState({
                        ...state,
                        fromSessionStorage: true,
                    },
                    callback)
                }}
                persistIf={id => {
                    return id === this.props.match.url
                }}
                key={this.props.match.url}
                saveIf={this.state.questionSelected}
                id={this.props.match.url}
                preserveScroll={['tk-route-container']}
            /> */}
            
            
            {(!isAnswerLoading && hasFetched) ? <span className='quiz-page-mixpanel-identifier' /> : null}
            {isAnswered && (
              <div
                className={styles.container}
                style={{ marginTop: `${isMobile() ? "50px" : ""}` }}
              >
                {isSubmittedForReview || quizReportTopicId ? (
                  <QuestionAreaReview
                    topicTitle={this.props.topic.title}
                    match={this.props.match}
                    openOverlay={this.openOverlay}
                    closeOverlay={this.closeOverlay}
                    isAnswered={isAnswered.toJS()}
                    answers={this.state.answers}
                    updateAnswers={this.updateAnswers}
                    visibleAbortOverlay={this.state.visibleAbortOverlay}
                    visibleSubmitOverlay={this.state.visibleSubmitOverlay}
                    numberOfQuestions={this.props.userQuizs.toJS().length}
                    userQuizs={quizAnswers || []}
                    changeQuestion={this.changeQuestion}
                    onBackButtonClick={this.onBackButtonClick}
                    activeQuestionIndex={this.state.questionSelected}
                    lastAttempAnswers={getLastAttemptAnswers(
                      this.props.userQuizAnswers, this.props.userQuizs
                    )}
                    path={this.props.match.path}
                    isMobile={isMobile()}
                    isSubmittedForReview={isSubmittedForReview}
                    renderComponent={this.renderShowAnswerToggle}
                  />
                ) : (
                  <QuestionArea
                    match={this.props.match}
                    topicTitle={this.props.topic.title}
                    openOverlay={this.openOverlay}
                    closeOverlay={this.closeOverlay}
                    isAnswered={isAnswered && isAnswered.toJS()}
                    answers={this.state.answers}
                    updateAnswers={this.updateAnswers}
                    visibleAbortOverlay={this.state.visibleAbortOverlay}
                    visibleSubmitOverlay={this.state.visibleSubmitOverlay}
                    numberOfQuestions={this.props.userQuizs.toJS().length}
                    userQuizs={this.props.userQuizs.toJS() ? sortBy(this.props.userQuizs.toJS(), 'questionDisplayOrder') : null}
                    changeQuestion={this.changeQuestion}
                    submitQuiz={this.onQuizSubmit}
                    onBackButtonClick={this.onBackButtonClick}
                    activeQuestionIndex={this.state.questionSelected}
                    lastAttempAnswers={getLastAttemptAnswers(
                      this.props.userQuizAnswers, this.props.userQuizs
                    )}
                    path={this.props.match.path}
                    isMobile={isMobile()}
                    isSubmittedForReview={isSubmittedForReview}
                    isSeeAnswers={isSeeAnswers}
                    isHomeWork={true}
                    componentType={HOMEWORK_COMPONENTS_CONFIG.quiz}
                    answerType={isSeeAnswers ? "RS" : undefined}
                    renderComponent={this.renderShowAnswerToggle}
                  />
                )}
                <NextFooter
                    match={this.props.match}
                    footerFrom={'quiz'}
                    nextItem={() => {
                        this.setState({ questionSelected: this.state.questionSelected + 1 })
                    }}
                    lastItem={this.state.questionSelected  === this.state.answers.length - 1 }
                    classwork={false}
                
                ></NextFooter>
              </div>
            )}
          </>
        );
    }
}
