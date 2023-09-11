import React, { Component } from 'react'
import { motion } from 'framer-motion'
import { darcula } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { sortBy, get, replace } from 'lodash'
import SyntaxHighlighter from 'react-syntax-highlighter'
import cx from 'classnames'
import styles from './CodingAssignment.module.scss'
import Editor from '../Editor/EditorPage'
import { hs } from '../../utils/size'
import './editorStyles.scss'
import Skeleton from '../../components/QuestionTypes/Skeleton'
import duck from '../../duck'
import pqStyles from '../UpdatedSessions/PracticeQuiz/components/QuestionArea/QuestionArea.module.scss'
import quizStyles from "../UpdatedSessions/Quiz/components/QuestionArea/QuestionArea.module.scss";
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
import ArrowSVG from '../../assets/arrowIcon'
import store from '../../store'
import { fromJS, Map } from 'immutable'
import MentorFeedback from '../../components/MentorFeedback'
import { filterKey } from 'duck-state/lib/State'
import updateSheet from '../../utils/updateSheet'
import moment from 'moment'
import { sort } from '../../utils/immutable'
import gql from 'graphql-tag'
import requestToGraphql from '../../utils/requestToGraphql'
import { getToasterBasedOnType } from '../../components/Toaster'
import { getLORedirectKey, getPreviousTopicIdFromLocalStorage } from '../UpdatedSessions/utils'
import { isBase64, decodeBase64, encodeToBase64 } from '../../utils/base64Utility'
import TekieCEParser from '../../components/Preview'
import classNames from 'classnames'
import isMobile from '../../utils/isMobile'
import CredentialsPopup from '../Signup/schoolLiveClassLogin/components/CredentialsPopup/CredentialsPopup'
import mentorMenteeSessionAddOrDelete from '../../utils/mmSessionAddOrDelete'
import bulbImage from '../../assets/bulb.png'
import { checkIfEmbedEnabled, getEmbedData, isAccessingTrainingResources } from '../../utils/teacherApp/checkForEmbed'
import UpdatedButton from '../../components/Buttons/UpdatedButton/UpdatedButton'
import { ArrowForward, Power } from '../../constants/icons'
import ShowSolutionToggle from '../../components/ShowSolutionToggle'
import { getFirstComponentFromLocalStorage } from '../UpdatedSessions/utils';
import fetchComponents from '../../queries/fetchComponents'
import { HOMEWORK_COMPONENTS_CONFIG, TOPIC_COMPONENTS } from '../../constants/topicComponentConstants'
import goBackToTeacherApp from '../../utils/teacherApp/goBackToTeacherApp'
import updateUserAssignment from '../../queries/teacherApp/updateUserAssignment'
import NextFooter from '../../components/NextFooter'
import { fetchHomeworkDetails, updateHomeworkAttempted } from '../../components/NextFooter/utils'
import { backToPageConst } from '../TeacherApp/constants'
import buddyQueriesCaller from '../../queries/utils/buddyQueriesCaller'
import { getBuddies, getDataFromLocalStorage } from '../../utils/data-utils'
import { fetchUserAssignment } from '../TeacherApp/utils'
import getMe from '../../utils/getMe'
import updateSessionComponentTracker from '../../queries/updateSessionComponentTracker'
import batchSession from '../../queries/teacherApp/fetchBatchSession'
import updatedBatchSession from '../../queries/teacherApp/fetchBatchSessionUpdated'

const UPDATE_INTERVAL = 5000;

