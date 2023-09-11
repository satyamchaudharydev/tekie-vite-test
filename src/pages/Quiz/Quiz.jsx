import React from 'react'
import {isEmpty, get as getFromLoadash, sortBy} from 'lodash'
import fetchQuizQuestions from '../../queries/fetchQuizQuestions'
import styles from './Quiz.module.scss'
import dumpQuiz from '../../queries/dumpQuiz'
import fetchUnlockBadge from '../../queries/fetchUnlockBadge'
import { filterKey } from '../../utils/data-utils'
import duck from '../../duck'
import QuestionArea from './components/QuestionArea'
import Footer from './components/Footer'
import SubmitOverlayMenu from './components/SubmitOverlayMenu'
import Skeleton from '../../components/QuestionTypes/Skeleton'
import fetchMentorMenteeSession from '../../queries/sessions/fetchMentorMenteeSession'
import updateMentorMenteeSession from '../../queries/sessions/updateMentorMenteeSession'
import fetchQuizReport from '../../queries/fetchQuizReport'
import fetchQuizAnswers from '../../queries/fetchQuizAnswers'
import getSortedQuizAnswers from '../../utils/getSortedQuizAnswers'
import {ARRANGE, FIBBLOCK, FIBINPUT, MCQ} from "../Practice/constants";
import IntroductionMastery from './components/IntroductionMastery'
import { motion } from 'framer-motion'
import { get } from 'immutable'
import mentorMenteeSessionAddOrDelete from '../../utils/mmSessionAddOrDelete'


const fibBlock = 'fibBlock'
const arrange = 'arrange'
const fibInput = 'fibInput'
const mcq = 'mcq'

