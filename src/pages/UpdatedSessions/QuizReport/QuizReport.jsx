/* eslint-disable */
import React, { Component } from 'react'
import cx from 'classnames'
import { get, round } from 'lodash'
import { List, Map } from 'immutable'
import Lottie from 'react-lottie'
import styles from './QuizReport.module.scss'
import ResultTube from './components/ResultTube'
import fetchMentorMenteeSession from '../../../queries/sessions/fetchMentorMenteeSession'
import dumpBlockBasedPractice from '../../../queries/dumpBlockBasedPractice'
import fetchQuizReport from '../../../queries/fetchQuizReport'
import MasteryTube from './components/MasteryTube'
import Breakdown from './components/Breakdown'
import getPath from '../../../utils/getPath'
import BadgeModal from '../../Achievements/BadgeModal'
import fetchTopics from '../../../queries/sessions/fetchTopic'
import dumpQuiz from "../../../queries/dumpQuiz";
import dumpCodingAssignment from '../../../queries/dumpCodingAssignment'
import fetchTopicJourney from "../../../queries/fetchTopicJourney"
import { filterKey } from '../../../utils/data-utils'
import PopUp from '../../../components/PopUp/PopUp'
import { hs } from "../../../utils/size";
import SimpleButtonLoader from "../../../components/SimpleButtonLoader";
import { NextButton } from '../../../components/Buttons'
import { getFirstComponentFromLocalStorage, getLORedirectKey, getPreviousTopicIdFromLocalStorage } from '../utils'
import ContentLoader from 'react-content-loader'
import getMasteryLabel from '../../../utils/getMasteryLabels'
import footerStyles from '../Quiz/components/Footer/Footer.module.scss'
import isMobile from '../../../utils/isMobile'
import UpdatedSideNavBar from '../../../components/UpdatedSideNavBar'
import { ReportsContainer, TitleContainer } from './components/reportContainers'
import mentorMenteeSessionAddOrDelete from '../../../utils/mmSessionAddOrDelete'
import { CorrectCheck, NotYetStartedSvg } from './assets/quizReportSvgs'
import UpdatedButton from '../../../components/Buttons/UpdatedButton/UpdatedButton'
import { ArrowForward } from '../../../constants/icons'
import fetchUserAssignment from '../../../queries/fetchUserAssignment'
import fetchBlockBasedPractice from '../../../queries/fetchBlockBasedPractice'
import fetchCurrentTopic from '../../../queries/sessions/fetchCurrentTopic'
import getCourseId from '../../../utils/getCourseId'
import CelebrationLottie from './components/celebration.json'
import NextFooter from '../../../components/NextFooter'

export const masteryLevels = ['none', 'familiar', 'master', 'proficient']

const celebrationLottieOptions = {
    loop: false,
    autoplay: true,
    animationData: CelebrationLottie,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet'
    }
}

export default class QuizReport extends Component {
    state = {
        animateResultTube: false,
        startAnimation: false,
        totalFill: 1,
        correctFill: 0,
        incorrectFill: 0,
        unansweredFill: 0,
        hasFetched: 0,
        isBadgeModalVisible: this.props.location.state && this.props.location.state.unlockBadge,
        isQuizFetched: false,
        totoalCodingQuestions: 0,
        attemptedCodingQuestions: 0,
        totalHomeworkPracticeQuestion: 0,
        attemptedHomeworkPracticeQuestion: 0,
        topicComponents: [],
        isHomeworkReportFetching: true,
        showLottie: false
    }