const getString = string => {
    try {
        if (!string) return ''
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
            prevCodeStrings: {},
            isSave: false,
            showSave: false,
            shouldUpdate: false,
            fetchingMentorMenteeSession: false,
            activeQuestionIndex: 0,
            refOutputActive: [],
            isAssignmentAttempted: false,
            hints: [],
            showCredentialModal: false,
            isSeeAnswers: false,
            userAnswerCodeSnippet: '',
            isBuddyLoading: true,
            isSubmittedCalled: false,
            initialCodeString: '',
        }
    }
    changeQuestion = questionNumber => {
        this.props.history.push({
            search: `?question=${questionNumber + 1}`
        })
    }
    getQuizReportId = () => {
        const quizReportTopicId = (this.props.location.state && this.props.location.state.quizReportTopicId)
        if (quizReportTopicId && (this.props.match.path === '/sessions/:courseId/:topicId/codingAssignment')) {
            return quizReportTopicId
        }
        return null
    }

    checkIfPracticeAttempted = async() => {
        let answerAttemptCount = 0;
        let assignmentClassworkCount = 0;
        let assignments = this.props.userAssignment && this.props.userAssignment.toJS()
        assignments = get(assignments,'[0].assignment')
        // eslint-disable-next-line array-callback-return
        assignments && assignments.map((assignment) => {
            if(!get(assignment,'assignmentQuestion.isHomework') && get(assignment,'userAnswerCodeSnippet') ){
                answerAttemptCount += 1
            }
        })
        // eslint-disable-next-line array-callback-return
        assignments && assignments.map((assignment) => {
            if(!get(assignment,'assignmentQuestion.isHomework')){
                assignmentClassworkCount += 1
            }
        })
        const checkIfDataExist = (assignmentData,userId) => {
            let resSent = false
            assignmentData && assignmentData.map(data => {
                if((data.user.id === userId) && data.submitted === true){
                    resSent = true
                    return true
                }
                return false
            })
            return resSent
        }
        if(answerAttemptCount === assignmentClassworkCount && assignmentClassworkCount>0){
            const batchSessionId = getDataFromLocalStorage('currentSessionId')
            const loggedInUser = this.props.userId
            const userBuddies = getBuddies(get(this.props.loggedInUser.toJS(), 'buddyDetails', []))
            let batchSessionData
            batchSessionData = await updatedBatchSession(batchSessionId)
            const sessionComponentTrackers = get(batchSessionData,'data.batchSessionData.sessionComponentTracker')
            const sessionComponentTrackersId = get(sessionComponentTrackers,'id')
            const assignmentData = get(sessionComponentTrackers,'blockBasedPractice')
            let input = {}
            input = {
                assignments:{
                    updateWhere:{
                      userReferenceId: loggedInUser
                    },
                    updateWith:{
                        submitted: true
                    }
                  }
            }
            if(!checkIfDataExist(assignmentData,loggedInUser)){
                await updateSessionComponentTracker(sessionComponentTrackersId,input)
            }
            if(userBuddies && userBuddies.length > 0){
                for (let i = 0; i < userBuddies.length; i++) {
                    const buddy = userBuddies[i];
                    if (!checkIfDataExist(assignmentData, buddy.id)) {
                        delete input.assignments.updateWhere.userReferenceId;
                        input.assignments.updateWhere.userReferenceId = buddy.id;
                        await updateSessionComponentTracker(sessionComponentTrackersId, input);
                    }
                }
            }

        }
    }
    autoSaveCode = async (question) => {
        if (this.props.userAssignment.size > 0) {  
            if (
                get(this.state.codeStrings, `editor_${this.state.activeQuestionIndex}`) !==
                get(this.state.prevCodeStrings, `editor_${this.state.activeQuestionIndex}`)
            ) {

            // questions are sorted by index, so we can just use the index to get the question
                let questions = sortBy(this.getAssignmentQuestion(
                    get((this.props.userAssignment.getIn([0]) || Map({}))
                    .toJS(), 'assignment')),
                        'order'
                    )
                const userAssignment = this.props.userAssignment && this.props.userAssignment.toJS()
                const allQuestions = get(userAssignment, '[0].assignment', [])
                const activeQuestion = get(questions, `[${this.state.activeQuestionIndex}].assignmentQuestion`)
                const editorMode = get(activeQuestion, 'editorMode')
                const activeQuestionId = get(activeQuestion, 'id')
                const assignmentId = get(this.props.userAssignment.toJS(), '[0].id');
                const input = {
                    assignment: {
                        updateWhere: {
                            assignmentQuestionReferenceId: activeQuestionId,
                        },
                        updateWith: {
                            isAttempted: true,
                        },
                    }
                }
                if (editorMode === 'blockly') {
                    input.assignment.updateWith.userAnswerCodeSnippet = get(this.state.codeStrings, `editor_${this.state.activeQuestionIndex}`); 
                } else {
                    input.assignment.updateWith.userAnswerCodeSnippet = encodeURIComponent(get(this.state.codeStrings, `editor_${this.state.activeQuestionIndex}`)) ;
                }
                // call to the db to update the code
               await this.updateAssignmentCode(assignmentId, input, activeQuestion.id,question);
                // reset the prevCodeStrings to the current codeStrings
                this.setState({ prevCodeStrings: this.state.codeStrings });
                this.checkIfPracticeAttempted()
            }
        }
    }
    async componentDidMount() {
         if(this.props.location.search){
            const questionNumber = this.props.location.search.split('=')[1]
            if(questionNumber){
                this.setState({activeQuestionIndex: parseInt(questionNumber) - 1})
            }
        }
        const questionNumber = parseInt(this.props.location.search.split('=')[1]) || 1
        this.setState({ activeQuestionIndex: questionNumber - 1  })   
        this.setState({
            shouldUpdate: false,
            isSeeAnswers: false
        })

        // update to the db every {some} seconds if the user has made any changes to the code
        

        this.fetchAssginment()
        const { topicId, courseId } = this.props.match.params;
        const courseString = courseId ? '/:courseId' : ''
        const { path } = this.props.match
        const quizReportTopicId = this.getQuizReportId()
        const menteeId = this.props.loggedInUser ? get(this.props.loggedInUser.toJS(), 'id') : ''
        const isHomework = this.isHomework()
        const mmsStatus = isHomework ? 'completed' : 'started';
        if (isHomework) {
            if (isAccessingTrainingResources()) {
                const { topicId, courseId } = this.props.match.params
                fetchHomeworkDetails({
                    topicId, courseId
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
        }
        if (quizReportTopicId) {
            mentorMenteeSessionAddOrDelete(menteeId, quizReportTopicId, '', mmsStatus, 'other',() => fetchMentorMenteeSession(
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
            mentorMenteeSessionAddOrDelete(menteeId, topicId, '', mmsStatus, 'other', () => fetchMentorMenteeSession(
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
    updateAssignmentCode = async (assignmentId, input,questionId,question) => {
        const path = this.props.match.path
        const courseId = get(this.props, 'match.params.courseId')
        const courseString = courseId ? '/:courseId' : ''
        const isHomework = this.isHomework()

        if (checkIfEmbedEnabled() && this.state.isSeeAnswers) return true 
        if (isHomework && !checkIfEmbedEnabled()){
            updateHomeworkAttempted(questionId,HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment)
        }
        if (isHomework && checkIfEmbedEnabled()) {
            const backToPage = getEmbedData('backToPage')
            if (backToPage === backToPageConst.trainingResourcesAssessment) updateHomeworkAttempted(questionId,HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment)
        }
        if (assignmentId) {
            if(!this.state.showSave){
                this.setState({ showSave: true })
                this.setState({ isSave: true})
            }
            const res = await updateUserAssignment({assignmentId, input,fromStudentApp: true, updateOne: true}).call()
            if (get(res, 'updateUserAssignment.id')) {
                duck.merge(() => ({
                    userAssignment: fromJS([res.updateUserAssignment]),
                }), {
                    key: 'userAssignment'
                }
            
                )
            }
            const isHomework = this.isHomework()
            const isAssignmentSubmitted = this.props.mentorMenteeSessionEndSession && this.props.mentorMenteeSessionEndSession.getIn([0, 'isAssignmentSubmitted'])
            if(isHomework && !isAssignmentSubmitted){
                const sessionId = this.props.mentorMenteeSessionEndSession && this.props.mentorMenteeSessionEndSession.getIn([0, 'id'])
                this.updateAssignmentSubmittedStatus(sessionId)
            }
            this.setState({ isSave: false })
            setTimeout(() => {
                this.setState({ showSave: false })
            }, 2000)

            const {  match: { params: { topicId } } } = this.props
            buddyQueriesCaller('updateUserAssignment',{input,topicId,courseId})
        }
    }


    fetchBuddyAssignments = async() => {
        const user = this.props.loggedInUser
        const userBuddies = getBuddies(get(user.toJS(), 'buddyDetails', []))
        if(userBuddies && userBuddies.length > 0){
            for(let i=0;i<userBuddies.length;i++){
                const {  match: { params: { topicId,courseId } } } = this.props
                const userAssignments = await fetchUserAssignment(get(userBuddies[i],'id'),topicId,courseId)
                const buddyCodeSnippet = get(userAssignments,`${this.state.activeQuestionIndex}.assignment[0].userAnswerCodeSnippet`)
                if(buddyCodeSnippet){
                    this.setState({
                        codeStrings: {[`editor_${this.state.activeQuestionIndex}`]: buddyCodeSnippet}
                    })
                    break 
                 }
            }
        }
        this.setState({
            isBuddyLoading: false
        })
    }

    fetchAssginment = async () => {
        const { userId, match: { params: { topicId, courseId }, path } } = this.props
        if ((path === '/sessions/coding/:topicId') || (path === '/sessions/coding/:courseId/:topicId')) {
            await fetchComponents(topicId, courseId).components([
                { type: TOPIC_COMPONENTS.assignment }
            ])
        } else if (path === '/sessions/codingAssignment/:topicId') {
            const prevTopicId = this.props.location.state && this.props.location.state.prevTopicId
            await fetchComponents(prevTopicId, courseId).components([
                { type: TOPIC_COMPONENTS.assignment }
            ])
        } else if (this.getQuizReportId()) {
            await fetchComponents(this.getQuizReportId(), courseId).components([
                { type: TOPIC_COMPONENTS.assignment }
            ])
        } else {
            await fetchComponents(topicId, courseId).components([
                { type: TOPIC_COMPONENTS.assignment }
            ])
        }
        const assignmentQuestions = sortBy(this.getAssignmentQuestion(get((this.props.userAssignment.getIn([0]) || Map({})).toJS(), 'assignment')),
            'order'
        )
        const activeQuestionIndexInLoc = this.props.location.state && this.props.location.state.activeQuestionIndex;
        if (typeof activeQuestionIndexInLoc === 'number') {
            this.setState({
                activeQuestionIndex: activeQuestionIndexInLoc
            }, () => {
                this.props.history.replace(this.props.history.pathname)
            })
        }
        this.getAssignmentHints(path, courseId)
        this.setState({ refOutputActive: assignmentQuestions.map(() => true ) })
        this.fetchBuddyAssignments()
    }

    getAssignmentHints = (path, courseId) => {
        const courseString = courseId ? '/:courseId' : ''
        const isHomework = this.isHomework()

        let assignmentQuestionTemp = null
        const { userAssignment, userAssignmentStatus } = this.props
        const isLoading = userAssignmentStatus && userAssignmentStatus.getIn(['loading'])
        if (userAssignment.getIn([0]) && userAssignment.getIn([0]).toJS()['assignment'] && !isLoading) {
            assignmentQuestionTemp = sortBy(
                this.getAssignmentQuestion(this.props.userAssignment.toJS().map(assignment => get(assignment, 'assignment'))[0]),
                'order'
            )
            if (assignmentQuestionTemp && assignmentQuestionTemp.length > 0) {
                assignmentQuestionTemp = assignmentQuestionTemp.filter(question => {
                    return get(question, 'assignmentQuestion.isHomework') === !!isHomework
                })
            }
            const getHints = assignmentQuestionTemp[this.state.activeQuestionIndex] && assignmentQuestionTemp[this.state.activeQuestionIndex].assignmentQuestion.hints
            let getNewHints = []
            if (getHints && getHints.length > 0) {
                getNewHints = getHints.map(hint => ({ ...hint, active: false }))
            }
            this.setState({ hints: getNewHints})
        }
    }

    updateAssignmentSubmittedStatus = (sessionId) => {
        const { params: { topicId } } = this.props.match
        const { isAssignmentAttempted } = this.state
        const input = {
            isAssignmentAttempted,
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

    updateInitialCodestring = () => {
        const assignmentQuestions = sortBy(
            this.getAssignmentQuestion(this.props.userAssignment.toJS().map(assignment => get(assignment, 'assignment'))[0]),
            'order'
            )
        if(assignmentQuestions.length > 0) {
            const codeString = assignmentQuestions[this.state.activeQuestionIndex].userAnswerCodeSnippet
            const initialCodeString = this.state.initialCodeString
            if(!initialCodeString && codeString){
                this.setState({
                    initialCodeString: codeString
                })
            }
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.location.search !== prevProps.location.search) {
            const questionNumber = this.props.location.search.split('=')[1] || 1
            this.setState({ activeQuestionIndex: questionNumber - 1  })
        }
        
       
        // if the active question index is changed then set false to the the saveCode and showSave
        if (this.state.activeQuestionIndex && (this.state.activeQuestionIndex !== prevState.activeQuestionIndex)) {
            this.setState({
                isSave: false,
                showSave: false
            })
        }
        
        const { path, params: { topicId, courseId } } = this.props.match
        const {
            dumpCodingStatus,
            mentorMenteeSession,
            userAssignment,
            mentorMenteeSessionUpdateStatus
        } = this.props
        let assignmentQuestions = null

        if (this.props.userAssignment && this.props.userAssignment.toJS()) {
            this.updateInitialCodestring()
        }
        if(this.state.activeQuestionIndex !== prevState.activeQuestionIndex) {
            this.getAssignmentHints(path, courseId)
            this.setState({
                initialCodeString: '' 
            })
            if (userAssignment !== prevProps.userAssignment && userAssignment) {
                this.updateInitialCodestring()
            }

            this.setState({ isSeeAnswers: false })
        }
        const courseIdString = courseId ? `/:courseId` : ''
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
                    path === `/homework${courseIdString}/:topicId/codingAssignment` ||
                    path === `/revisit/homework${courseIdString}/:topicId/codingAssignment`
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
                } else if ((path === '/sessions/coding/:topicId') || (path === '/sessions/coding/:courseId/:topicId')) {
                    if (checkIfEmbedEnabled()) {
                        return goBackToTeacherApp("endSession")
                      }
                    this.endSession()
                } else if (path === `/revisit/homework${courseIdString}/:topicId/codingAssignment`) {
                    this.props.history.push(`/homework`)
                }
            } else if (dumpCodingStatus.getIn(['failure']) && !prevProps.dumpCodingStatus.getIn(['failure'])) {
                if ((path === '/sessions/coding/:topicId') || (path === '/sessions/coding/:courseId/:topicId')) {
                    if (checkIfEmbedEnabled()) {
                        return goBackToTeacherApp("endSession")
                      }
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
                if (!isMobile() || (isMobile() && assignmentQuestions && (this.state.activeQuestionIndex > assignmentQuestions.length - 1))) {
                    if (!mentorMenteeSession.getIn([0, 'isQuizSubmitted'])) {
                        if ((this.props.match.path !== '/sessions/coding/:topicId') || (this.props.match.path !== '/sessions/coding/:courseId/:topicId')) {
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
        }

        if (
            mentorMenteeSessionUpdateStatus && mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'success']) &&
            !(prevProps.mentorMenteeSessionUpdateStatus && prevProps.mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'success'])) &&
            get(this.props, 'match.path') === `/revisit/homework${courseIdString}/:topicId/codingAssignment`
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
        const courseString = courseId ? '/:courseId' : ''
        const answerInput = []
        if (assignmentQuestions) {
            const modifiedAssignmentQuestions = []
            assignmentQuestions.forEach((question, index) => {
                const { assignmentQuestion: { id }, assignmentQuestionDisplayOrder: order } = question
                const userAnswerCodeSnippet = (
                    this.state.codeStrings[`editor_${index}`] &&
                    this.state.codeStrings[`editor_${index}`].length > 0
                ) ? encodeURIComponent(this.state.codeStrings[`editor_${index}`])
                    : encodeURIComponent(question.userAnswerCodeSnippet)
                if (this.state.codeStrings[`editor_${index}`] &&
                    this.state.codeStrings[`editor_${index}`].trim() &&
                    this.state.codeStrings[`editor_${index}`].trim().length > 0) {
                    this.setState({
                        isAssignmentAttempted: true
                    })
                }
                answerInput.push({
                    assignmentQuestionConnectId: id,
                    assignmentQuestionDisplayOrder: index,
                    isAttempted: this.state.codeStrings[`editor_${index}`] ? true : false,
                    userAnswerCodeSnippet: userAnswerCodeSnippet
                })
                question.userAnswerCodeSnippet = userAnswerCodeSnippet
                modifiedAssignmentQuestions.push(question)
            })
            const tokenType = path === (`/sessions/coding${courseString}/:topicId` || '/codingAssignment/:topicId') ? 'withMenteeMentorToken' : 'withMenteeToken'
            const isHomework = this.isHomework()
            await dumpCodingAssignment(
                userId,
                topicId,
                {
                    assignmentQuestions: answerInput,
                    assignmentAction: 'next',
                    isHomework
                },
                tokenType,
                true,
                courseId
            ).call()
            duck.stale({
                root: 'userAssignment',
                key: topicId,
            })
            callback()
            // const courseIdString = courseId ? `/${courseId}` : ''
            // if (path === '/revisit/sessions/coding/:topicId') {
            //     this.props.history.push(`/revisit/homework${courseIdString}/${topicId}/quiz`)
            // } else if (path === '/codingAssignment/:topicId') {
            //     this.props.history.push(`/homework-assignment/${topicId}`)
            // } else if (path === '/homework-assignment/:topicId/') {
            //     this.props.history.push(`/quiz/${topicId}/`)
            // }
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
       this.setState(
        (prevState) => {
          return {
            prevCodeStrings: prevState.codeStrings,
            codeStrings: { ...this.state.codeStrings, [key]: codeString },
          };
        },
        () => {}
      );
    }

    checkIfHintsExists = (hints) => {
        let hintsExists = false;
        if (hints && hints.length) {
            hints.forEach(el => {
                if (el.hint) {
                    hintsExists = true
                }
            })
        }
        return hintsExists;
    }

    onToggleButtonClick = () => {
        this.setState({ isSeeAnswers: !this.state.isSeeAnswers })
    }
    getActiveQuestion = () => {
        return parseInt(this.props.history.location.search.split('=')[1]) - 1
    }
    renderShowSolutionToggle = (answerCodeSnippet) => {
        if (answerCodeSnippet && checkIfEmbedEnabled()) {
            if (!isAccessingTrainingResources()) return true;
            return false;
        }
        return false;
    }
    isEditorReadOnly = () => {
        if (checkIfEmbedEnabled() && this.state.isSeeAnswers) {
            if (isAccessingTrainingResources()) return false;
            return true;
        }
        return false;
    }
    renderCodingAssignment = (question, userAnswerCodeSnippet, index) => {
        if (!get(question, 'assignmentQuestion')) return <></>
        const user = this.props.loggedInUser
        const { assignmentQuestion: { id: assignmentId, statement, questionCodeSnippet, answerCodeSnippet, initialCode, editorMode }, assignmentQuestionDisplayOrder: order } = question
        const userBuddies = getBuddies(get(user.toJS(), 'buddyDetails', []))
        let codeString = userAnswerCodeSnippet
        if(userBuddies.length > 0 && (!userAnswerCodeSnippet || initialCode === userAnswerCodeSnippet)){
            codeString = this.state.codeStrings[`editor_${this.state.activeQuestionIndex}`]
        }
        const isSubmittedForReview = this.props.mentorMenteeSession && this.props.mentorMenteeSession.getIn([0, 'isSubmittedForReview'])
        const { hints, isSeeAnswers } = this.state
        const trimmedAnswerCodeSnippet = answerCodeSnippet && answerCodeSnippet !== 'null'
                                ? getString(answerCodeSnippet)
                                : ''
        return (
            <div>
                
                <div className={styles.questionContainer}>
                    
                    <div className={styles.questionStatement}>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            width: '100%',
                        }}>
                            
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
                                customStyle={{
                                    ...terminalStyles,
                                    backgroundColor: isMobile() ? '#012A38' : '#013d4e'
                                }}
                                style={darcula}
                            >
                                {getString(questionCodeSnippet)}
                            </SyntaxHighlighter>
                        )}
                    </div>
                    {this.checkIfHintsExists(hints) ? (
                        <div className={styles.hintsContainer}>
                            {hints.map((hint, idx) => (
                                <div className={styles.hintBox}>
                                    <div
                                        onClick={() => {
                                            let tempHints = hints
                                            tempHints[idx].active = !tempHints[idx].active
                                            this.setState({ hints: tempHints })
                                        }}
                                        className={styles.hintBoxPretextContainer}
                                        style={{ borderBottom: hints[idx].active ? '1px solid #E9E9E9' : 'none' }}
                                    >
                                        <div className={styles.hintBoxPretext}>
                                            <img src={bulbImage} alt='bulb' />
                                            <p>{hint.hintPretext}</p>
                                        </div>
                                        <ArrowSVG style={{ width: '10px', transform: hints[idx].active ? 'rotate(90deg)' : 'rotate(-90deg)' }} className={styles.arrowSvg} />
                                    </div>
                                    {hints[idx].active && (
                                        <div className={styles.hintTextContainer}>
                                            <TekieCEParser
                                                id={`CA-hint${idx}`}
                                                value={hint.hint}
                                                init={{ selector: `CA-hint_${idx}` }}
                                                legacyParser={(hint) => {
                                                    return parseChatMessage({hint}).map((message) => (
                                                        message.hint
                                                    ))
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : null}
                    {(this.renderShowSolutionToggle(trimmedAnswerCodeSnippet)) ? (
                        <div className={styles.questionCodeSnippet}>
                            <div className={styles.solutionToggleContainer}>
                                <ShowSolutionToggle isSeeAnswers={isSeeAnswers} handleToggleClick={this.onToggleButtonClick} />
                            </div>
                        </div>
                    ) : null}
                    <div className={cx(styles.editorContainer, checkIfEmbedEnabled() && styles.embedEditorContainer,editorMode === 'blockly' && styles.blocklyContainer)}>
                        <Editor
                            isSave={this.state.isSave}
                            showSave={this.state.showSave}
                            titleClass={isMobile() ? styles.editorTitle : null}
                            fileNameClass={isMobile() ? styles.editorfileName : null}
                            editorMode={editorMode}
                            type="assignment"
                            outputTitleBg={styles.skyBlue}
                            codeString={getString(codeString)}
                            hideEditorHeaderActions={true}
                            onOutputClick={() => {
                                this.setState({
                                    refOutputActive: this.state.refOutputActive.map((status, i) => {
                                        if (this.state.activeQuestionIndex === i) {
                                            return !status
                                        }
                                        return status
                                    })
                                })
                            }}
                            refOutputActive={editorMode ==='java' ? false : get(this.state.refOutputActive, this.state.activeQuestionIndex, false)}
                            shouldRefOutputActive
                            blocklySave={
                                (codeString) => {
                                    this.setState({
                                        codeStrings: {  [`editor_${index}`]: codeString }
                                    })
                                }
                            }
                            // runButton={styles.editorRunButton}

                            // output={styles.editorOutput}
                            // editorText={styles.editorText}
                            key={this.props.match.url + `editor_${index}`}
                            editorKey={`editor_${index}`}
                            // outputContainer={
                            //     order % 3 === 0
                            //         ? styles.lastQuestionEditorOutputContainer
                            //         : styles.editorOutputContainer
                            // }
                            lineHeight={`${isMobile() ? 90 : 30}`}
                            index={index}
                            arrowStyle={{
                                top: 15,
                                marginRight: 10
                            }}
                            interpretorStyle={{
                                marginLeft: 16,
                            }}
                            isMentor={this.props.loggedInUser.toJS().role === config.MENTOR}
                            isSeeAnswers={isSeeAnswers}
                            answerCodeSnippet={answerCodeSnippet && answerCodeSnippet !== 'null'
                                ?  getString(answerCodeSnippet)
                                : ''}
                            onChange={(codeString, key) => this.saveCode(codeString, question, index, key)}
                            initialCodeString={
                                (userAnswerCodeSnippet && userAnswerCodeSnippet !== 'null')
                                    ? (getString(codeString))
                                    : (getString(initialCode))
                            }
                            initialBlocks={
                                this.state.initialCodeString && this.state.initialCodeString !== 'null' ?
                                decodeBase64(this.state.initialCodeString) : decodeBase64(initialCode)
                            }
                            readOnly={this.isEditorReadOnly()}
                            shouldUpdate={this.state.shouldUpdate}
                            updatedSaveCode={() => this.autoSaveCode(question)}
                            isSubmittedForReview={false}
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
        const topicId = get(this.props, 'match.params.topicId')
        const courseId = get(this.props, 'match.params.courseId')
        const homeworkComponent = this.getHomeworkComponents(topicId)
        const isQuizExists = (get(homeworkComponent, 'componentName') === 'quiz')
        const courseIdString = courseId ? '/:courseId' : ''
        const session = filterKey(mentorMenteeSession, `mentorMenteeSession/${topicId}`)
        const isRevisit = path.includes('/revisit')
        if (
            (path === '/sessions/coding/:topicId') || path === '/sessions/coding/:courseId/:topicId'
        ) {
            if (this.state.activeQuestionIndex < assignmentQuestions.length - 1) {
                return (
                    <div className={cx(styles.footerContainer, checkIfEmbedEnabled() && styles.footerContainerForTeacherApp)}>
                        <div
                            className={styles.nextButtonContainer}
                            onClick={() => {
                                this.setState({ activeQuestionIndex: this.state.activeQuestionIndex + 1 })
                            }}
                        >
                            <UpdatedButton
                                text={`Next`}
                                isLoading={
                                    (dumpCodingStatus && dumpCodingStatus.getIn(['loading'])) ||
                                    this.state.fetchingMentorMenteeSession ||
                                    (
                                        (this.props.mentorMenteeSessionUpdateStatusEndSession &&
                                        this.props.mentorMenteeSessionUpdateStatusEndSession.getIn(['loading'])) ||
                                        this.props.mentorFeedbackStatus.get('loading')
                                    )
                                }
                                rightIcon>
                                <ArrowForward color='white' />
                            </UpdatedButton>
                        </div>
                    </div>
                )
            }

            return (
                <div className={cx(styles.footerContainer, checkIfEmbedEnabled() && styles.footerContainerForTeacherApp)}>
                    <div
                        className={styles.nextButtonContainer}
                        onClick={async () => {
                            if (checkIfEmbedEnabled() && !isRevisit) {
                                return goBackToTeacherApp("endSession")
                            }
                            if ((session && get(session.toJS(), '0.sessionStatus') === 'completed') && !isRevisit) {
                                if (checkIfEmbedEnabled()) {
                                    return goBackToTeacherApp("endSession")
                                }
                                await this.dumpCoding(assignmentQuestions)
                                if (!this.state.showCredentialModal) {
                                    const isCourseCompleted = await this.checkIfCourseCompleted()
                                    let loginWithCode = this.props.loggedInUser && this.props.loggedInUser.toJS() && get(this.props.loggedInUser.toJS(), 'fromOtpScreen')
                                    if (loginWithCode && !isCourseCompleted) {
                                        localStorage.setItem('showCredentialsModal', true)
                                        this.setState({
                                            showCredentialModal: true
                                        })
                                        return
                                    }
                                }
                                // this.props.history.push('/sessions')
                            } else if (isRevisit) {
                                if (checkIfEmbedEnabled()) {
                                    return goBackToTeacherApp("backToSession")
                                }
                                await this.dumpCoding(assignmentQuestions)
                                // this.props.history.push('/sessions')
                            } else this.dumpCoding(assignmentQuestions)
                        }}
                    >
                        <UpdatedButton
                            text='END SESSION'
                            type='danger'
                            isLoading={
                                (dumpCodingStatus && dumpCodingStatus.getIn(['loading'])) ||
                                this.state.fetchingMentorMenteeSession ||
                                (
                                    (this.props.mentorMenteeSessionUpdateStatusEndSession &&
                                    this.props.mentorMenteeSessionUpdateStatusEndSession.getIn(['loading'])) ||
                                    this.props.mentorFeedbackStatus.get('loading')
                                )
                            }
                           leftIcon>
                            <Power color='white' />
                        </UpdatedButton>
                    </div>
                </div>
            )
        } else if (
            (path === '/revisit/sessions/coding/:topicId') || (path === '/revisit/sessions/coding/:courseId/:topicId')
        ) {
            if (this.state.activeQuestionIndex < assignmentQuestions.length - 1) {
                return (
                    <div className={cx(styles.footerContainer, checkIfEmbedEnabled() && styles.footerContainerForTeacherApp)}>
                        <div
                            className={styles.nextButtonContainer}
                            onClick={() => {
                                this.setState({ activeQuestionIndex: this.state.activeQuestionIndex + 1 })
                            }}
                        >
                            <UpdatedButton
                                text='Next'
                                isLoading={
                                    (dumpCodingStatus && dumpCodingStatus.getIn(['loading'])) ||
                                    this.state.fetchingMentorMenteeSession ||
                                    (
                                        (this.props.mentorMenteeSessionUpdateStatusEndSession &&
                                        this.props.mentorMenteeSessionUpdateStatusEndSession.getIn(['loading'])) ||
                                        this.props.mentorFeedbackStatus.get('loading')
                                    )
                                }
                                rightIcon>
                                <ArrowForward color='white' />
                            </UpdatedButton>
                        </div>
                    </div>
                )
            }
            return (
                <div className={cx(styles.footerContainer, checkIfEmbedEnabled() && styles.footerContainerForTeacherApp)}>
                    <div
                        className={styles.nextButtonContainer}
                        onClick={async () => {
                            if (checkIfEmbedEnabled()) {
                                return goBackToTeacherApp("backToSession")
                            }
                            if ((session && get(session.toJS(), '0.sessionStatus') === 'completed') || isRevisit) {
                                await this.dumpCoding(assignmentQuestions)
                                // this.props.history.push('/sessions')
                            } else this.dumpCoding(assignmentQuestions)
                        }}
                    >
                        {/* <NextButton
                            title={`${checkIfEmbedEnabled() ? `Back to ${getEmbedData("backToPage")}` : 'Back to Sessions'}`}
                            loading={dumpCodingStatus && dumpCodingStatus.getIn(['loading'])}
                        /> */}
                        <UpdatedButton
                            text={`${checkIfEmbedEnabled() ? `Back to ${getEmbedData("backToPage")}` : 'Back to Sessions'}`}
                            isLoading={dumpCodingStatus && dumpCodingStatus.getIn(['loading'])}
                        rightIcon><ArrowForward color='white'/></UpdatedButton>
                    </div>
                </div>
            )

        } else if (
            path === `/homework${courseIdString}/:topicId/codingAssignment` ||
            path === `/revisit/homework${courseIdString}/:topicId/codingAssignment`
        ) {
            if (!isSubmittedForReview && !checkIfEmbedEnabled()) {
                return (
                    <div className={cx(styles.footerContainer, checkIfEmbedEnabled() && styles.footerContainerForTeacherApp)}>
                        <div className={styles.submitButtonContainer}>
                            <div
                                onClick={async () => {
                                    if (this.state.activeQuestionIndex < assignmentQuestions.length - 1) {
                                        if (isMobile()) {
                                            await this.dumpCoding(assignmentQuestions)
                                        }
                                        this.setState({ activeQuestionIndex: this.state.activeQuestionIndex + 1 })
                                        return
                                    } else if (!homeworkComponent && isMobile()) {
                                        await this.dumpCoding(assignmentQuestions)
                                        this.submitForReview()
                                        return
                                    } else {
                                        this.dumpCoding(assignmentQuestions)
                                    }
                                }}
                            >
                                <UpdatedButton onBtnClick={() => { }} text={(this.state.activeQuestionIndex < assignmentQuestions.length - 1) ? 'Next' : ((!homeworkComponent && isMobile()) ? 'Submit For Review' : 'Save')}  isLoading={
                                        (dumpCodingStatus && dumpCodingStatus.getIn(['loading'])) ||
                                        (
                                            mentorMenteeSessionUpdateStatus &&
                                            mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${get(this.props, 'match.params.topicId')}`, 'loading'])
                                        )
                                    } rightIcon><ArrowForward color='white'/></UpdatedButton>
                                {/* <NextButton
                                    title={(this.state.activeQuestionIndex < assignmentQuestions.length - 1) ? 'Next' : ((!homeworkComponent && isMobile()) ? 'Submit For Review' : 'Save')}
                                    loading={
                                        (dumpCodingStatus && dumpCodingStatus.getIn(['loading'])) ||
                                        (
                                            mentorMenteeSessionUpdateStatus &&
                                            mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${get(this.props, 'match.params.topicId')}`, 'loading'])
                                        )
                                    }
                                /> */}
                            </div>
                        </div>
                    </div>
                )
            } else {
                if (path === `/homework/:courseId/:topicId/codingAssignment` ||
                    path === `/revisit/homework/:courseId/:topicId/codingAssignment`) {
                    if (this.state.activeQuestionIndex < assignmentQuestions.length - 1) {
                        return (
                            <div className={cx(styles.footerContainer, checkIfEmbedEnabled() && styles.footerContainerForTeacherApp)}>
                                <div
                                    className={styles.nextButtonContainer}
                                    onClick={() => {
                                        this.setState({ activeQuestionIndex: this.state.activeQuestionIndex + 1 })
                                    }}
                                >
                                    <UpdatedButton
                                        text='Next'
                                        isLoading={
                                            (dumpCodingStatus && dumpCodingStatus.getIn(['loading'])) ||
                                            this.state.fetchingMentorMenteeSession ||
                                            (
                                                (this.props.mentorMenteeSessionUpdateStatusEndSession &&
                                                this.props.mentorMenteeSessionUpdateStatusEndSession.getIn(['loading'])) ||
                                                this.props.mentorFeedbackStatus.get('loading')
                                            )
                                        }
                                        rightIcon>
                                        <ArrowForward color='white' />
                                    </UpdatedButton>
                                </div>
                            </div>
                        )
                    }
                    return (
                        <div className={cx(styles.footerContainer, checkIfEmbedEnabled() && styles.footerContainerForTeacherApp)}>
                            <div className={cx({
                                [styles.submitButtonContainer]: true,
                            })}>
                                <div
                                    onClick={() => {
                                        if(checkIfEmbedEnabled()){
                                            return goBackToTeacherApp("backToSession")
                                        }
                                        if (isQuizExists) {
                                            this.props.history.push(`/homework/${courseId}/${get(this.props, 'match.params.topicId')}/quiz`)
                                        } else {
                                            this.props.history.push('/homework')
                                        }
                                    }}
                                >
                                    <UpdatedButton
                                        text={isQuizExists ? 'Go to Quiz Assignment' : checkIfEmbedEnabled() ? `Back to ${getEmbedData("backToPage")}` : 'Back to Homework'}
                                    rightIcon><ArrowForward color='white'/></UpdatedButton>
                                </div>
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
            let firstComponent = this.props.location.state && this.props.location.state.firstComponent
            if (!firstComponent && localStorage.getItem('firstComponent')) firstComponent = getFirstComponentFromLocalStorage();
            const componentName = get(firstComponent, 'componentName', '')
            const childComponentName = get(firstComponent, 'childComponentName', null)
            return (
                <div className={cx(styles.footerContainer, checkIfEmbedEnabled() && styles.footerContainerForTeacherApp)}>
                    <div className={
                        cx({
                            [styles.submitButtonContainer]: true,
                        })}>
                        <div
                            onClick={() => {
                                if (isQuizExists) {
                                    this.props.history.push({
                                        pathname: `/sessions/${courseId}/${this.props.match.params.topicId}/quiz`,
                                        state: {
                                            quizReportTopicId: this.getQuizReportId(),
                                            firstComponent: (this.props.location.state && this.props.location.state.firstComponent) || getFirstComponentFromLocalStorage()
                                        }
                                    })
                                } else if (componentName === 'blockBasedProject') {
                                    this.props.history.push(`/sessions/project/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId')}`)
                                } else if (componentName === 'blockBasedPractice') {
                                    this.props.history.push(`/sessions/practice/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId')}`)
                                } else if (componentName === 'learningObjective') {
                                    this.props.history.push(`/sessions/${getLORedirectKey({ componentName: childComponentName })}/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId')}`)
                                } else {
                                    this.props.history.push(`/sessions/video/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId', null) || ''}`)
                                }
                            }}
                        >
                            <NextButton
                                title='Next'
                            />
                        </div>
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
        if (assignments && assignments.length) {
            assignments.map((assignment, index) => {
                if (
                    this.isHomework()
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
        }
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
    checkIfQuestionIsAttempted = (id) => {
        return get(this.props.homeWorkMeta.toJS(), `${HOMEWORK_COMPONENTS_CONFIG.homeworkAssignment}.attemptedIds`, []).includes(id)
    }

    getActiveProgressPercentage = (questions, activeQuestionIndex) => {
        const totalQuestions = (questions && questions.length) || 0
        return `${((activeQuestionIndex) * 100) / (totalQuestions - 1)}%`
    }
    isHomework = () => {
        // check if homework includes in path name
        const path = this.props.location.pathname
        return path.includes('homework') || this.getQuizReportId() || false;
    }
    render() {
        const {
            userAssignment, userAssignmentStatus,
            dumpCodingStatus, mentorMenteeSession,
        } = this.props
        const path = this.props.match.path
        const courseId = get(this.props, 'match.params.courseId')
        const courseString = courseId ? '/:courseId' : ''
        const isHomework = this.isHomework()
        const isSubmittedForReview = mentorMenteeSession && mentorMenteeSession.getIn([0, 'isSubmittedForReview'])
        const user = this.props.loggedInUser
        const userBuddies = getBuddies(get(user.toJS(), 'buddyDetails', []))
        const isLoading = userBuddies && userBuddies.length > 0 ?  this.state.isBuddyLoading : userAssignmentStatus && userAssignmentStatus.getIn(['loading'])
        let assignmentQuestions = null
        const { activeQuestionIndex } = this.state
        if (userAssignment.getIn([0]) && userAssignment.getIn([0]).toJS()['assignment'] && !isLoading) {
            assignmentQuestions = sortBy(
                this.getAssignmentQuestion(this.props.userAssignment.toJS().map(assignment => get(assignment, 'assignment'))[0]),
                'order'
            )
            if (!assignmentQuestions || assignmentQuestions.length < 1) {
                return <div />
            }
            if (assignmentQuestions && assignmentQuestions.length > 0) {
                assignmentQuestions = assignmentQuestions.filter(question => {
                    return get(question, 'assignmentQuestion.isHomework') === !!isHomework
                })
            }
        }
        return (
            <>
                <div style={{ marginBottom: checkIfEmbedEnabled() ?  isHomework ? '' : '100px' : '' }}>
                    <div>
                        {/* <UpdatedSideNavBar
                            mobileNav
                            parent={(isHomework && !this.getQuizReportId()) ? 'homework' : 'sessions'}
                            revisitRoute={this.props.match.path.includes('/revisit')}
                            computedMatch={this.props.computedMatch || this.props.match}
                            pageTitle="Assignment"
                            showSubmitOverlay={submitForReviewFn => this.submitForReview = submitForReviewFn}
                        /> */}
                        {isLoading && (
                            <Skeleton isMobile={isMobile()} />
                        )}
                        {(assignmentQuestions && assignmentQuestions.length && !isLoading) ? (
                            <div
                                style={{ marginTop: checkIfEmbedEnabled() ? '' : `${isMobile() ? '65px' : `${(assignmentQuestions.length > 1) ? '120px' : '30px'}`}` }}
                                className={`${isHomework ? 'homework-' : ''}codingAssignment-page-mixpanel-identifier`}
                            >
                                <PreserveState
                                    state={this.state}
                                    setState={(state, callback = () => { }) => {
                                        this.setState({
                                             ...state,
                                            fetchingMentorMenteeSession: false,
                                        },
                                            callback)
                                    }}
                                    persistIf={id => {
                                        return false
                                    }}
                                    key={this.props.match.url}
                                    saveIf={this.state}
                                    id={this.props.match.url}
                                    preserveScroll={['tk-route-container']}
                                />
                                {(assignmentQuestions.length > 1) && (
                                    <div className={classNames({
                                        [pqStyles.questionAreaContainer]: !isMobile(),
                                        [pqStyles.mbQuestionAreaContainer]: isMobile()
                                    })}>
                                        <div className={classNames({
                                            [pqStyles.questionNumberContainer]: !isMobile(),
                                            [pqStyles.mbQuestionNumberContainer]: isMobile(),
                                            [pqStyles.codingQuestionNumberContainerForTeacherApp]: checkIfEmbedEnabled()
                                        })} style={{ marginTop: `${checkIfEmbedEnabled() ? '0' : ''}` }}>
                                            {!isMobile() && (
                                                <div
                                                    onClick={() => {
                                                        if (activeQuestionIndex > 0) {
                                                            this.setState({ activeQuestionIndex: activeQuestionIndex - 1 })

                                                        }
                                                    }}
                                                    className={pqStyles.arrowSVGContainer}
                                                >
                                                    <ArrowSVG
                                                        className={cx({
                                                            [pqStyles.arrowSVG]: true,
                                                            [pqStyles.disabled]: activeQuestionIndex === 0
                                                        })} />
                                                </div>
                                            )}
                                            <div className={pqStyles.indicatorContainer} style={{
                                                paddingLeft: `${isMobile() ? 0 : ''}`
                                            }}>
                                                {assignmentQuestions &&
                                                    assignmentQuestions.map((question, index) => {
                                                        const { assignmentQuestionDisplayOrder: order, userAnswerCodeSnippet } = question
                                                        let questionStatus = false
                                                        if (this.state.codeStrings[`editor_${index}`] && this.state.codeStrings[`editor_${index}`].trim()) {
                                                            questionStatus = (this.state.codeStrings[`editor_${index}`].trim().length !== 0)
                                                        }
                                                        if (userAnswerCodeSnippet && userAnswerCodeSnippet !== 'null') {
                                                            questionStatus = true
                                                        }
                                                        return (
                                                            <motion.div
                                                                whileTap={{
                                                                    scale: questionStatus ? 1 : 0.8
                                                                }}
                                                                className={cx({
                                                                    [quizStyles.activeCircle]: (activeQuestionIndex === index),
                                                                    // [styles.inActiveCircle]: isMobile() && (activeQuestionIndex !== index),
                                                                    [quizStyles.circle]: true, [quizStyles.unAttemptedCircle]: isHomework ? 
                                                                                                                    !this.checkIfQuestionIsAttempted(get(question, 'assignmentQuestion.id'))
                                                                                                                    : !questionStatus ,
                                                                })}
                                                                style={{
                                                                    cursor: 'pointer'
                                                                }}
                                                                key={question.id}
                                                                onClick={() => {
                                                                    if (isMobile() && !isSubmittedForReview) {
                                                                        this.dumpCoding(assignmentQuestions)
                                                                    }
                                                                    this.changeQuestion(index)
                                                                }}
                                                            >
                                                                <div
                                                                   className={cx({
                                                                        [pqStyles.unAttemptedQuestionIcon]: (isSubmittedForReview && !questionStatus),
                                                                    })}
                                                                />
                                                                <div className={cx({
                                                                    [pqStyles.activeBorder]: (activeQuestionIndex === index),
                                                                })} />
                                                                {index + 1}
                                                            </motion.div>
                                                        )
                                                    })
                                                }
                                                {!isMobile() ? (
                                                    <div className={pqStyles.inActiveProgressBar}>
                                                        <div
                                                            className={pqStyles.activeProgressBar}
                                                            style={{
                                                                width: this.getActiveProgressPercentage(assignmentQuestions, activeQuestionIndex)
                                                            }}
                                                        />
                                                    </div>
                                                ) : <span />}
                                            </div>
                                            {!isMobile() && (
                                                <div
                                                    style={{ marginLeft: 22, transform: 'scaleX(-1)' }}
                                                    onClick={() => {
                                                        if ((activeQuestionIndex < assignmentQuestions.length - 1)) {
                                                            this.setState({
                                                                activeQuestionIndex: activeQuestionIndex + 1
                                                            })
                                                        }
                                                    }}
                                                    className={pqStyles.arrowSVGContainer}
                                                >
                                                    <ArrowSVG
                                                        className={cx({
                                                            [pqStyles.arrowSVG]: true,
                                                            [pqStyles.disabled]: activeQuestionIndex === assignmentQuestions.length - 1,
                                                        })}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div style={{
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    zIndex: 20,
                                    marginBottom: '90px',
                                    paddingBottom: checkIfEmbedEnabled() ? hs(100) : '',
                                }}>
                                    {
                                        this.renderCodingAssignment(
                                            assignmentQuestions[this.state.activeQuestionIndex],
                                            assignmentQuestions[this.state.activeQuestionIndex] && assignmentQuestions[this.state.activeQuestionIndex].userAnswerCodeSnippet,
                                            this.state.activeQuestionIndex
                                        )
                                    }
                                    {
                                        (!isLoading && assignmentQuestions)
                                            ? (
                                                <NextFooter
                                                    match={this.props.match}
                                                    topicId={this.props.topicId}
                                                    url={this.props.match.url}
                                                    lastItem={this.state.activeQuestionIndex === assignmentQuestions.length - 1}
                                                    nextItem={() => {
                                                        this.changeQuestion( this.state.activeQuestionIndex + 1)
                                                    }}
                                                    dumpSession={() => this.dumpCoding(assignmentQuestions)}
                                                    saveHomework={() => this.dumpCoding(assignmentQuestions)}
                                                    classwork={!isHomework} 
                                                    footerFrom='codingAssignment'
                                                />
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
                                {/* {((this.props.match.path === '/sessions/coding/:topicId') || (this.props.match.path === '/sessions/coding/:courseId/:topicId')) && (
                                    <MentorFeedback
                                        sessionId={this.props.mentorMenteeSessionEndSession.getIn([0, 'id'])}
                                        postSubmit={async () => {
                                            const isCompleted = await this.checkIfCourseCompleted()
                                            let loginWithCode = this.props.loggedInUser && this.props.loggedInUser.toJS() && get(this.props.loggedInUser.toJS(), 'fromOtpScreen')
                                            if (loginWithCode && !isCompleted && !this.state.showCredentialModal) {
                                                localStorage.setItem('showCredentialsModal', true)
                                                this.setState({
                                                    showCredentialModal: true
                                                })
                                                return
                                            }
                                            if (isCompleted) {
                                                localStorage.setItem('showCourseCompletionCertificateModal', 'show')
                                            }
                                            // this.props.history.push('/sessions')
                                        }}
                                    />
                                )} */}
                            </div>
                        ) : null}
                    </div>
                </div>
               
            </>
        )
    }
}

export default withArrowScroll(CodingAssignment, 'tk-route-container')