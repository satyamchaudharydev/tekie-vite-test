import React, { Component } from 'react'
import { sortBy, get } from 'lodash'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { darcula } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import styles from './CodingAssignment.module.scss'
import Editor from '../Editor'
import { hs } from '../../utils/size'
import './editorStyles.scss'
import duck from '../../duck'
import fetchUserAssignment from '../../queries/fetchUserAssignment'
import parseChatMessage from '../../pages/Chat/parseChatMessage'
import { NextButton } from '../../components/Buttons/NextButton'
import dumpCodingAssignment from '../../queries/dumpCodingAssignment'
import fetchMentorMenteeSession from '../../queries/sessions/fetchMentorMenteeSession'
import updateMentorMenteeSession from '../../queries/sessions/updateMentorMenteeSession'
import BigNextButton from '../../components/Buttons/BigNextButton'
import getPath from '../../utils/getPath'
import config from '../../config'
import withArrowScroll from '../../components/withArrowScroll'
import PreserveState from '../../components/PreserveState'
import fetchMentorFeedback from '../../queries/fetchMentorFeedback'
import fetchMenteeCourseSyllabus from '../../queries/sessions/fetchMenteeCourseSyllabus'
import store from '../../store'
import { fromJS } from 'immutable'
import MentorFeedback from '../../components/MentorFeedback'
import cx from 'classnames'
import { filterKey } from 'duck-state/lib/State'
import updateSheet from '../../utils/updateSheet'
import moment from 'moment'
import TekieCEParser from '../../components/Preview'
import { sort } from '../../utils/immutable'
import CodingAssignmentSkeleton from './CodingAssignmentSkeleton'
import gql from 'graphql-tag'
import requestToGraphql from '../../utils/requestToGraphql'
import { getToasterBasedOnType } from '../../components/Toaster'
import { getLORedirectKey } from '../UpdatedSessions/utils'
import CredentialsPopup from '../Signup/schoolLiveClassLogin/components/CredentialsPopup/CredentialsPopup'
import mentorMenteeSessionAddOrDelete from '../../utils/mmSessionAddOrDelete'
import { checkIfEmbedEnabled } from '../../utils/teacherApp/checkForEmbed'
import goBackToTeacherApp from '../../utils/teacherApp/goBackToTeacherApp'

const getString = string => {
    try {
        return decodeURIComponent(
            string
        )
    } catch (e) {
        try {
            return decodeURIComponent(string.replace('%', '~~~~percent~~~~')).replace('~~~~percent~~~~', '%')
        } catch (e) {
            return string
        }
    }
}

const terminalStyles = {
    minHeight: hs('50'),
    objectFit: 'contain',
    borderRadius: hs('3'),
    backgroundColor: '#013d4e',
    display: 'flex',
    alignItems: 'center'
}