    async componentDidMount() {
        const { userId, topic, currentTopic } = this.props
        let reportType = ''
        let topicId = this.props.match.params.topicId
        let courseId = this.props.match.params.courseId
        const quizReportTopicId = ((this.props.location.state && this.props.location.state.quizReportTopicId) || getPreviousTopicIdFromLocalStorage())
    
        const firstComponent = (this.props.location.state && this.props.location.state.firstComponent)
        if (quizReportTopicId) {
            topicId = quizReportTopicId
            localStorage.setItem('previousTopicId', quizReportTopicId)
            localStorage.setItem('firstComponent', JSON.stringify(firstComponent))
        }
        mentorMenteeSessionAddOrDelete(this.props.userId, topicId, '', 'started', 'other',
            () => fetchMentorMenteeSession(
                null, null, this.props.userId, 'menteeTopicFilter', null, true, topicId
            ).call())
        const courseIdString = courseId ? '/:courseId' : ''
        if (get(this, 'props.match.path') === `/sessions/quiz-report-latest${courseIdString}/:topicId`) {
            reportType = 'latestQuizReport'
            topicId = this.props.location.state && this.props.location.state.quizReportTopicId
        } else {
            reportType = get(this, 'props.match.path') === `/quiz-report-latest${courseIdString}/:topicId`
                ? 'latestQuizReport'
                : 'firstQuizReport'
        }
        await fetchTopics().call()
        const filteredQuizReportTopic = topic && topic.toJS().length > 0 && topic.toJS().filter(item => get(item, 'id') === topicId && get(item, 'topicComponentRule', []).length > 0)
        let topicComponent = []
        if (!filteredQuizReportTopic.length) {
            await fetchCurrentTopic(topicId).call()
            .then(res => {
                topicComponent = get(res, 'topic.topicComponentRule', [])
            })
        } else {
            topicComponent = get(filteredQuizReportTopic[0], 'topicComponentRule', [])
        }
        const homeworkPracticeTopicComponent = topicComponent.length > 0 && topicComponent.filter(item => get(item , 'componentName') === 'homeworkPractice')
        const quizTopicComponent = topicComponent.length > 0 && topicComponent.filter(item => get(item , 'componentName') === 'quiz')
        const homeworkAssignmentTopicComponent = topicComponent.length > 0 && topicComponent.filter(item => get(item , 'componentName') === 'homeworkAssignment')
        if (homeworkPracticeTopicComponent.length > 0) {
            await fetchBlockBasedPractice(userId, null, courseId, null, true, topicId).call()
            .then((res) => {
                const userBlockBasedPractices = get(res, 'userBlockBasedPractices')
                if (userBlockBasedPractices && userBlockBasedPractices.length > 0) {
                    const isHomeworkInBlockBasesPractice = userBlockBasedPractices.filter(item => get(item, 'blockBasedPractice.isHomework') === true)
                    const filteredHomeworkPracticeQuestion = isHomeworkInBlockBasesPractice.filter(item => (!get(item, 'blockBasedPractice.isSubmitAnswer') || (get(item , 'savedBlocks') !== null || get(item, 'answerLink') !== null) ))
                    this.setState({ attemptedHomeworkPracticeQuestion: filteredHomeworkPracticeQuestion.length })
                }
            });
        }
        if (quizTopicComponent.length > 0) {
            await fetchQuizReport(topicId, courseId).call()
        }
        if (homeworkAssignmentTopicComponent.length > 0) {
            await fetchUserAssignment(userId, topicId, 'published', 'withMenteeToken', true, courseId).call()
        }
        this.setState({ 
            totalHomeworkPracticeQuestion: homeworkPracticeTopicComponent.length,
            topicComponents: topicComponent
        })

        const { mentorMenteeSession } = this.props
        const session = filterKey(mentorMenteeSession, `mentorMenteeSession/${topicId}`)
        if (
            session &&
            session.getIn([0, 'id']) &&
            !session.getIn([0, 'isSubmittedForReview'])
        ) {
            // if (!session.getIn([0, 'isQuizSubmitted']) || !session.getIn([0, 'isAssignmentSubmitted']) || !session.getIn([0, 'isPracticeSubmitted'])) {
            //     await this.autoSubmitQuiz()
            // }
            const firstComponent = this.props.location.state && this.props.location.state.firstComponent
            // await fetchTopicJourney(this.props.match.params.topicId, true, courseId).call()
            // const componentName = get(firstComponent, 'componentName', null)
            // const childComponentName = get(firstComponent, 'childComponentName', null)
            // setTimeout(() => {
            //     if (componentName === 'blockBasedProject') {
            //         this.props.history.push(`/sessions/project/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId')}`)
            //         return null
            //     } else if (componentName === 'blockBasedPractice') {
            //         this.props.history.push(`/sessions/practice/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId')}`)
            //         return null
            //     } else if (componentName === 'learningObjective') {
            //         this.props.history.push(`/sessions/${getLORedirectKey({ componentName: childComponentName })}/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId')}`)
            //         return null
            //     }
            //     if (get(firstComponent, 'componentId') !== this.props.match.params.topicId) {
            //         this.props.history.push(`/sessions/video/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId', '')}`)
            //     } else {
            //         this.props.history.push(`/sessions/video/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId', '')}`)
            //     }
            // }, 1000)
        }
        this.setState({ isHomeworkReportFetching: false })
        setTimeout(async () => {
            this.setState({
                showLottie: true
            })
        }, 1000)
    }

    autoSubmitQuiz = async () => {
        let topicId = this.props.match.params.topicId
        let courseId = this.props.match.params.courseId
        const { mentorMenteeSession } = this.props
        const quizReportTopicId = (this.props.location.state && this.props.location.state.quizReportTopicId) || getPreviousTopicIdFromLocalStorage()
        if (quizReportTopicId) {
            topicId = quizReportTopicId
        }
        const session = filterKey(mentorMenteeSession, `mentorMenteeSession/${topicId}`)
        let { topic } = this.props
        topic = topic && topic.toJS() || []
        let componentRule = []
        const filteredTopic = topic.filter(topicData => get(topicData, 'id') === session.getIn([0, 'topic', 'id']))
        if (filteredTopic && filteredTopic.length) {
            const topicComponentRuleDoc = get(filteredTopic[0], 'topicComponentRule', [])
            const sortedTopicComponentRule = topicComponentRuleDoc.sort((a, b) => a.order > b.order && 1 || -1)
            componentRule = sortedTopicComponentRule.filter(el => (get(el, 'componentName') === 'homeworkAssignment') || (get(el, 'componentName') === 'quiz') || (get(el, 'componentName') === 'homeworkPractice'))
        }
        if (componentRule && componentRule.length) {
            const lastComponent = componentRule[componentRule.length - 1]
            if (get(lastComponent, 'componentName') === 'homeworkAssignment') {
                if (!this.state.isQuizFetched) {
                    this.setState({
                        isQuizFetched: true
                    })
                    const res = await dumpCodingAssignment(
                        this.props.userId,
                        topicId,
                        {
                            assignmentQuestions: [],
                            assignmentAction: 'next',
                            isHomework: true
                        },
                        'withMenteeToken',
                        true,
                        courseId
                    ).call()
                    if (res) {
                        await fetchTopicJourney(this.props.match.params.topicId, true, courseId).call()
                    }
                }
            } else if (get(lastComponent, 'componentName') === 'homeworkPractice') {
                this.setState({
                    isQuizFetched: true
                })
                const res = await dumpBlockBasedPractice(
                    this.props.userId,
                    topicId,
                    get(lastComponent, 'blockBasedProject.id'),
                    courseId,
                    {
                        blockBasedPracticeAction: 'next',
                        answerLink: '',
                        isHomework: true,
                    },
                ).call()
                if (res) {
                    await fetchTopicJourney(this.props.match.params.topicId, true, courseId).call()
                }
            } else {
                await this.quizDump()
            }
        }
        return true
    }