export default class QuizRoot extends React.Component {
    state = {
        questionSelected: 0,
        questionLength: 6,
        visibleSubmitOverlay: false,
        visibleAbortOverlay: false,
        answers: [],
        isQuizDumpLoading: false,
        infoVisible: false,
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
        if (
            this.props.hasFetched !== prevProps.hasFetched &&
            this.props.userQuizs
        ) {
            if (this.state.answers.length === 0) {
                this.setAnswer()
            }
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
                if (!mentorMenteeSession.getIn([0, 'isAssignmentSubmitted'])) {
                    if (courseId) {
                        this.props.history.push(`/homework/${courseId}/${topicId}/codingAssignment`)
                    } else {
                        this.props.history.push(`/homework/${topicId}/codingAssignment`)
                    }
                }
            }
        }
        if (
            this.props.userQuizReportStatus && this.props.userQuizReportStatus.success &&
            !(prevProps.userQuizReportStatus && prevProps.userQuizReportStatus.success)
        ) {
            const quizReportId = this.getLatestQuizReportId(this.props.userFirstAndLatestQuizReport)
            if (quizReportId && quizReportId.length > 0) {
                await fetchQuizAnswers(quizReportId, null, true).call()
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
       await fetchQuizReport(this.props.match.params.topicId).call()
       const navigationId = this.props.topicId
       const courseId = this.props.courseId
       mentorMenteeSessionAddOrDelete(this.props.userId, this.props.topicId, '', 'started', 'other', 
       () => fetchMentorMenteeSession(
            null, null, this.props.userId,'menteeTopicFilter', null,true, this.props.topicId
        ).call())
       const { path } = this.props.match
       const courseIdString = courseId ? '/:courseId' : ''
        if (path === `/homework${courseIdString}/:topicId/quiz`) {
            const { topicId } = this.props.match.params
            if(!this.props.hasFetched) {
                await fetchQuizQuestions(this.props.userId, topicId, courseId)
            } else if (this.state.answers.length === 0) {
                this.setAnswer()
            }
        } else {
            if(!this.props.hasFetched) {
                await fetchQuizQuestions(this.props.userId, navigationId, courseId)
            } else if (this.state.answers.length === 0) {
                this.setAnswer()
            }
        }

        const isThisCurrentTopic =
            this.props.currentTopicComponentDetail.get('currentTopicId') === this.props.topicId
        const isQuizCurrentComponent = this.props.currentTopicComponent === 'quiz'
        if (isThisCurrentTopic && isQuizCurrentComponent) {
            // this.setState({ infoVisible: true })
        }
    }

    changeQuestion = questionNumber => {
        this.setState({
            questionSelected: questionNumber
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
        const userQuizs = this.props.userQuizs.toJS()
        const { answers } = this.state
        const quizDumpInput = { topicId: navigationId, quizQuestions: [] }
        for (let i = 0; i < userQuizs.length; i = i + 1) {
            const { questionType } = userQuizs[i].question
            if (
                answers[i] &&
                answers[i].length !== 0 &&
                this.checkIfAttepted(questionType, i)
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
                        if (answers[i][optionIndex] && answers[i][optionIndex] !== '') {
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
                    mentorMenteeSessionAddOrDelete(this.props.userId, this.props.topicId, '', 'started', 'other', 
                        () => fetchMentorMenteeSession(null, null, this.props.userId,
                        'menteeTopicFilter', null, true, topicId).call())
                    
                }
            }
        }
        if (quizDumpResponse) {
            if (this.props.match.path === `/revisit/homework${courseIdString}/:topicId/quiz`) {
                if (courseId) {
                    this.props.history.push(`/revisit/homework/${courseId}/${navigationId}/codingAssignment`,{
                      unlockBadge:badge
                    })
                } else {
                    this.props.history.push(`/revisit/homework/${navigationId}/codingAssignment`,{
                      unlockBadge:badge
                    })
                }
            } else if (this.props.match.path !== `/homework${courseIdString}/:topicId/quiz`) {
                this.props.history.push(`/quiz-report-latest/${navigationId}`, {
                  unlockBadge:badge
                })
            }
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

    getOptions = (answer, questionType) => {
        switch (questionType) {
            case MCQ:
                return getFromLoadash(answer, 'userMcqAnswer')
            case FIBBLOCK:
                return getFromLoadash(answer, 'userFibBlockAnswer')
            case FIBINPUT:
                return getFromLoadash(answer, 'userFibInputAnswer')
            case ARRANGE:
                return getFromLoadash(answer, 'userArrangeAnswer')
            default: 
                return null
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

    getPrevAnswer = (options, questionType) => {
        const answer = []
        switch (questionType) {
            case MCQ:
                options.forEach((option) => {
                    if (option.isSelected) {
                        answer.push(true)
                    } else {
                        answer.push(false)
                    }
                })
                break
            case FIBBLOCK:
                let modOptions = sortBy(options, 'position')
                const positionsIncluded = []
                modOptions.forEach((option) => {
                    if (!positionsIncluded.includes(get(option, 'position'))) {
                        answer.push(option.statement)
                        positionsIncluded.push(get(option, 'position'))
                    }
                })
                break
            case FIBINPUT:
                modOptions = sortBy(options, 'position')
                modOptions.forEach((option) => {
                    answer.push(option.answer)
                })
                break
            case ARRANGE:
                options.forEach((option, index) => option.index = index)
                const sortedOptions = sortBy(options, 'position')
                sortedOptions.forEach(option => {
                    answer.push(getFromLoadash(option, 'index'))
                })
                break
            default: 
                return null
        }

        return answer
    }

    setPrevAnswersInState = () => {
        const { userQuizAnswers } = this.props
        let isQuizAnswered = false
        const prevAnswers = []
        if (userQuizAnswers && userQuizAnswers.getIn([0, 'quizAnswers'])) {
            const quizAnswers = userQuizAnswers.getIn([0, 'quizAnswers']).toJS() &&
                getSortedQuizAnswers(sortBy(userQuizAnswers.getIn([0, 'quizAnswers']).toJS(), 'question.learningObjective.order'))
            quizAnswers && quizAnswers.forEach((answer, index) => {
                if (answer.isAttempted) {
                    const questionType = getFromLoadash(answer, 'question.questionType')
                    prevAnswers.push(this.getPrevAnswer(this.getOptions(answer, questionType), questionType))
                    isQuizAnswered = true
                } else {
                    prevAnswers.push([])
                }
            })
        }
        if (isQuizAnswered) {
            this.setState({
                answers: prevAnswers
            })
        }
    }

    checkIfAttepted = (questionType, index) => {
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
        const { params: { topicId } } = this.props.match
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

    getLastAttemptAnswers = (userQuizAnswers) => {
        if (userQuizAnswers && userQuizAnswers.toJS().length > 0) {
            const quizAnswers =  userQuizAnswers.getIn([0, 'quizAnswers'])
            return getSortedQuizAnswers(sortBy(quizAnswers.toJS(), 'question.learningObjective.order'))
        }
        return []
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

    render() {
        const { visibleSubmitOverlay } = this.state
        const {
            mentorMenteeSession,
            match: { path },
            userQuizAnswersStatus,
            userQuizReportStatus,
            hasFetched
        } = this.props
        const { params: { topicId, courseId } } = this.props.match
        const courseIdString = courseId ? '/:courseId' : ''
        const session = filterKey(mentorMenteeSession, `mentorMenteeSession/${topicId}`)
        const quizAnswers = this.getLastAttemptAnswers(this.props.userQuizAnswers)
        const isSubmittedForReview = session && session.getIn([0, 'isSubmittedForReview'])
        
        // To check if all the queries have been fetched.
        const isAnswerLoading =
            getFromLoadash(userQuizReportStatus, 'loading') || (userQuizAnswersStatus && getFromLoadash(
                userQuizAnswersStatus.toJS(),
                `userQuizAnswers/${this.getLatestQuizReportId(this.props.userFirstAndLatestQuizReport)}.loading`
            ))
        if (!isAnswerLoading && hasFetched) {
            const { answers } = this.state
            let unansweredQuestionCount = 0
            // let answeredQuestionCount = 0
            const isAnswered = this.props.userQuizs.map((quiz, index) => {
                if (quiz && getFromLoadash(answers, [index, 'length'])) {
                    const questionType = quiz.getIn(['question', 'questionType'])
                    if (this.checkIfAttepted(questionType, index)) {
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
            return (
                <>
                <div className={styles.absoluteContainer}>
                    <motion.div className={styles.infoContainer} whileHover={{
                        opacity: 0.6,
                    }} onClick={() => { this.setState({ infoVisible: true }) }}>
                        <div className={styles.infoWrapper}>
                            <svg className={styles.infoSvg} width={'110%'} height={'110%'} viewBox="0 0 19.377 19.379">
                                <path
                                    d="M9.689 0a9.689 9.689 0 109.689 9.689A9.7 9.7 0 009.689 0zm.63 15.438c-.46.077-1.376.268-1.841.307a1.134 1.134 0 01-.992-.516 1.211 1.211 0 01-.147-1.109l1.832-5.036h-1.9a2.276 2.276 0 011.788-2.117 7.011 7.011 0 011.841-.305 1.46 1.46 0 01.992.516 1.211 1.211 0 01.147 1.109l-1.831 5.036h1.9a2.144 2.144 0 01-1.791 2.115zm.581-9.382a1.211 1.211 0 111.211-1.211A1.211 1.211 0 0110.9 6.056z"
                                    fill="#fcffff"
                                />
                            </svg>

                        </div>
                    </motion.div>
                </div>
                <IntroductionMastery close={() => { this.setState({ infoVisible: false }) }} visible={this.state.infoVisible} />
                <div className={styles.container}>
                    <QuestionArea
                        topicTitle={this.props.topic.title}
                        openOverlay={this.openOverlay}
                        closeOverlay={this.closeOverlay}
                        isAnswered={isAnswered.toJS()}
                        answers={this.state.answers}
                        updateAnswers={this.updateAnswers}
                        visibleAbortOverlay={this.state.visibleAbortOverlay}
                        visibleSubmitOverlay={this.state.visibleSubmitOverlay}
                        numberOfQuestions={this.props.userQuizs.toJS().length}
                        userQuizs={this.props.userQuizs.toJS()}
                        changeQuestion={this.changeQuestion}
                        onBackButtonClick={this.onBackButtonClick}
                        activeQuestionIndex={this.state.questionSelected}
                        lastAttempAnswers={this.getLastAttemptAnswers(this.props.userQuizAnswers)}
                        path={this.props.match.path}
                        isSubmittedForReview={isSubmittedForReview}
                    />
                    {
                        !isSubmittedForReview
                            ? (
                                <div>
                                    <SubmitOverlayMenu
                                        title={
                                            (path === `/homework${courseIdString}/:topicId/quiz` || `/revisit/homework${courseIdString}/:topicId/quiz`)
                                                ? 'Save'
                                                : 'Submit'
                                        }
                                        visible={visibleSubmitOverlay}
                                        onQuizSubmit={this.onQuizSubmit}
                                        quizDumpStatus={this.props.quizDumpStatus}
                                        message={`Are you sure you want to submit the quiz? ${unansweredQuestionCount > 0 ? `You still have ${unansweredQuestionCount}/${this.props.userQuizs.size} questions left` : ''}`}
                                        closeOverlay={this.closeOverlay}
                                        isLoading={this.shouldShowLoader()}
                                        path={path}
                                    />
                                    <Footer
                                        openOverlay={this.openOverlay}
                                        activeQuestionIndex={this.state.questionSelected}
                                        onQuizSubmit={() => this.setState({
                                            visibleSubmitOverlay: true
                                        })}
                                        changeQuestion={this.changeQuestion}
                                        numberOfQuestions={this.props.userQuizs.toJS().length}
                                        unansweredQuestionCount={unansweredQuestionCount}
                                        path={this.props.match && this.props.match.path}
                                    />
                                </div>
                            ) :
                            (
                                <div />
                            )
                    }
                </div>
                </>)
        } else {
            return (
                <div >
                    <Skeleton />
                </div>
            )
        }
    }
}