class CodingAssignment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            codeStrings: {},
            shouldUpdate: false,
            fetchingMentorMenteeSession: false,
            showCredentialModal: false,
        }
    }

    getQuizReportId = () => {
        const quizReportTopicId = this.props.location.state && this.props.location.state.quizReportTopicId
        if (quizReportTopicId && (this.props.match.path === '/sessions/:courseId/:topicId/codingAssignment')) {
            return quizReportTopicId
        }
        return null
    }

    async componentDidMount() {
        this.setState({
            shouldUpdate: false
        })
        this.fetchAssginment()
        const { topicId } = this.props.match.params
        const quizReportTopicId = this.getQuizReportId()
        const menteeId = this.props.loggedInUser ? get(this.props.loggedInUser.toJS(), 'id') : ''
        if (quizReportTopicId) {
            mentorMenteeSessionAddOrDelete(menteeId, quizReportTopicId, '', 'started', 'other', () => fetchMentorMenteeSession(
                null,
                null,
                menteeId,
                'menteeTopicFilter',
                null,
                true,
                quizReportTopicId,
                null
            ).call())
        } else {
            mentorMenteeSessionAddOrDelete(menteeId, topicId, '', 'started', 'other',() => fetchMentorMenteeSession(
                null,
                null,
                menteeId,
                'menteeTopicFilter',
                null,
                true,
                topicId,
                null
            ).call())
        }
        let showCredentialModalStatus = localStorage.getItem('showCredentialsModal')
        if (showCredentialModalStatus) {
            this.setState({
                showCredentialModal: true
            })
        }
    }

    fetchAssginment = async () => {
        const { userId, match: { params: { topicId }, path } } = this.props
        if (path === '/sessions/coding/:topicId') {
            await fetchUserAssignment(userId, topicId, 'published', 'withMenteeMentorToken', true).call()
        } else if (path === '/sessions/codingAssignment/:topicId') {
            const prevTopicId = this.props.location.state && this.props.location.state.prevTopicId
            await fetchUserAssignment(userId, prevTopicId, 'published', 'withMenteeMentorToken', true).call()
        } else if (this.getQuizReportId()) {
            await fetchUserAssignment(userId, this.getQuizReportId(), 'published', 'withMenteeToken', true).call()
        } else {
            await fetchUserAssignment(userId, topicId, 'published', 'withMenteeToken', true).call()
        }
    }

    updateAssignmentSubmittedStatus = (sessionId) => {
        const { params: { topicId } } = this.props.match
        const input = {
            isAssignmentSubmitted: true,
            assignmentSubmitDate: new Date(new Date().setHours(0, 0, 0, 0))
        }
        updateMentorMenteeSession(
            sessionId,
            input,
            topicId,
            true
        ).call()
    }

    componentDidUpdate(prevProps) {
        const { path, params: { topicId, courseId } } = this.props.match
        const courseString = courseId ? '/:courseId' : ''
        const {
            dumpCodingStatus,
            mentorMenteeSession,
            userAssignment,
            mentorMenteeSessionUpdateStatus
        } = this.props
        if (userAssignment !== prevProps.userAssignment && userAssignment) {
            this.setState({
                shouldUpdate: true
            })
        }

        if (this.props.match.path !== prevProps.match.path) {
            this.fetchAssginment()
        }

        if (dumpCodingStatus && prevProps.dumpCodingStatus) {
            if (dumpCodingStatus.getIn(['success']) && !prevProps.dumpCodingStatus.getIn(['success'])) {
                const { path, params: { topicId } } = this.props.match
                if (
                    path === `/homework${courseString}/:topicId/codingAssignment` ||
                    path === `/revisit/homework${courseString}/:topicId/codingAssignment`
                ) {
                    if (mentorMenteeSession && mentorMenteeSession.toJS().length > 0) {
                        let sessionId = null
                        mentorMenteeSession.toJS().forEach((session) => {
                            if (session.topicId === topicId) {
                                sessionId = session.id
                            }
                        })
                        this.updateAssignmentSubmittedStatus(sessionId)
                    }
                } else if (path === '/sessions/coding/:topicId') {
                    if (checkIfEmbedEnabled()) goBackToTeacherApp("endSession")
                    this.endSession()
                } else if (path === `/revisit/homework${courseString}/:topicId/codingAssignment`) {
                    this.props.history.push(`/sessions`)
                }
            } else if (dumpCodingStatus.getIn(['failure']) && !prevProps.dumpCodingStatus.getIn(['failure'])) {
                if (path === '/sessions/coding/:topicId') {
                    if (checkIfEmbedEnabled()) goBackToTeacherApp("endSession")
                    this.endSession()
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
                const { mentorMenteeSession, userId, match: { params: { topicId } } } = this.props
                if (mentorMenteeSession) {
                    const modifiedSession = mentorMenteeSession
                    mentorMenteeSession.toJS().forEach((session, index) => {
                        if (session && session.userId === userId && session.topicId === topicId) {
                            session.assignmentSubmitDate = new Date(new Date().setHours(0, 0, 0, 0))
                            session.isAssignmentSubmitted = true
                            modifiedSession[index] = session
                        }
                    })
                    duck.merge(() => ({
                        mentorMenteeSession: modifiedSession
                    }))
                }
                if (!mentorMenteeSession.getIn([0, 'isQuizSubmitted'])) {
                    if (this.props.match.path !== '/sessions/coding/:topicId') {
                        const homeworkComponent = this.getHomeworkComponents(topicId)
                        const isQuizExists = (get(homeworkComponent, 'componentName') === 'quiz')
                        if (isQuizExists) {
                            if (courseId) {
                                this.props.history.push(`/homework/${courseId}/${topicId}/quiz`)
                            } else {
                                this.props.history.push(`/homework/${topicId}/quiz`)
                            }
                        }
                    }
                }
            }
        }

        if (
            mentorMenteeSessionUpdateStatus && mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'success']) &&
            !(prevProps.mentorMenteeSessionUpdateStatus && prevProps.mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'success'])) &&
            get(this.props, 'match.path') === `/revisit/homework${courseString}/:topicId/codingAssignment`
        ) {
            getToasterBasedOnType({
                type: 'success',
                message: 'Coding Assignment saved!'
            })
        }
    }

    dumpCoding = async (assignmentQuestions, callback = () => { }) => {
        const { dumpCodingStatus } = this.props
        if (dumpCodingStatus && dumpCodingStatus.getIn(['loading'])) {
            return false
        }
        const { userId, match: { path, params: { topicId, courseId } } } = this.props
        const answerInput = []
        if (assignmentQuestions) {
            const modifiedAssignmentQuestions = []
            assignmentQuestions.forEach((question) => {
                const { assignmentQuestion: { order, id } } = question
                const userAnswerCodeSnippet = (
                    this.state.codeStrings[`editor_${order}`] &&
                    this.state.codeStrings[`editor_${order}`].length > 0
                ) ? encodeURIComponent(this.state.codeStrings[`editor_${order}`])
                    : encodeURIComponent(question.userAnswerCodeSnippet)
                answerInput.push({
                    assignmentQuestionConnectId: id,
                    assignmentQuestionDisplayOrder: order,
                    isAttempted: this.state.codeStrings[`editor_${order}`] ? true : false,
                    userAnswerCodeSnippet: userAnswerCodeSnippet
                })
                question.userAnswerCodeSnippet = userAnswerCodeSnippet
                modifiedAssignmentQuestions.push(question)
            })
            const tokenType = path === ('/sessions/coding/:topicId' || '/codingAssignment/:topicId') ? 'withMenteeMentorToken' : 'withMenteeToken'
            await dumpCodingAssignment(
                userId,
                topicId,
                {
                    assignmentQuestions: answerInput,
                    assignmentAction: 'next'
                },
                tokenType,
                true
            ).call()
            callback()
            if (path === '/revisit/sessions/coding/:topicId') {
                if (courseId) {
                    this.props.history.push(`/revisit/homework/${courseId}/${topicId}/quiz`)
                } else {
                    this.props.history.push(`/revisit/homework/${topicId}/quiz`)
                }
            } else if (path === '/codingAssignment/:topicId') {
                this.props.history.push(`/homework-assignment/${topicId}`)
            } else if (path === '/homework-assignment/:topicId/') {
                this.props.history.push(`/quiz/${topicId}/`)
            }
        }
    }

    getTopicOrder = topicId => {
        const topics = sort.ascend(this.props.topic, ['order']).toJS()
        const order = topics.findIndex(topic => topic.id === topicId)
        return order
    }

    fetchFeedbackForm = () => {
        fetchMentorFeedback(this.props.mentorMenteeSessionEndSession.getIn([0, 'id'])).call()
    }

    endSession = async () => {
        const { topicId } = this.props.match.params
        const menteeId = this.props.loggedInUser ? get(this.props.loggedInUser.toJS(), 'id') : ''
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
                    { sessionStatus: 'completed', endSessionByMentee: new Date() },
                    topicId,
                    true
                ).call()
                if (res) {
                    const { menteeCourseSyllabus } = this.props
                    if (menteeCourseSyllabus.toJS()[0]) {
                        const bookedSessions = menteeCourseSyllabus.toJS()[0].bookedSession
                        let completedSessions = menteeCourseSyllabus.toJS()[0].completedSession
                        bookedSessions.forEach((session, index) => {
                            if (session.topicId === topicId) {
                                bookedSessions.splice(index, 1)
                                if (completedSessions) {
                                    session.endingDate = session.bookingDate
                                    completedSessions.push(session)
                                } else {
                                    completedSessions = [session]
                                }
                            }
                        })
                        duck.merge(() => ({
                            menteeCourseSyllabus: {
                                bookedSession: bookedSessions,
                                completedSession: completedSessions
                            }
                        }))
                        if (this.getTopicOrder(topicId) === 0) {
                            updateSheet({}, {
                                Phone: this.props.phoneNumber,
                                mx_Lead_Status: 'Session Taken',
                                ProspectStage: 'Session Taken',
                                mx_Session_Taken_Date_Time: moment().utc().format("YYYY-MM-DD HH:mm:ss")
                            })
                        }
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
                        localStorage.setItem('prevRoute', '')
                        sessionStorage.setItem('prevRoute', '')
                    }
                }
            }
        }
    }

    saveCode = (codeString, question, order, key) => {
        const currCodeStrings = this.state.codeStrings
        currCodeStrings[key] = codeString
        this.setState({
            codeStrings: currCodeStrings
        }, () => {
        })
    }

    renderCodingAssignment = (question, userAnswerCodeSnippet, index) => {
        const { assignmentQuestion: { id: assignmentId, statement, order, questionCodeSnippet, answerCodeSnippet } } = question
        const isSubmittedForReview = this.props.mentorMenteeSession && this.props.mentorMenteeSession.getIn([0, 'isSubmittedForReview'])
        return (
            <div>
                
                <div className={styles.questionContainer}>
                    <div className={styles.questionStatement}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                        }}>
                            <div
                                style={{
                                    fontWeight: 'bold'
                                }}
                            >
                                {`${index}.`}
                            </div>
                            <div style={{
                                marginLeft: `${hs(8)}px`,
                                 width: '100%',
                            }}>
                                {
                                    <TekieCEParser
                                        id={`CA-statement_${assignmentId}`}
                                        value={statement}
                                        init={{ selector: `CA-statement_${assignmentId}` }}
                                        legacyParser={(statement) => {
                                            return parseChatMessage({ statement }).map((message) => (
                                                message
                                            ))
                                        }}
                                    />
                                }
                            </div>
                        </div>
                    </div>
                    <div className={styles.questionCodeSnippet}>
                        {questionCodeSnippet && (
                            <SyntaxHighlighter
                                language={'text'}
                                codeTagProps={{ style: { fontFamily: 'Monaco' } }}
                                customStyle={terminalStyles}
                                style={darcula}
                            >
                                {getString(questionCodeSnippet)}
                            </SyntaxHighlighter>
                        )}
                    </div>
                    <div className={styles.editorContainer}>
                        <Editor
                            titleClass={styles.editorTitle}
                            type="assignment"
                            outputTitleBg={styles.skyBlue}
                            codeString={this.state.codeStrings[`editor_${order}`]}
                            runButton={styles.editorRunButton}
                            output={styles.editorOutput}
                            editorText={styles.editorText}
                            key={this.props.match.url + `editor_${order}`}
                            editorKey={`editor_${order}`}
                            outputContainer={
                                order % 3 === 0
                                    ? styles.lastQuestionEditorOutputContainer
                                    : styles.editorOutputContainer
                            }
                            lineHeight='30'
                            index={index}
                            arrowStyle={{
                                top: 15,
                                marginRight: 10
                            }}
                            interpretorStyle={{
                                marginLeft: 16,
                            }}
                            isMentor={this.props.loggedInUser.toJS().role === config.MENTOR}
                            answerCodeSnippet={answerCodeSnippet && answerCodeSnippet !== 'null'
                                ? getString(answerCodeSnippet)
                                : ''}
                            onChange={(codeString, key) => this.saveCode(codeString, question, order, key)}
                            initialCodeString={
                                userAnswerCodeSnippet && userAnswerCodeSnippet !== 'null'
                                    ? getString(userAnswerCodeSnippet)
                                    : ''
                            }
                            shouldUpdate={this.state.shouldUpdate}
                            isSubmittedForReview={isSubmittedForReview}
                            newFlow={((this.props.match.path === '/sessions/:courseId/:topicId/codingAssignment') ||
                                (this.props.match.path === '/homework/:courseId/:topicId/codingAssignment'))}
                        />
                    </div>
                </div>
            </div>
        )
    }

    getHomeworkComponents = (sessionTopicId) => {
        let { topic } = this.props
        topic = (topic && topic.toJS()) || []
        const filteredTopic = topic.filter(topicData => get(topicData, 'id') === sessionTopicId)
        if (filteredTopic && filteredTopic.length) {
            const topicComponentRuleDoc = get(filteredTopic[0], 'topicComponentRule', [])
            const sortedTopicComponentRule = topicComponentRuleDoc.sort((a, b) => a.order > b.order)
            const currentTopicComponentIndex = sortedTopicComponentRule.findIndex(el => (get(el, 'componentName') === 'homeworkAssignment'))
            const nextComponent = sortedTopicComponentRule[currentTopicComponentIndex + 1]
            return nextComponent || null
        }
        return []
    }


    getButton = (assignmentQuestions) => {
        const {
            dumpCodingStatus,
            mentorMenteeSession,
            mentorMenteeSessionUpdateStatus
        } = this.props
        const { path } = this.props.match
        const thumbnailUri = this.props.userTopicJourney && this.props.userTopicJourney.getIn([0, 'quiz', 'thumbnail', 'uri'])
        const title = this.props.userTopicJourney && this.props.userTopicJourney.getIn([0, 'quiz', 'title'])
        const isSubmittedForReview = mentorMenteeSession && mentorMenteeSession.getIn([0, 'isSubmittedForReview'])
        //Filter the current session mentorMenteeSession.
        const topicId = this.getQuizReportId() || get(this.props, 'match.params.topicId')
        const homeworkComponent = this.getHomeworkComponents(topicId)
        const isQuizExists = (get(homeworkComponent, 'componentName') === 'quiz')
        const courseId = get(this.props, 'match.params.courseId')
        const courseString = courseId ? '/:courseId' : ''
        const session = filterKey(mentorMenteeSession, `mentorMenteeSession/${topicId}`)
        if (
            path === '/sessions/coding/:topicId'
        ) {
            return (
                <div
                    className={styles.nextButtonContainer}
                    onClick={() => {
                        console.log('sf')
                        // if (session && get(session.toJS(), '0.sessionStatus') === 'completed') {
                        //     this.props.history.push('/sessions')
                        // } else {
                        //     this.dumpCoding(assignmentQuestions)
                        // }
                    }}
                >
                    <NextButton
                        title='End Session'
                        loading={
                            (dumpCodingStatus && dumpCodingStatus.getIn(['loading'])) ||
                            this.state.fetchingMentorMenteeSession ||
                            (
                                (this.props.mentorMenteeSessionUpdateStatusEndSession &&
                                this.props.mentorMenteeSessionUpdateStatusEndSession.getIn(['loading'])) ||
                                this.props.mentorFeedbackStatus.get('loading')
                            )
                        }
                    />
                </div>
            )
        } else if (
            path === '/revisit/sessions/coding/:topicId'
        ) {
            return (
                <div
                    className={styles.nextButtonContainer}
                    onClick={() => this.dumpCoding(assignmentQuestions)}
                >
                    <NextButton
                        title='Submit'
                        loading={dumpCodingStatus && dumpCodingStatus.getIn(['loading'])}
                    />
                </div>
            )

        } else if (
            path === `/homework${courseString}/:topicId/codingAssignment` ||
            path === `/revisit/homework${courseString}/:topicId/codingAssignment`
        ) {
            if (!isSubmittedForReview) {
                return (
                    <div className={styles.submitButtonContainer}>
                        <div
                            onClick={() => this.dumpCoding(assignmentQuestions)}
                        >
                            <NextButton
                                title='Save'
                                loading={
                                    (dumpCodingStatus && dumpCodingStatus.getIn(['loading'])) ||
                                    (
                                        mentorMenteeSessionUpdateStatus &&
                                        mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${get(this.props, 'match.params.topicId')}`, 'loading'])
                                    )
                                }
                            />
                        </div>
                    </div>
                )
            } else {
                if (path === `/homework/:courseId/:topicId/codingAssignment` ||
                    path === `/revisit/homework/:courseId/:topicId/codingAssignment`) {
                    return (
                        <div className={cx({
                            [styles.submitButtonContainer]: true,
                            [styles.topMargin]: isSubmittedForReview
                        })}>
                            <div
                                onClick={() => {
                                    if (isQuizExists) {
                                        this.props.history.push(`/homework/${courseId}/${get(this.props, 'match.params.topicId')}/quiz`)
                                    } else {
                                        this.props.history.push('/homework')
                                    }
                                }}
                            >
                                <NextButton
                                    title={isQuizExists ? 'Go to Quiz Assignment' : 'Back to Homework'}
                                />
                            </div>
                        </div>
                    )
                }
                return <div style={{ marginBottom: '10px' }} />
            }
        } else if (path === '/sessions/codingAssignment/:topicId') {
            return (
                <div className={styles.bigNextButtonContainer}>
                    <BigNextButton onClick={() => {
                        this.props.history.push(`/sessions/video/${this.props.match.params.topicId}`)
                    }} title={title} thumbnail={getPath(thumbnailUri)} />
                </div>
            )
        } else if (this.getQuizReportId()) {
            const firstComponent = this.props.location.state && this.props.location.state.firstComponent
            const componentName = get(firstComponent, 'componentName', '')
            const childComponentName = get(firstComponent, 'childComponentName', null)
            return (
                <div className={
                    cx({
                        [styles.submitButtonContainer]: true,
                        [styles.topMargin]: isSubmittedForReview
                    })}>
                    <div
                        onClick={() => {
                            if (isQuizExists) {
                                this.props.history.push({
                                    pathname: `/sessions/${courseId}/${this.props.match.params.topicId}/quiz`,
                                    state: {
                                        quizReportTopicId: this.getQuizReportId(),
                                        firstComponent: this.props.location.state && this.props.location.state.firstComponent
                                    }
                                })
                            } else if (componentName === 'blockBasedProject') {
                                this.props.history.push(`sessions/project/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId')}`)
                            } else if (componentName === 'blockBasedPractice') {
                                this.props.history.push(`sessions/practice/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId')}`)
                            } else if (componentName === 'learningObjective') {
                                this.props.history.push(`sessions/${getLORedirectKey({ componentName: childComponentName })}/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId')}`)
                            } else {
                                this.props.history.push(`/sessions/video/${courseId}/${this.props.match.params.topicId}`)
                            }
                        }}
                    >
                        <NextButton
                            title='Next'
                        />
                    </div>
                </div>
            )
        }
    }

    getAssignmentQuestion = (assignments) => {
        const { path } = this.props.match
        const courseId = get(this.props, 'match.params.courseId')
        const courseString = courseId ? '/:courseId' : ''
        const assignmentQuestion = []
        assignments.map((assignment, index) => {
            if (
                path === `/homework${courseString}/:topicId/codingAssignment` ||
                path === `/revisit/homework${courseString}/:topicId/codingAssignment` ||
                path === '/sessions/codingAssignment/:topicId' ||
                path === "/homework-assignment/:topicId/" ||
                this.getQuizReportId()
            ) {
                if (
                    get(assignment, 'assignmentQuestion.isHomework')
                ) {
                    assignmentQuestion.push(assignment)
                }
            } else {
                if (
                    !get(assignment, 'assignmentQuestion.isHomework')
                ) {
                    assignmentQuestion.push(assignment)
                }
            }
            return false
        })

        return assignmentQuestion
    }

    checkIfCourseCompleted = async () => {
        let menteeCourseSyllabus = this.props.menteeCourseSyllabus && this.props.menteeCourseSyllabus.toJS()
        if (menteeCourseSyllabus && !menteeCourseSyllabus.length) {
            await fetchMenteeCourseSyllabus()
        }
        if (this.props.menteeCourseSyllabus && this.props.menteeCourseSyllabus.toJS()) {
            const upcomingSessions = this.props.menteeCourseSyllabus.getIn([0, 'upComingSession']) && this.props.menteeCourseSyllabus.getIn([0, 'upComingSession']).toJS()
            if ((upcomingSessions && upcomingSessions.length < 1)) {
                return true
            }
        }
        return false
    }

    render() {
        const {
            userAssignment, userAssignmentStatus,
            dumpCodingStatus
        } = this.props
        const isLoading = userAssignmentStatus && userAssignmentStatus.getIn(['loading'])
        if (userAssignment.getIn([0]) && userAssignment.getIn([0]).toJS()['assignment'] && !isLoading) {
            const assignmentQuestions = sortBy(
                this.getAssignmentQuestion(userAssignment.getIn([0]).toJS()['assignment']),
                'order'
            )
            return (
                <>
                    <PreserveState
                        state={this.state}
                        setState={(state, callback = () => { }) => {
                            this.setState({
                                ...state,
                            },
                                callback)
                        }}
                        persistIf={id => {
                            return id === this.props.match.url
                        }}
                        key={this.props.match.url}
                        saveIf={Object.values(this.state.codeStrings).join('')}
                        id={this.props.match.url}
                        preserveScroll={['tk-route-container']}
                    />
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        paddingLeft: '48px',
                        boxSizing: 'border-box',
                    }}>
                        {
                            assignmentQuestions.map((question, index) => {
                                return this.renderCodingAssignment(
                                    question,
                                    assignmentQuestions[index] && assignmentQuestions[index].userAnswerCodeSnippet,
                                    index + 1
                                )
                            })
                        }
                        {
                            (!isLoading && assignmentQuestions)
                                ? (
                                    <div>
                                        {
                                            this.getButton(assignmentQuestions)
                                        }
                                    </div>
                                ) :
                                <div />
                        }
                        {(this.props.match.path === '/codingAssignment/:topicId' ||
                            this.props.match.path === '/homework-assignment/:topicId/'
                        ) && (
                                <NextButton title="Next" style={{
                                    marginTop: 28,
                                    marginBottom: 28,
                                    marginRight: 28,
                                    alignSelf: 'flex-end'
                                }}
                                    loading={dumpCodingStatus && dumpCodingStatus.getIn(['loading'])}
                                    onClick={() => {
                                        this.dumpCoding(assignmentQuestions)
                                        // if (this.props.match.path === '/codingAssignment/:topicId') {
                                        //     this.props.history.push(`/homework-assignment/${this.props.match.params.topicId}`)
                                        // } else {
                                        //     this.props.history.push(`/quiz/${this.props.match.params.topicId}`)
                                        // }
                                    }} />
                            )}
                    </div>
                    {this.props.match.path === '/sessions/coding/:topicId' && (
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
                    {this.state.showCredentialModal && <CredentialsPopup email={get(this.props.loggedInUser.toJS(), 'email')} password={get(this.props.loggedInUser.toJS(), 'savedPassword')} onClickFn={() => {
                        this.props.dispatch({ type: 'LOGOUT' })
                    }} />}
                </>
            )
        }
        return (
            <CodingAssignmentSkeleton />
        )
    }
}

export default withArrowScroll(CodingAssignment, 'tk-route-container')