    async componentDidUpdate(prevProps) {
        const { quizReportFetchStatus, quizReportFetchErrors, studentProfile, userAssignment, userAssignmentStatus } = this.props
        let courseId = this.props.match.params.courseId
        const courseIdString = courseId ? '/:courseId' : ''
        const reportType = ((get(this, 'props.match.path') === `/sessions/quiz-report-latest${courseIdString}/:topicId`) ||
            (get(this, 'props.match.path') === `/quiz-report-latest${courseIdString}/:topicId`))
            ? 'latestQuizReport'
            : 'firstQuizReport'
        if (quizReportFetchStatus && prevProps.quizReportFetchStatus) {
            if (quizReportFetchStatus.getIn(['success']) && !prevProps.quizReportFetchStatus.getIn(['success'])) {
                const topicInfo = this.props.topic.find(topic =>
                topic.get('id') === this.props.userFirstAndLatestQuizReport.getIn([0, 'topic', 'id'])
                ) || Map({})
                const totalQuestions = (get(topicInfo.toJS(), 'topicQuestions') || []).length
                const unansweredQuesitons = !this.props.userFirstAndLatestQuizReport.getIn([0, reportType, 'quizReport']) ? totalQuestions : 0
                this.setState({
                    totalFill: this.props.userFirstAndLatestQuizReport.getIn([0, reportType, 'quizReport', 'totalQuestionCount']) || totalQuestions, 
                    correctFill: this.props.userFirstAndLatestQuizReport.getIn([0, reportType, 'quizReport', 'correctQuestionCount']) || 0,
                    incorrectFill: this.props.userFirstAndLatestQuizReport.getIn([0, reportType, 'quizReport', 'inCorrectQuestionCount']) || 0,
                    unansweredFill: this.props.userFirstAndLatestQuizReport.getIn([0, reportType, 'quizReport', 'unansweredQuestionCount']) || unansweredQuesitons,
                    userReport: this.props.userFirstAndLatestQuizReport.getIn([0, reportType]) && this.props.userFirstAndLatestQuizReport.getIn([0, reportType]).toJS()
                })
            }
            // if (quizReportFetchStatus.getIn(['failure']) && !prevProps.quizReportFetchStatus.getIn(['failure'])) {
            //     const error = quizReportFetchErrors && get(quizReportFetchErrors.toJS().pop(), 'error.errors.0.code')
            //     const isBatchSession = studentProfile
            //         ? get(studentProfile.toJS(), '0.batch.id') &&
            //         (
            //             get(studentProfile.toJS(), '0.batch.type') === 'b2b' ||
            //             get(studentProfile.toJS(), '0.batch.type') === 'b2b2c'
            //         )
            //         : false
            //     if (error === 'ComponentLockedError' && !isBatchSession) {
            //         this.autoSubmitQuiz()
            //     }
            // }
        }
        if (userAssignmentStatus !== prevProps.userAssignmentStatus) {
            const isLoading = userAssignmentStatus && userAssignmentStatus.getIn(['loading'])
            if (userAssignment.getIn([0]) && userAssignment.getIn([0]).toJS()['assignment'] && !isLoading) {
                const fetchedAssignmentQuestions = userAssignment && userAssignment.toJS()
                if (fetchedAssignmentQuestions.length > 0) {
                    const allAssignmentQuestions = get(fetchedAssignmentQuestions[0], 'assignment').length > 0 && get(fetchedAssignmentQuestions[0], 'assignment').filter(item => get(item, 'assignmentQuestion.isHomework') === true)
                    const attemptedCodingQuestions = allAssignmentQuestions && allAssignmentQuestions.filter(item => (item.userAnswerCodeSnippet !== '' && item.userAnswerCodeSnippet !== null))
                    this.setState({
                        totoalCodingQuestions: allAssignmentQuestions.length,
                        attemptedCodingQuestions: attemptedCodingQuestions.length
                    })
                }
            }
        }
    }

    quizDump = async () => {
        const prevTopicId = (this.props.location.state && this.props.location.state.quizReportTopicId) || getPreviousTopicIdFromLocalStorage()
        const currTopicId = this.props.match.params.topicId
        const courseId = this.props.match.params.courseId
        const quizDumpInput = { topicId: prevTopicId, quizQuestions: [], courseId: this.props.match.params.courseId }
        if (!this.state.isQuizFetched) {
            await this.setState({
                isQuizFetched: true
            })
            const res = await dumpQuiz(
                prevTopicId,
                quizDumpInput,
                currTopicId
            )
            if (res) {
                await fetchTopicJourney(currTopicId, true, courseId).call()
            }
        }
    }

    closeBadgeModal = () => {
        this.setState({
            isBadgeModalVisible: false
        })
    }

    showLoader = () => {
        const { quizDumpStatus, userTopicJourneyStatus, codingDumpStatus } = this.props
        return (
            ((quizDumpStatus && quizDumpStatus.getIn(['loading'])) || (codingDumpStatus && codingDumpStatus.getIn(['loading']))) || (userTopicJourneyStatus && userTopicJourneyStatus.getIn(['loading']))
        ) && this.state.isQuizFetched
    }

    getHomeworkComponents = () => {
        const { topicComponents } = this.state
        let sortedTopicComponentRule = []
        sortedTopicComponentRule = topicComponents.length > 0 && topicComponents.sort((a, b) => a.order > b.order && 1 || -1)
        return sortedTopicComponentRule.length > 0 ? sortedTopicComponentRule.filter(el => ['homeworkAssignment', 'quiz', 'homeworkPractice'].includes(get(el, 'componentName'))) : []
    }

    getTopicComponents = () => {
        const { topicComponents } = this.state
        let sortedTopicComponentRule = []
        sortedTopicComponentRule = topicComponents.length > 0 && topicComponents.sort((a, b) => a.order > b.order && 1 || -1)
        return sortedTopicComponentRule
    }

    routeToNextTopicSession = () => {
        const courseId = get(this.props, 'match.params.courseId')
        const topicId = get(this.props, 'match.params.topicId')
        const firstComponent = (this.props.location.state && this.props.location.state.firstComponent) || getFirstComponentFromLocalStorage()
        const componentName = get(firstComponent, 'componentName', '')
        const childComponentName = get(firstComponent, 'childComponentName', null)
        if (componentName === 'blockBasedProject') {
            this.props.history.push(`/sessions/project/${courseId}/${topicId}/${get(firstComponent, 'componentId')}`)
        } else if (componentName === 'blockBasedPractice') {
            this.props.history.push(`/sessions/practice/${courseId}/${topicId}/${get(firstComponent, 'componentId')}`)
        } else if (componentName === 'learningObjective') {
            this.props.history.push(`/sessions/${getLORedirectKey({ componentName: childComponentName })}/${courseId}/${topicId}/${get(firstComponent, 'componentId')}`)
        } else {
            if (get(firstComponent, 'componentId') !== this.props.match.params.topicId) {
                this.props.history.push(`/sessions/video/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId', null) || ''}`)
            } else {
                this.props.history.push(`/sessions/video/${courseId}/${this.props.match.params.topicId}`)
            }
        }
    }

    routeToNextTopicSessionText = (filteredTopic) => {
        const firstComponent = (this.props.location.state && this.props.location.state.firstComponent) || getFirstComponentFromLocalStorage()
        const componentName = get(firstComponent, 'componentName', '')
        const childComponentName = get(firstComponent, 'childComponentName', null)
        if (componentName === 'video') {
            return 'Video'
        } else if (componentName === 'blockBasedPractice') {
            return 'Practice'
        } else if (componentName === 'blockBasedProject') {
            return 'Project'
        } else if (componentName === 'assignment') {
            return 'Coding'
        } else if (componentName === 'learningObjective') {
            const result = getLORedirectKey({ componentName: childComponentName })
            if (result === 'practice-quiz') {
                return 'Practice Quiz'
            } else if (result === 'chat') {
                return 'Chat'
            } else if (result === 'comic-strip') {
                return 'Comic Strip'
            } else if (result === 'learning-slides') {
                return 'Learning Slides'
            } else {
                return filteredTopic
            }
        } else {
            return filteredTopic
        }
    }

    getDoughnutData = (components) => {
        const { totalFill, correctFill, incorrectFill, attemptedCodingQuestions, totoalCodingQuestions, totalHomeworkPracticeQuestion, attemptedHomeworkPracticeQuestion } = this.state
        let leftSum = 0, rightSum = 0
        components.length > 0 && components.forEach(item => {
            if (get(item, 'componentName') === 'quiz') {
                leftSum = leftSum + correctFill + incorrectFill
                rightSum += totalFill
            }
            if (get(item, 'componentName') === 'homeworkAssignment') {
                leftSum += attemptedCodingQuestions
                rightSum += totoalCodingQuestions
            }
        })
        if (totalHomeworkPracticeQuestion > 0) {
            leftSum += attemptedHomeworkPracticeQuestion
            rightSum += totalHomeworkPracticeQuestion
        }
        return [leftSum, rightSum]
    }

    renderQuestionsStats = (component) => {
        const { totalFill, correctFill, incorrectFill, attemptedCodingQuestions, totoalCodingQuestions } = this.state
        switch (component.componentName) {
            case 'quiz':
                return (
                    `${correctFill + incorrectFill}/${totalFill}`
                )
            case 'homeworkAssignment':
                return (
                    `${attemptedCodingQuestions}/${totoalCodingQuestions}`
                )
        }
    }

    renderName = (name) => {
        const { totalFill, correctFill, incorrectFill, attemptedCodingQuestions, totoalCodingQuestions } = this.state
        if (name === 'quiz') {
            return <h4 style={{ color: (totalFill && (totalFill == correctFill + incorrectFill)) ? '#005773' : '#C3313E' }}>Quiz</h4>
        }
        if (name === 'homeworkAssignment') {
            return <h4 style={{ color: (totoalCodingQuestions && (totoalCodingQuestions == attemptedCodingQuestions)) ? '#005773' : '#C3313E' }}>Coding Assingment</h4>
        }
    }

    renderCheckIcon = (component) => {
        const { totalFill, correctFill, incorrectFill, attemptedCodingQuestions, totoalCodingQuestions } = this.state
        switch (component.componentName) {
            case 'quiz':
                return (
                    (totalFill && (totalFill == correctFill + incorrectFill)) ? <CorrectCheck /> : <NotYetStartedSvg />
                )
            case 'homeworkAssignment':
                return (
                    (totoalCodingQuestions && (totoalCodingQuestions == attemptedCodingQuestions)) ? <CorrectCheck /> : <NotYetStartedSvg />
                )
        }
    }

    renderHomeworkComponents = (components) => {
        return (
            components.length > 0 && components.map(item => (
                get(item, 'componentName') !== 'homeworkPractice' && (
                    <div className={styles.questionTypeLeft}>
                        {this.renderCheckIcon(item)}
                        {this.renderName(get(item, 'componentName'))}
                        <p>( <b>{this.renderQuestionsStats(item)}</b> Questions solved )</p>
                    </div>
                )
            ))
        )
    }

    renderHomeworkPractice = () => {
        const { attemptedHomeworkPracticeQuestion, totalHomeworkPracticeQuestion } = this.state
        return (
            <div className={styles.questionTypeLeft}>
                {totalHomeworkPracticeQuestion && (totalHomeworkPracticeQuestion == attemptedHomeworkPracticeQuestion) ? <CorrectCheck /> : <NotYetStartedSvg />}
                <h4 style={{ color: (totalHomeworkPracticeQuestion && (totalHomeworkPracticeQuestion == attemptedHomeworkPracticeQuestion)) ? '#005773' : '#C3313E' }}>Practice</h4>
                <p>( <b>{attemptedHomeworkPracticeQuestion}/{totalHomeworkPracticeQuestion}</b> Questions solved )</p>
            </div>
        )
    }

    renderRemainingQuestion = (components) => {
        const { unansweredFill, totoalCodingQuestions, attemptedCodingQuestions, totalHomeworkPracticeQuestion, attemptedHomeworkPracticeQuestion } = this.state
        let questions = 0
        components.forEach(item => {
            if (item.componentName == 'quiz') {
                questions += unansweredFill
            }
            if (item.componentName == 'homeworkAssignment') {
                questions += (totoalCodingQuestions - attemptedCodingQuestions)
            }
        })
        if (totalHomeworkPracticeQuestion > 0) {
            questions += (totalHomeworkPracticeQuestion - attemptedHomeworkPracticeQuestion)
        }
        return `You have ${questions} ${questions == 1 ? 'question' : 'questions'} remaining`
    }

    renderSummary = (components, isHomeworkSubmittedForReview) => {
        const { totalFill, correctFill, incorrectFill, unansweredFill, attemptedCodingQuestions, totoalCodingQuestions, totalHomeworkPracticeQuestion, attemptedHomeworkPracticeQuestion } = this.state
        let summaryArr = []
        components.forEach(component => {
            if (get(component, 'componentName') === 'quiz') {
                let obj = {}
                obj.label = 'Quiz Summary'
                obj.totalQuestions = totalFill
                obj.answeredQuestions = correctFill + incorrectFill
                obj.notAnsweredQuestions = unansweredFill
                if (isHomeworkSubmittedForReview) {
                    obj.score = {
                        scoreLabel: 'Quiz Score',
                        result: ((correctFill)/totalFill)*100
                    }
                }
                summaryArr.push(obj)
            }
            if (get(component, 'componentName') === 'homeworkAssignment') {
                let obj = {}
                obj.label = 'Coding Summary'
                obj.totalQuestions = totoalCodingQuestions
                obj.answeredQuestions = attemptedCodingQuestions
                obj.notAnsweredQuestions = totoalCodingQuestions-attemptedCodingQuestions
                summaryArr.push(obj)
            }
        })
        if (totalHomeworkPracticeQuestion) {
            let obj = {}
            obj.label = 'Practice Summary'
            obj.totalQuestions = totalHomeworkPracticeQuestion
            obj.answeredQuestions = attemptedHomeworkPracticeQuestion
            obj.notAnsweredQuestions = totalHomeworkPracticeQuestion-attemptedHomeworkPracticeQuestion
            summaryArr.push(obj)
        }

        return (
            <div className={styles.summaryContainers}>
                {summaryArr.length > 0 && summaryArr.map(item => (
                    <>
                    {(item.answeredQuestions || item.notAnsweredQuestions) ? (
                        <div className={styles.summaryContainer}>
                            <div className={styles.summaryheadingContainer}>
                                <h3>{item.label}</h3>
                                {item.score && (
                                    <h4>{item.score.scoreLabel}: <span style={{ color: item.score.result == 0 ? '#F56858' : '#01AA93' }}>{item.score.result}%</span></h4>
                                )}
                            </div>
                            <div className={styles.tubeContainer}>
                                {isHomeworkSubmittedForReview ? (
                                    <>
                                        {item.label === 'Quiz Summary' ? (
                                            <>
                                            {correctFill ? (
                                                <ResultTube
                                                    label='Correct'
                                                    summary={true}
                                                    total={item.totalQuestions}
                                                    fill={correctFill}
                                                    colors={['#65DA7A', '#16d977']}
                                                    flakeColors={['#16d977', '#006838']}
                                                    lineColor='#72E386'
                                                />
                                            ) : null}
                                            {incorrectFill ? (
                                                <ResultTube
                                                    label='Incorrect'
                                                    summary={true}
                                                    total={item.totalQuestions}
                                                    fill={incorrectFill}
                                                    colors={['#F56858', '#707070']}
                                                    flakeColors={['#aaacae', '#504f4f']}
                                                    lineColor='#F87D6F'
                                                />
                                            ) : null}
                                            {unansweredFill ? (
                                                <ResultTube
                                                    label='Unanswered'
                                                    summary={true}
                                                    total={item.totalQuestions}
                                                    fill={item.notAnsweredQuestions}
                                                    colors={['#DCDCDC', '#707070']}
                                                    flakeColors={['#aaacae', '#504f4f']}
                                                    lineColor='#E8E8E8'
                                                />
                                            ) : null}
                                            </>
                                        ) : (
                                            <>
                                            {item.answeredQuestions ? (
                                                <ResultTube
                                                    label={item.totalQuestions == item.answeredQuestions ? 'Submitted' : 'Answered'}
                                                    summary={true}
                                                    total={item.totalQuestions}
                                                    fill={item.answeredQuestions}
                                                    colors={['#00C0FF', '#16d977']}
                                                    flakeColors={['#16d977', '#006838']}
                                                    lineColor='#3BCEFF'
                                                />
                                            ) : null}
                                            {item.notAnsweredQuestions ? (
                                                <ResultTube
                                                    label='Unanswered'
                                                    summary={true}
                                                    total={item.totalQuestions}
                                                    fill={item.notAnsweredQuestions}
                                                    colors={['#DCDCDC', '#707070']}
                                                    flakeColors={['#aaacae', '#504f4f']}
                                                    lineColor='#E8E8E8'
                                                />
                                            ) : null}
                                        </>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {item.answeredQuestions ? (
                                            <ResultTube
                                                label='Answered'
                                                summary={true}
                                                total={item.totalQuestions}
                                                fill={item.answeredQuestions}
                                                colors={['#00C0FF', '#16d977']}
                                                flakeColors={['#16d977', '#006838']}
                                                lineColor='#3BCEFF'
                                            />
                                        ) : null}
                                        {item.notAnsweredQuestions ? (
                                            <ResultTube
                                                label='Unanswered'
                                                summary={true}
                                                total={item.totalQuestions}
                                                fill={item.notAnsweredQuestions}
                                                colors={['#DCDCDC', '#707070']}
                                                flakeColors={['#aaacae', '#504f4f']}
                                                lineColor='#E8E8E8'
                                            />
                                        ) : null}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : null}
                    </>
                ))}
            </div>
        )
    }

    renderDoughnut = (doughnutData, isHomeworkSubmittedForReview) => {
        const { correctFill, totalFill } = this.state
        const strokeWidth = "12"
        const sqSize = "165"
        let percentage = doughnutData[1] !== 0 ? (doughnutData[0]/doughnutData[1]) * 100 : 0
        let filledColor = 'rgba(0, 173, 230, 1)'
        let notFilledColor = 'rgba(0, 173, 230, 0.2)'
        // percentage = 0
        if (isHomeworkSubmittedForReview) {
            let quizPercentage = (correctFill/totalFill)*100
            // quizPercentage = 80
            if (quizPercentage == 0) {
                notFilledColor = '#F56858'
                filledColor = '#F56858'
            }
            if (quizPercentage >= 90) {
                notFilledColor = '#01AA93'
                filledColor = '#01AA93'
            }
        } else {
            if (percentage == 0) {
                notFilledColor = '#DCDCDC'
            }
            if (percentage == 100) {
                filledColor = '#01AA93'
            }
        }
        const radius = (sqSize - strokeWidth) / 2;
        const viewBox = `0 0 ${sqSize} ${sqSize}`;
        const dashArray = radius * Math.PI * 2;
        const dashOffset = dashArray - dashArray * percentage / 100;
        return (
            <svg
                className={styles.doughnutSvg}
                viewBox={viewBox}>
                <circle
                    style={{ stroke: notFilledColor, fill: 'none' }}
                    cx={sqSize / 2}
                    cy={sqSize / 2}
                    r={radius}
                    strokeWidth={`${strokeWidth}px`} />
                <circle
                    cx={sqSize / 2}
                    cy={sqSize / 2}
                    r={radius}
                    strokeWidth={`${strokeWidth}px`}
                    transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
                    style={{
                    strokeDasharray: dashArray,
                    strokeDashoffset: dashOffset,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    stroke: filledColor,
                    fill: 'none'
                    }} />
            </svg>
        )
    }

    renderInnerDoughnutText = (doughnutData, isHomeworkSubmittedForReview) => {
        const { totalFill, correctFill } = this.state
        const quizPercentage = ((correctFill/totalFill)*100).toFixed(0)
        let percentageColor = ''
        if (isHomeworkSubmittedForReview) {
            if (quizPercentage == 0) {
                percentageColor = '#F56858'
            } else if (quizPercentage >= 90) {
                percentageColor = '#01AA93'
            } else {
                percentageColor = 'rgba(0, 173, 230, 1)'
            }
        } else {
            percentageColor = '#504F4F'
        }
        return (
            <div className={styles.doughnutInnerTextContainer}>
                <h4
                    style={{ color: percentageColor }}
                >
                    {isHomeworkSubmittedForReview ? quizPercentage+'%' : `${doughnutData[0]}/${doughnutData[1]}`}
                </h4>
                <p>{isHomeworkSubmittedForReview ? "Total Score" : "Completed"}</p>
            </div>
        )
    }

    render() {
        const { quizReportFetchStatus, topic } = this.props;
        const isFetching = ((quizReportFetchStatus && quizReportFetchStatus.getIn(['loading'])) && !this.showLoader())
        const { isHomeworkReportFetching } = this.state
        let { topicId, courseId } = this.props.match.params
        const courseIdString = courseId ? '/:courseId' : ''
        const quizReportTopicId = (this.props.location.state && this.props.location.state.quizReportTopicId) || getPreviousTopicIdFromLocalStorage()
        const homeworkComponents = this.getHomeworkComponents()
        const firstHomeworkComponent = homeworkComponents.length > 0 && homeworkComponents[0]
        let firstHomeworkComponentName = 'quiz'
        let firstHomeworkComponentId = null
        if (firstHomeworkComponent && get(firstHomeworkComponent, 'componentName') === 'homeworkAssignment') {
            firstHomeworkComponentName = 'codingAssignment'
        }
        if (firstHomeworkComponent && get(firstHomeworkComponent, 'componentName') === 'homeworkPractice') {
            firstHomeworkComponentName = 'practice'
            firstHomeworkComponentId = get(firstHomeworkComponent, 'blockBasedProject.id')
        }
        const { mentorMenteeSession } = this.props
        const session = filterKey(mentorMenteeSession, `mentorMenteeSession/${quizReportTopicId || topicId}`)
        const isHomeworkSubmittedForReview = session && session.getIn([0, 'id']) && session.getIn([0, 'isSubmittedForReview'])
        const filteredTopic = (topic && topic.toJS()) ? topic.toJS().find(topicData => get(topicData, 'id') === topicId) : null
        const reportType = (
            get(this, 'props.match.path') === '/quiz-report-latest/:topicId' ||
            get(this, 'props.match.path') === '/quiz-report-latest/:courseId/:topicId' ||
            get(this, 'props.match.path') === '/sessions/quiz-report-latest/:topicId' ||
            get(this, 'props.match.path') === '/sessions/quiz-report-latest/:courseId/:topicId'
        ) ? 'latestQuizReport'
            : 'firstQuizReport'
        const learningObjectivesReport = this.props.userFirstAndLatestQuizReport.getIn([
            0,
            reportType,
            'learningObjectiveReport'
        ], List([]))
        const masteryLevel = this.props.userFirstAndLatestQuizReport.getIn([
            0,
            'latestQuizReport',
            'quizReport',
            'masteryLevel'
        ])
        const masteryLevelIndex = masteryLevels.findIndex(
            item => masteryLevel === item
        )
        const masteryLabel = getMasteryLabel(masteryLevel)
        const thisTopic = this.props.topic.find(topic =>
            topic.get('id') === (quizReportTopicId || topicId)
        ) || Map({})
        const nextTopic = this.props.topic.find(topic =>
            topic.get('id') === this.props.userFirstAndLatestQuizReport.getIn([0, 'nextComponent', 'topic', 'id'])
        ) || Map({})
        const topicComponentRule = this.getTopicComponents()
        const { isBadgeModalVisible } = this.state
        
        const currentTopic = thisTopic && thisTopic.toJS()

        const doughnutData = this.getDoughnutData(homeworkComponents)
        
        if (quizReportTopicId && this.props.match.path.includes('sessions')) {
            return (
                <>
                {isHomeworkReportFetching ? (
                    <div className={styles.loaderContainer}>
                        <div className={styles.loaderModal}>
                            <div className={styles.loadingAnimation} />
                            <div className={styles.loadingText}>Please wait, generating your report .</div>
                        </div>
                    </div>
                ) : (
                    <div className={styles.homeworkReportContainer}>
                        <div className={styles.homeReportstatsCotainer}>
                            <span className='quiz-report-page-mixpanel-identifier' />
                            <div className={styles.statsLeftContainer}>
                                <div className={styles.topicThumbnailContainer}>
                                    {get(currentTopic, "thumbnailSmall.uri") && (
                                        <div
                                            className={styles.topicThumbnailSmall}
                                            style={{
                                                backgroundImage: `url(${getPath(get(currentTopic, "thumbnailSmall.uri", ""))})`,
                                            }}
                                        ></div>
                                    )}
                                    <div className={styles.topicContainer}>
                                        <p>Previous Class Homework</p>
                                        <h1>{get(currentTopic, "title", '')}</h1>
                                    </div>
                                </div>
                                <div className={styles.statsLeftQuestionsContainer}>
                                    <div className={styles.questionTypeContainer}>
                                        {this.renderHomeworkComponents(homeworkComponents)}
                                        {this.state.totalHomeworkPracticeQuestion > 0 && this.renderHomeworkPractice()}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.statsRightContainer}>
                                <div className={styles.statsRightDoughnutContainer}>
                                    <div className={styles.doughnutContainer}>
                                        {this.renderDoughnut(doughnutData, isHomeworkSubmittedForReview)}
                                        {this.renderInnerDoughnutText(doughnutData, isHomeworkSubmittedForReview)}
                                    </div>
                                    <p>{isHomeworkSubmittedForReview ? 'Proficiency' : this.renderRemainingQuestion(homeworkComponents)}</p>
                                </div>
                                {(isHomeworkSubmittedForReview && this.state.showLottie && (masteryLevel === 'master' || masteryLevel === 'proficient')) && (
                                        <Lottie
                                            options={celebrationLottieOptions}
                                            style={{ height: `${hs(200)}px`, position: 'absolute', bottom: '0' }}
                                        /> 
                                )}
                                <div>
                                    {isHomeworkSubmittedForReview ? (
                                        <div
                                            className={styles.masteryLabelNew}
                                        >
                                            {masteryLabel.tagName}
                                        </div>
                                    ) : (
                                        <UpdatedButton
                                            onBtnClick={() => {
                                                this.props.history.push({ 
                                                    pathname: `/homework/${getCourseId(quizReportTopicId || topicId)}/${quizReportTopicId || topicId}${firstHomeworkComponentId ? `/${firstHomeworkComponentId}` : ''}/${firstHomeworkComponentName}`
                                                })
                                            }}
                                            type='secondary'
                                            text={'Solve Homework'}
                                        ></UpdatedButton>
                                    )}
                                </div>
                            </div>
                        </div>
                        {this.renderSummary(homeworkComponents, isHomeworkSubmittedForReview)}
                        <div className={footerStyles.footerContainer}>
                            <div className={styles.nextButtonContainer}>
                                <UpdatedButton
                                    onBtnClick={() => {
                                        this.routeToNextTopicSession()
                                    }}
                                    text={`Continue to ${this.routeToNextTopicSessionText(get(filteredTopic, 'title', ''))}`} 
                                    rightIcon
                                >
                                    <ArrowForward color='white' />
                                </UpdatedButton>
                            </div>
                        </div>
                    </div>
                )}
                </>
            )
        }

        return (
            <>
                {/* <UpdatedSideNavBar
                    mobileNav
                    parent={quizReportTopicId ? 'sessions' : 'homework'}
                    revisitRoute={this.props.match.path.includes('/revisit')}
                    computedMatch={this.props.computedMatch || this.props.match}
                    pageTitle="Report"
                /> */}
                <div className={styles.quizReportContainer}
                    style={isMobile() ? { background: '#e9f7fc', marginTop: '60px' } : { background: '#f3fbfe' }}
                >
                    {isBadgeModalVisible &&
                        <BadgeModal closeModal={this.closeBadgeModal} shouldAnimate
                            unlockBadge={this.props.location.state.unlockBadge}
                        />
                    }
                    {isFetching && (
                        <div className={styles.loaderModal}>
                            <div className={styles.loadingAnimation} />
                            <div className={styles.loadingText}>Please wait, generating your report .</div>
                        </div>
                    )}
                    <PopUp
                        showPopup={this.showLoader()}
                    >
                        <div className={styles.autoSubmitQuizBox}>
                            Auto-submitting Quiz
                            <div style={{ marginLeft: `${hs(20)}px`, display: 'flex' }}>
                                <SimpleButtonLoader showLoader={this.showLoader()} style={{ backgroundImage: 'linear-gradient(to bottom, transparent, transparent)' }} />
                            </div>
                        </div>
                    </PopUp>
                    {(this.props.userFirstAndLatestQuizReport && this.props.userFirstAndLatestQuizReport.getIn([0,'latestQuizReport'])) && (
                        <>
                            <TitleContainer
                                isFetching={isFetching}
                                thisTopic={thisTopic && thisTopic.toJS()}
                            />
                            <ReportsContainer
                                isFetching={isFetching}
                                masteryLevelIndex={masteryLevelIndex}
                                masteryLabel={masteryLabel}
                                totalFill={this.state.totalFill}
                                correctFill={this.state.correctFill}
                                incorrectFill={this.state.incorrectFill}
                                unansweredFill={this.state.unansweredFill}
                            />
                            
                        </>

                    )}
                   
                    <NextFooter
                        match={this.props.match}
                        lastItem={true}
                        classwork={false}
                        fromReport={true}
                        
                    >

                    </NextFooter>
                </div>
            </>
        )
    }
}
