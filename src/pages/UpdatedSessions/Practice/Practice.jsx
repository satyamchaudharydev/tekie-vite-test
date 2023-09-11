/* eslint-disable jsx-a11y/iframe-has-title */
import React, { Component } from 'react'
import cx from 'classnames'
import videoStyles from '../Video/Video.module.scss'
import { get, merge, some } from 'lodash'
import duck from '../../../duck'
import { filterKey, getDataFromLocalStorage, minCap } from '../../../utils/data-utils'
import getPath from '../../../utils/getPath';
import fetchBadge from '../../../queries/fetchBadge'
import codingStyles from '../../UpdatedCodingAssignment/CodingAssignment.module.scss'
import pqStyles from '../PracticeQuiz/components/QuestionArea/QuestionArea.module.scss'
import ArrowSVG from '../../../assets/arrowIcon'
import fetchMentorMenteeSession from '../../../queries/sessions/fetchMentorMenteeSession'
import updateMentorMenteeSession from '../../../queries/sessions/updateMentorMenteeSession'
import fetchMentorFeedback from '../../../queries/fetchMentorFeedback'
import dumpBlockBasedPractice from '../../../queries/dumpBlockBasedPractice'
import store from '../../../store'
import { fromJS, Map } from 'immutable'
import gql from 'graphql-tag'
import requestToGraphql from '../../../utils/requestToGraphql'
import BadgeModal from '../../Achievements/BadgeModal'
import MentorFeedback from '../../../components/MentorFeedback'
import Skeleton from './skeleton'
import './Practice.scss'
import fetchMenteeCourseSyllabus from '../../../queries/sessions/fetchMenteeCourseSyllabus'
import { AnimatePresence, motion } from 'framer-motion'
import { getFirstComponentFromLocalStorage, getInSessionRoute, getLORedirectKey, getPreviousTopicIdFromLocalStorage } from '../utils'
import { NextButton } from '../../../components/Buttons/NextButton'
import parseMetaTags from '../../../utils/parseMetaTags'
import TekieCEParser from '../../../components/Preview'
import { sort } from '../../../utils/immutable'
import isMobile from '../../../utils/isMobile'
import UpdatedSideNavBar from '../../../components/UpdatedSideNavBar'
import Editor from '../../Editor/EditorPage'
import CredentialsPopup from '../../Signup/schoolLiveClassLogin/components/CredentialsPopup/CredentialsPopup'
import mentorMenteeSessionAddOrDelete from '../../../utils/mmSessionAddOrDelete'
import { checkIfEmbedEnabled, getEmbedData, isAccessingTrainingResources } from '../../../utils/teacherApp/checkForEmbed'
import IframeContent from '../../../components/IframeContent/IframeContent'
import { ViewIcon } from '../../../constants/icons'
import UpdatedButton from '../../../components/Buttons/UpdatedButton/UpdatedButton'
import PracticeSubmission from './component/PracticeSubmission'
import FooterBtnSkeleton from '../Video/footerBtnSkeleton'
import fetchComponents from '../../../queries/fetchComponents'
import { HOMEWORK_COMPONENTS_CONFIG, TOPIC_COMPONENTS } from '../../../constants/topicComponentConstants'
import goBackToTeacherApp from '../../../utils/teacherApp/goBackToTeacherApp'
import NextFooter from '../../../components/NextFooter'
import CorrectAnswerModal from './component/CorrectAnswerModal'
import getMe from '../../../utils/getMe'
import documentLogo from './assets/documentLogo.png'
import sheetsLogo from './assets/sheetsLogo.png'
import slidesLogo from './assets/slidesLogo.png'
import { Prompt } from 'react-router-dom'
import { fetchHomeworkDetails, filteredComponentsLink, updateHomeworkAttempted } from '../../../components/NextFooter/utils'
import gsuiteQueries, { updatingIsGsuiteFileVisitedQuery } from './utils/gsuiteQueries'
import { gsuiteQueriesVariables } from '../../../constants/gsuite'
import { backToPageConst } from '../../TeacherApp/constants'
import updateSessionComponentTracker from '../../../queries/updateSessionComponentTracker'
import batchSession from '../../../queries/teacherApp/fetchBatchSession'
import updatedBatchSession from '../../../queries/teacherApp/fetchBatchSessionUpdated'
import CanvaSSOComponent from "../PracticeQuiz/components/CanvaSignIn";

// import tekieLoader from '../../../assets/tekieLoader.gif'
const initBeforeUnLoad = (showExitPrompt) => {
    window.onbeforeunload = (event) => {
      // Show prompt based on state
      if (showExitPrompt) {
        const e = event || window.event;
        e.preventDefault();
        if (e) {
          e.returnValue = "";
        }
        return "";
      }
    };
  };
class Practice extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            activeState: null,
            projectLink: '',
            activeQuestionIndex: 0,
            projectLinkSubmitted: false,
            editProjectLink: false,
            isProjectPreviewModalVisible: false,
            blockBasedPractices: null,
            isBadgeModalVisible: false,
            savedBlocks: '',
            showCredentialModal: false,
            startTime: null,
            isSeeAnswerVisible: false,
            fileLink: "",
            nextLoading: false,
            isGsuiteFileVisited: false,
            countingSecond: 5,
            gsuitePopup: '',
            reAttemptGsuiteFile: {},
            gsuiteFile:{},
            isGsuiteReattemptClicked: false,
            mimeType:'',
            isButtonLoading: false,
            isRedirectedFromDelete: false,
            isReAttemptButtonLoading: false,
            creatingFile: false,
            isModalOpen: false,
            isKeepTheSameLoading: false,
            isConfirmButtonClicked: false,
            gsuiteLastRevision: {},
            isSubmissionButtonClicked: false,
        };
        this.initialBlocks = ''
        this.savedBlocks = ''
        this.canvaSSORef = React.createRef();
    }


    getQuizReportId = () => {
        const quizReportTopicId = (this.props.location.state && this.props.location.state.quizReportTopicId ) || getPreviousTopicIdFromLocalStorage()
        if (quizReportTopicId && (this.props.match.path === '/sessions/:courseId/:topicId/:projectId/practice')) {
            return quizReportTopicId
        }
        return null
    }

    async componentDidMount () {
         if(this.props.location.search){
            const questionNumber = this.props.location.search.split('=')[1]
            if(questionNumber){
                this.setState({activeQuestionIndex: parseInt(questionNumber) - 1})
            }
        }
        initBeforeUnLoad(this.state.isGsuiteReattemptClicked)
        let isHomeworkActive = false
        const quizReportTopicId = (this.props.location.state && this.props.location.state.quizReportTopicId) || getPreviousTopicIdFromLocalStorage()
        if (((this.props.match.path = '/homework/:courseId/:topicId/:projectId/practice') || (this.props.match.path = '/sessions/:courseId/:topicId/:projectId/practice')) &&
            !this.props.match.url.includes('/sessions/practice/')) {
            isHomeworkActive = true
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
        this.setState({
            isHomeworkActive,
        })
        await this.fetchBlockBasedDataBasedOnType(isHomeworkActive)
        const { topicId } = this.props.match.params
        const menteeId = this.props.userId
        const mmsStatus = isHomeworkActive ? 'completed' : 'started';
        mentorMenteeSessionAddOrDelete(menteeId, quizReportTopicId || topicId, '', mmsStatus, 'other', () => fetchMentorMenteeSession(
            null,
            null,
            menteeId,
            'menteeTopicFilter',
            null,
            true,
            quizReportTopicId || topicId,
            null
        ).call())
        let showCredentialModalStatus = localStorage.getItem('showCredentialsModal')
        if (showCredentialModalStatus) {
            this.setState({
                showCredentialModal: true
            })
        }
        let isGsuiteFileVisitedValue = this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.getIn([0, 'isGsuiteFileVisited'])
        if(isGsuiteFileVisitedValue)
            this.setState({isGsuiteFileVisited: true})
        const gsuite = this.state.blockBasedPractices
        let mimeTypeData
        if (gsuite){
            if(get(gsuite,'gsuiteFileType')){
                mimeTypeData = get(gsuite,'gsuiteFileType')
                this.setState({mimeType: mimeTypeData})
            }else if(get(gsuite,'gsuiteTempleteURL')){
                const gsuiteTempleteURL = get(gsuite,'gsuiteTempleteURL')
                mimeTypeData = gsuiteTempleteURL && gsuiteTempleteURL.split('/')[3]
                this.setState({mimeType: mimeTypeData})
            }else {
                this.setState({mimeType: ''})
            }
        }
        const userBlockBasedPractice = this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.toJS()
        const userBlockBasedPracticeId = this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.getIn([0, 'id'])
        if(get(userBlockBasedPractice,'[0].answerLink') && get(this.state.blockBasedPractices,'layout')==='gsuite'){
            this.updatingIsGsuiteFileVisitedQuery(userBlockBasedPracticeId,true)
        }
    }

    updateAuthorsArray = async () => {
        const { buddyStudents } = getMe()
        const userBlockBasedPracticeId =  this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.getIn([0, 'id'])
        const authorsData = this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.getIn([0, 'authors']) && this.props.userBlockBasedPractices.getIn([0, 'authors']).toJS()
        const buddyStudentsIDs = buddyStudents && buddyStudents.map((buddy) => get(buddy,'id'))
        const unwantedStudentData = authorsData && (buddyStudents ? authorsData.filter(author => !buddyStudentsIDs.includes(author.id)) : authorsData)
        if(unwantedStudentData){
            unwantedStudentData.map(data => requestToGraphql(gql`
            mutation {
                removeFromUserBlockBasedPracticeAuthor(userBlockBasedPracticeId: "${userBlockBasedPracticeId}", userId: "${data.id}") {
                  userBlockBasedPractice {
                    authors{
                        id
                        name
                    }
                  }
                }
              }
            `))
        
            const res = await gsuiteQueries(gsuiteQueriesVariables.UPDATE_AUTHORS_DATA,{userBlockBasedId:userBlockBasedPracticeId,buddyStudentsIDs,props:this.props,activeQuestionIndex:this.state.activeQuestionIndex})
        
            let { allBlockBasedPractice, match } = this.props
            allBlockBasedPractice = (allBlockBasedPractice && allBlockBasedPractice.toJS()) || []
            const topicId = get(match, 'params.topicId')
            const practiceId = get(match, 'params.projectId')
            const type = this.state.isHomeworkActive ? HOMEWORK_COMPONENTS_CONFIG.homeworkPractice : TOPIC_COMPONENTS.blockBasedPractice
            const currentBlockBasedPractice = allBlockBasedPractice.find(practice => get(practice, 'blockBasedPractice.id') === practiceId)
            const filteredBlockBasedPractices = allBlockBasedPractice.filter(practice => get(practice, 'blockBasedPractice.id') !== practiceId)
            if (currentBlockBasedPractice) {
                filteredBlockBasedPractices.push({ ...currentBlockBasedPractice, 
                    authors: res.data.updateUserBlockBasedPractice.authors,
                })
                duck.merge(() => ( {
                    userBlockBasedPractices: filteredBlockBasedPractices
                }), {
                    key: `${topicId}/${type}/${this.props.userId}`
                })                
            }
        }
    }

    handelIsSubmissionButtonClicked = () => {
        this.checkIfPracticeAttempted()
        this.setState({isSubmissionButtonClicked:true})
    }

    updatePracticeSubmittedStatus = () => {
        const { params: { topicId } } = this.props.match
        const { mentorMenteeSession } = this.props
        const input = {
            isPracticeSubmitted: true,
            practiceSubmitDate: new Date(new Date().setHours(0, 0, 0, 0))
        }
        let sessionId = null
        if (mentorMenteeSession && mentorMenteeSession.toJS().length > 0) {
            mentorMenteeSession.toJS().forEach((session) => {
                if (session.topicId === topicId) {
                    sessionId = session.id
                }
            })
        }
        if (sessionId) {
            updateMentorMenteeSession(
                sessionId,
                input,
                topicId,
                true
            ).call()
        }
    }
    // updating project link form input
    updateProjectLink = (projectLink) => {
        this.setState({
            projectLink
        })
    }
    
    fetchBlockBasedDataBasedOnType = async (isHomework = false) => {
        this.setState({
            isLoading: true,
            startTime: null,
        })
        let { courseId, projectId, topicId } = this.props.match.params
        
        await fetchComponents(topicId, courseId).components([
            {   type: isHomework ? 
                TOPIC_COMPONENTS.homeworkPractice : 
                TOPIC_COMPONENTS.blockBasedPractice 
            },
        ])

        let updateObj = {}
        if (this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.getIn([0, 'answerLink']) && this.props.userBlockBasedPractices.getIn([0, 'answerLink']) !== '' && this.props.userBlockBasedPractices.getIn([0, 'blockBasedPractice']).toJS().layout === 'externalPlatform') {
            updateObj = {
                activeState: 'started',
                projectLink: this.props.userBlockBasedPractices.getIn([0, 'answerLink']),
                projectLinkSubmitted: true,
                layout: this.props.userBlockBasedPractices.getIn([0, 'blockBasedPractice']).toJS().layout
            }
        } else if (
            (this.props.userBlockBasedPractices
             && this.props.userBlockBasedPractices.getIn([0, 'blockBasedPractice'])) 
             &&  this.props.userBlockBasedPractices.getIn([0, 'blockBasedPractice']).toJS().layout === 'playground') {
            updateObj = {
                activeState: 'started',
                savedBlocks: this.props.userBlockBasedPractices.getIn([0, 'savedBlocks']),
                layout: this.props.userBlockBasedPractices.getIn([0, 'blockBasedPractice']).toJS().layout
            }
            this.initialBlocks = this.props.userBlockBasedPractices.getIn([0, 'blockBasedPractice']).toJS().initialBlocks
            this.savedBlocks = this.props.userBlockBasedPractices.getIn([0, 'savedBlocks'])
        }
        if ((this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.getIn([0]))&& this.props.userBlockBasedPractices.getIn([0]).toJS().startTime) {
            updateObj['startTime'] = this.props.userBlockBasedPractices.getIn([0]).toJS().startTime
        } else {
            updateObj['startTime'] = new Date().toISOString()
        }
        const userTopicJourneyPractices = this.getBlockBasedPracticesArr()
        if (userTopicJourneyPractices && userTopicJourneyPractices.length) {
            const { activeQuestionIndex } = this.state
            const practiceIndex = userTopicJourneyPractices.findIndex(practice => get(practice, 'id') === projectId)
            if (activeQuestionIndex !== practiceIndex) {
                updateObj['activeQuestionIndex'] = practiceIndex
            }
        }
        
        this.setState({
            isLoading: false,
            userBlockBasedPracticeId: this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.getIn([0, 'id']),
            blockBasedPractices: this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.getIn([0, 'blockBasedPractice']) && this.props.userBlockBasedPractices.getIn([0, 'blockBasedPractice']).toJS(),
            gsuiteFile: this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.getIn([0, 'gsuiteFile']) && this.props.userBlockBasedPractices.getIn([0, 'gsuiteFile']).toJS(),
            gsuiteLastRevision: this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.getIn([0, 'gsuiteLastRevision']) && this.props.userBlockBasedPractices.getIn([0, 'gsuiteLastRevision']).toJS(),
            isGsuiteFileVisited:this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.getIn([0, 'isGsuiteFileVisited']) ? this.props.userBlockBasedPractices.getIn([0, 'isGsuiteFileVisited']) : false,
            ...updateObj
        })
        this.updateCache()
    }

    async componentDidUpdate(prevProps,prevState) {
        const { projectId, topicId, courseId } = this.props.match.params
        if(this.props.location.search !== prevProps.location.search) {
            const questionNumber = this.props.location.search.split('=')[1]
            this.setState({ activeQuestionIndex: questionNumber - 1  })
        }
        if (prevProps.match.params.projectId !== projectId) {
            this.setState({
                projectLink: '',
                projectLinkSubmitted: false,
                editProjectLink: false,
                activeState: null,
            })
            let isHomeworkActive = false
            if (((this.props.match.path = '/homework/:courseId/:topicId/:projectId/practice') || (this.props.match.path = '/sessions/:courseId/:topicId/:projectId/practice')) &&
                !this.props.match.url.includes('/sessions/practice/')) {
                isHomeworkActive = true
            }
            this.setState({
                isHomeworkActive,
            })
            await this.fetchBlockBasedDataBasedOnType(isHomeworkActive)
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
                            session.practiceSubmitDate = new Date(new Date().setHours(0, 0, 0, 0))
                            session.isPracticeSubmitted = true
                            modifiedSession[index] = session
                        }
                    })
                    duck.merge(() => ({
                        mentorMenteeSession: modifiedSession
                    }))
                }
                if (!mentorMenteeSession.getIn([0, 'isPracticeSubmitted'])) {
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
        if(
            this.state.isGsuiteReattemptClicked !== prevState.isGsuiteReattemptClicked
        ){
            initBeforeUnLoad(this.state.isGsuiteReattemptClicked)
        }
        if( this.state.activeQuestionIndex !== prevState.activeQuestionIndex){
            const gsuite = this.state.blockBasedPractices
            let { allBlockBasedPractice, match } = prevProps
            allBlockBasedPractice = (allBlockBasedPractice && allBlockBasedPractice.toJS()) || []
            const topicId = get(match, 'params.topicId')
            const practiceId = get(match, 'params.projectId')
            const type = this.state.isHomeworkActive ? HOMEWORK_COMPONENTS_CONFIG.homeworkPractice : TOPIC_COMPONENTS.blockBasedPractice
            const currentBlockBasedPractice = allBlockBasedPractice.find(practice => get(practice, 'blockBasedPractice.id') === practiceId)
            const filteredBlockBasedPractices = allBlockBasedPractice.filter(practice => get(practice, 'blockBasedPractice.id') !== practiceId)
            if (currentBlockBasedPractice) {
                filteredBlockBasedPractices.push({ ...currentBlockBasedPractice, 
                    gsuiteFile: prevState.gsuiteFile,
                })
                duck.merge(() => ( {
                    userBlockBasedPractices: filteredBlockBasedPractices
                }), {
                    key: `${topicId}/${type}/${this.props.userId}`
                })                
            }
            let mimeTypeData
            if (gsuite){
                if(get(gsuite,'gsuiteFileType')){
                    mimeTypeData = get(gsuite,'gsuiteFileType')
                    this.setState({mimeType: mimeTypeData})
                }else if(get(gsuite,'gsuiteTempleteURL')){
                    const gsuiteTempleteURL = get(gsuite,'gsuiteTempleteURL')
                    mimeTypeData = gsuiteTempleteURL && gsuiteTempleteURL.split('/')[3]
                    this.setState({mimeType: mimeTypeData})
                }else {
                    this.setState({mimeType: ''})
                }
            }
            this.setState({isGsuiteReattemptClicked: false})
        }
    }
    practiceLinkSubmission = async (projectLink) => {
        const { projectId, topicId, courseId } = this.props.match.params
        const { blockBasedPractices } = this.state
        const { layout } = blockBasedPractices
        let input = {
            answerLink : projectLink,
        }

        if (layout === 'externalPlatform') {
            if (projectLink && projectLink !== '') {
        const res = await dumpBlockBasedPractice(
            this.props.userId,
            topicId,
            projectId,
            courseId,
            input,
            true,
        ).call()
        duck.stale({
            root: 'userBlockBasedPractices',
            key: topicId + '/' + (this.state.isHomeworkActive 
                ? TOPIC_COMPONENTS.homeworkPractice
                : TOPIC_COMPONENTS.blockBasedPractice) + '/' + this.props.userId,
          })      
          this.checkIfPracticeAttempted()
        }
    }
    }

    dumpBlockBasedPractice = async (forceProjectId = false) => {
        this.setState({nextLoading: false})
        let { projectId, courseId, topicId } = this.props.match.params
        let input = { blockBasedPracticeAction: 'next' }
        if (this.state.projectLink && this.state.blockBasedPractices.layout === 'externalPlatform' && !forceProjectId) {
            input['answerLink'] = this.state.projectLink
        } else {
            input['savedBlocks'] = this.state.savedBlocks
        }
        if (forceProjectId) {
            projectId = forceProjectId
            // input['answerLink'] = ''
        }
        if (get(this.state, 'startTime')) {
            input = {
                ...input,
                startTime: get(this.state, 'startTime'),
                endTime: new Date().toISOString()
            }
        }
        input.isHomework = this.state.isHomeworkActive || false
        const res = await dumpBlockBasedPractice(
            this.props.userId,
            topicId,
            projectId,
            courseId,
            input,
            true,
        ).call()
        duck.stale({
            root: 'userBlockBasedPractices',
            key: topicId + '/' + (this.state.isHomeworkActive 
                ? TOPIC_COMPONENTS.homeworkPractice
                : TOPIC_COMPONENTS.blockBasedPractice) + '/' + this.props.userId, 
          })
        this.setState({nextLoading: false})

        this.checkIfPracticeAttempted()
    }

    getHomeworkComponents = (sessionTopicId) => {
        let { topic } = this.props
        topic = (topic && topic.toJS()) || []
        const filteredTopic = topic.filter(topicData => get(topicData, 'id') === sessionTopicId)
        if (filteredTopic && filteredTopic.length) {
            const topicComponentRuleDoc = get(filteredTopic[0], 'topicComponentRule', [])
            const sortedTopicComponentRule = topicComponentRuleDoc.sort((a, b) => a.order > b.order)
            const currentTopicComponentIndex = sortedTopicComponentRule.findIndex(el => (get(el, 'componentName') === 'homeworkPractice'))
            const nextComponent = sortedTopicComponentRule[currentTopicComponentIndex + 1]
            return nextComponent || null
        }
        return null
    }

    getNextComponent = () => {
        const { topicId, projectId } = this.props.match.params
        const topicJS = this.props.topics && this.props.topics.toJS().filter(topic => topic.id === topicId)
        const { topicComponentRule = [] } = topicJS[0] || {}
        let sortedTopicComponentRule = topicComponentRule.sort((a, b) => a.order > b.order)
        sortedTopicComponentRule = (sortedTopicComponentRule || []).filter(el => !['homeworkAssignment', 'quiz', 'homeworkPractice'].includes(get(el, 'componentName')))
        const currentTopicComponentIndex = sortedTopicComponentRule.findIndex(el => el.blockBasedProject && el.blockBasedProject.id === projectId)
        let nextComponent = null
        if (sortedTopicComponentRule[currentTopicComponentIndex + 1]) {
            nextComponent = sortedTopicComponentRule[currentTopicComponentIndex + 1]
        }
        return {
            nextComponent,
            currentComponent: sortedTopicComponentRule[currentTopicComponentIndex] || null
        }
    }
    getButtonTitle = (revisitRoute) => {
        const {nextComponent} = this.getNextComponent()
        if (nextComponent) {
            return 'Next Up'
        }
        const isRevisit = getEmbedData("isRevisit") || false;
        const isRevisitSession = ['true', true, 'True'].includes(isRevisit)
        if (checkIfEmbedEnabled() && isRevisitSession) {
            return `Back to ${getEmbedData("backToPage")}`;
        }
        if (revisitRoute) {
            if (checkIfEmbedEnabled() && isRevisitSession) {
              return `Back to ${getEmbedData("backToPage")}`;
            }
            return 'Back to Sessions'
        }
        return 'END SESSION'
    }

    updateCache = async () => {
        const { projectId, topicId } = this.props.match.params
        const { userTopicJourney } = this.props
        duck.merge(() => ({
            userTopicJourney: {
                id: topicId,
                blockBasedPractices: userTopicJourney.getIn([0, 'blockBasedPractices']) && userTopicJourney.getIn([0, 'blockBasedPractices']).toJS().map(practice => {
                    if (practice.id === projectId) {
                        return { ...practice, isUnlocked: true, }
                    }
                    return practice
                })
            }
        }))
    }
    getBlockBasedPracticesArr = () => {
        const { isHomeworkActive } = this.state
        let { topicId, projectId } = this.props.match.params
        let topicJS = this.props.topics && this.props.topics.toJS().filter(topic => topic.id === topicId)
        let sortedTopicComponentRule
        if (isHomeworkActive) {
            topicId = this.getQuizReportId() || topicId
            topicJS = this.props.topics && this.props.topics.toJS().filter(topic => topic.id === topicId)
            const topicComponentRule = (get(topicJS[0], 'topicComponentRule', []) || [])
            sortedTopicComponentRule = topicComponentRule.sort((a, b) => a.order > b.order)
            sortedTopicComponentRule = (sortedTopicComponentRule || []).filter(el => get(el, 'componentName') === 'homeworkPractice')
            return (sortedTopicComponentRule && sortedTopicComponentRule.map(el => el.blockBasedProject)) || []
        }
        let nestedPracticeArr = []
        const topicComponentRule = (get(topicJS[0], 'topicComponentRule', []) || [])
        sortedTopicComponentRule = topicComponentRule.sort((a, b) => a.order > b.order)
        if (sortedTopicComponentRule && sortedTopicComponentRule.length) {
            let tempComponentBucket = []
            sortedTopicComponentRule.forEach((componentRule, index) => {
                if (get(componentRule, 'componentName') === 'blockBasedPractice') {
                    tempComponentBucket.push(componentRule)
                } else {
                    if (tempComponentBucket.length) {
                        nestedPracticeArr.push(tempComponentBucket)
                        tempComponentBucket = []
                    }
                }
                if ((index === (sortedTopicComponentRule.length - 1)) && (sortedTopicComponentRule.length > 0)) {
                    nestedPracticeArr.push(tempComponentBucket)
                    tempComponentBucket = []
                }
            })
        }
        let practiceIdArr = nestedPracticeArr.filter(el => el.some(nestedEl => get(nestedEl, 'blockBasedProject.id') === projectId)).map(el => el && el.map(nestedEl => get(nestedEl, 'blockBasedProject.id')))[0] || []
        return (sortedTopicComponentRule && sortedTopicComponentRule.filter(el => practiceIdArr.includes(get(el, 'blockBasedProject.id'))).map(el => el.blockBasedProject)) || []
    }


    handleNext = async (isRevisit = false) => {
        const { topicId, courseId } = this.props.match.params
        const {nextComponent} = await this.getNextComponent()
        const loggedInUser = this.props.loggedInUser && this.props.loggedInUser.toJS()
        const isMentorLoggedIn = get(loggedInUser, '[0].isMentorLoggedIn', false)
        const userBlockBasedPractices = this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.toJS()
        const status = get(userBlockBasedPractices, 'status', '')
        if (!isRevisit) {
            this.dumpBlockBasedPractice()
        } else if (isRevisit && status !== 'complete') {
            this.dumpBlockBasedPractice()
        }
        duck.merge(() => ({
            userBlockBasedPractices: {
                id: this.state.userBlockBasedPracticeId,
                status: 'complete'
            },
        }))
        fetchBadge(topicId, 'blockBasedPractice', false, { courseId }).call();
        if (!nextComponent) {
            const badge = this.props.unlockBadge && filterKey(this.props.unlockBadge, `unlockBadge/blockBasedPractice/${topicId}`)
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
            const isRevisitRoute = this.props.match.path.includes('/revisit')
            const revistRoute = isRevisitRoute ? '/revisit' : ''
            if (nextComponent && nextComponent.componentName === 'blockBasedPractice') {
                this.routeToPracticeSession(get(nextComponent, 'blockBasedProject.id'))
            } else {
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
                    goToNextComponent: true,
                })
                if (redirectUrl) {
                    return this.props.history.push(redirectUrl)
                }
            }
        } else {
            const isRevisitRoute = this.props.match.path.includes('/revisit');
            if (isRevisitRoute) {
                if (checkIfEmbedEnabled()) {
                  return goBackToTeacherApp("backToSession")
                }
                return this.props.history.push('/sessions')
            }
            if (checkIfEmbedEnabled()) {
                return goBackToTeacherApp("endSession")
            }
            this.endSession()
        }
        this.checkIfPracticeAttempted()
    }
    handleHomeworkSave = async () => {
        const { topicId, projectId } = this.props.match.params
        await this.dumpBlockBasedPractice()
        duck.merge(() => ({
            userBlockBasedPractices: {
                id: this.state.userBlockBasedPracticeId,
                status: 'complete'
            },
        }))
        const topicJS = this.props.topics && this.props.topics.toJS().filter(topic => topic.id === topicId)
        const { topicComponentRule } = topicJS[0]
        let sortedTopicComponentRule = topicComponentRule.sort((a, b) => a.order > b.order)
        if (get(sortedTopicComponentRule[sortedTopicComponentRule.length - 1], 'blockBasedProject.id') !== projectId) {
            await this.dumpBlockBasedPractice(get(sortedTopicComponentRule[sortedTopicComponentRule.length - 1], 'blockBasedProject.id'))
        }
        await this.updatePracticeSubmittedStatus()
        this.checkIfPracticeAttempted()
    }

    routeToPracticeSession = (practiceId) => {
        const { topicId, courseId } = this.props.match.params
        const { isHomeworkActive } = this.state
        if (this.getQuizReportId()) {
            this.props.history.push({
                pathname: `/sessions/${courseId}/${topicId}/${practiceId}/practice`,
                state: {
                    quizReportTopicId: this.getQuizReportId(),
                    firstComponent: (this.props.location.state && this.props.location.state.firstComponent) || getFirstComponentFromLocalStorage()
                }
            })
        } else if (isHomeworkActive) {
            this.props.history.push(`/homework/${courseId}/${topicId}/${practiceId}/practice`)
        } else {
            if (get(this.props, 'match.url', '').includes('/revisit')) {
                this.props.history.push(`/revisit/sessions/practice/${courseId}/${topicId}/${practiceId}`)
                return true
            }
            this.props.history.push(`/sessions/practice/${courseId}/${topicId}/${practiceId}`)
        }
        return true
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
                    { sessionStatus: 'completed', endSessionByMentee: new Date() },
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
        if (checkIfEmbedEnabled()) {
            return goBackToTeacherApp("endSession")
          }
        this.endSession()
    }

    withHttps = (url) => url ? url.replace(/^(?:(.*:)?\/\/)?(.*)/i, (match, schemma, nonSchemmaUrl) => schemma ? match : `https://${nonSchemmaUrl}`) : '';

    appendQueryParam = (url, uniqueId) => {
        if (url) {
            if (url.includes('blockly-demo.appspot.com')) {
                return `${url}?id=${uniqueId}`;
            } else if (url.includes('/code-playground?language=')) {
                if (window && window.location && window.location.origin) {
                    return `${window.location.origin}/code-playground?language=${url.split('language=')[1] || ''}`;
                }
            }
        }
        return url;
    }

    checkIfDomainAllowed = (url) => /(code.org|blockly.games|scratch.mit|docs.google.com)/g.test(url)

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

    getActiveProgressPercentage = (userTopicJourneyPractices, blockBasedDataId) => {
        const totalQuestions = (userTopicJourneyPractices && userTopicJourneyPractices.length) || 0
        const activeIndex = userTopicJourneyPractices.findIndex(el => get(el, 'id') === blockBasedDataId)
        return `${((activeIndex) * 100) / (totalQuestions - 1)}%`
    }

    getButtons = () => {
        const {
            mentorMenteeSession,
            mentorMenteeSessionUpdateStatus
        } = this.props
        const { projectId, courseId } = this.props.match.params
        const isSubmittedForReview = mentorMenteeSession && mentorMenteeSession.getIn([0, 'isSubmittedForReview'])
        const topicId = this.getQuizReportId() || get(this.props, 'match.params.topicId')
        const homeworkComponent = this.getHomeworkComponents(topicId)
        const isQuizExists = (get(homeworkComponent, 'componentName') === 'quiz')
        const topicJS = this.props.topics && this.props.topics.toJS().filter(topic => topic.id === topicId)
        const userTopicJourneyPractices = this.getBlockBasedPracticesArr();
        let lastProjectId = null
        if (topicJS && topicJS.length) {
            const { topicComponentRule } = topicJS[0]
            let sortedTopicComponentRule = (topicComponentRule || []).sort((a, b) => a.order > b.order)
            if (get(sortedTopicComponentRule[sortedTopicComponentRule.length - 1], 'blockBasedProject.id') !== projectId) {
                lastProjectId = get(sortedTopicComponentRule[sortedTopicComponentRule.length - 1], 'blockBasedProject.id')
            }
        }
        if (this.getQuizReportId()) {
            let firstComponent = this.props.location.state && this.props.location.state.firstComponent
            if (!firstComponent && localStorage.getItem('firstComponent')) {firstComponent = getFirstComponentFromLocalStorage()}
            const componentName = get(firstComponent, 'componentName', '')
            const childComponentName = get(firstComponent, 'childComponentName', null)
            return (
                <div className={codingStyles.submitButtonContainer}>
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
                                this.props.history.push(`sessions/project/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId')}`)
                            } else if (componentName === 'blockBasedPractice') {
                                this.props.history.push(`sessions/practice/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId')}`)
                            } else if (componentName === 'learningObjective') {
                                this.props.history.push(`sessions/${getLORedirectKey({ componentName: childComponentName })}/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId')}`)
                            } else {
                                this.props.history.push(`/sessions/video/${courseId}/${this.props.match.params.topicId}/${get(firstComponent, 'componentId')}`)
                            }
                        }}
                    >
                        <NextButton
                            title='Next'
                            loading={false}
                        />
                    </div>
                </div>
            )
        } else if (isSubmittedForReview) {
            return (
                <div className={codingStyles.submitButtonContainer} style={{
                    margin: '8px 0px'
                }}>
                    <NextButton
                        style={{ margin: 0 }}
                        title='Back to Homework'

                        onClick={() => {
                            this.props.history.push('/homework')
                        }}
                    />
                </div>
            )
        }
        return (
            <div className={codingStyles.submitButtonContainer}>
                <NextButton
                    style={{
                        margin: `${isMobile() ? '8px' : ''}`,
                    }}
                    onClick={async () => {
                        if (checkIfEmbedEnabled()) return goBackToTeacherApp("backToSession");
                        if (!this.props.dumpBlockBasedPractice.getIn([projectId, 'loading'])) {
                            await this.handleHomeworkSave()
                        }
                        if (!homeworkComponent && ((this.state.activeQuestionIndex === userTopicJourneyPractices.length - 1))) {
                            this.submitForReview()
                        }
                    }}
                    // loading={this.props.dumpBlockBasedPractice.getIn([projectId, 'loading']) ||
                    //     (lastProjectId && this.props.dumpBlockBasedPractice.getIn([lastProjectId, 'loading'])) ||
                    //     (mentorMenteeSessionUpdateStatus &&
                    //     mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${get(this.props, 'match.params.topicId')}`, 'loading']))}
                    showSave
                    title={(isMobile() && !homeworkComponent && (this.state.activeQuestionIndex === userTopicJourneyPractices.length - 1)) ? 'Submit For Review' : checkIfEmbedEnabled() ? `Back to ${getEmbedData("backToPage")}` : 'Save Practice'}
                />
                {/* <Button3D
                    title='Save Practice'
                    onClick={this.handleHomeworkSave}
                    loading={this.props.dumpBlockBasedPractice.getIn([projectId, 'loading'])}
                /> */}
            </div>
        )
    }

    onClickSave = (xml_text) => {
        this.setState({
            savedBlocks: xml_text
        }, () => {
            this.dumpBlockBasedPractice();
        });
    }

    onCloseSeeAnswerModal = (event, fromClose = false) => {
        if (fromClose) {
            this.setState({ isSeeAnswerVisible: false })
            return
        }
        if (event.target === event.currentTarget) {
            this.setState({ isSeeAnswerVisible: false })
        }
    }

    updatingIsGsuiteFileVisitedQuery = async (id, visitedBool = false,isDelete=false) => {
        let { allBlockBasedPractice, match } = this.props
        allBlockBasedPractice = (allBlockBasedPractice && allBlockBasedPractice.toJS()) || []
        const topicId = get(match, 'params.topicId')
        const practiceId = get(match, 'params.projectId')
        const res = await gsuiteQueries('updateIsGsuiteFileVisited',{userBlockBasedId:id,visitedBool,props: this.props,activeQuestionIndex:this.state.activeQuestionIndex})
        const type = this.state.isHomeworkActive ? HOMEWORK_COMPONENTS_CONFIG.homeworkPractice : TOPIC_COMPONENTS.blockBasedPractice
        const currentBlockBasedPractice = allBlockBasedPractice.find(practice => get(practice, 'blockBasedPractice.id') === practiceId)
        const filteredBlockBasedPractices = allBlockBasedPractice.filter(practice => get(practice, 'blockBasedPractice.id') !== practiceId)
        if (currentBlockBasedPractice) {
            filteredBlockBasedPractices.push({ ...currentBlockBasedPractice, isGsuiteFileVisited: visitedBool })
            duck.merge(() => ( {
                userBlockBasedPractices: filteredBlockBasedPractices
            }), {
                key: `${topicId}/${type}/${this.props.userId}`
            })
            if(res){
                this.setState({isGsuiteFileVisited: visitedBool})
                this.state.isHomeworkActive && updateHomeworkAttempted(practiceId,HOMEWORK_COMPONENTS_CONFIG.homeworkPractice,isDelete)
            }
        }
    };
   

    handlingCountingSecond = () => {
        let newTime = this.state.countingSecond -1
        if (newTime >= 0)
            this.setState({countingSecond: minCap(newTime, 0)})
        
        if (!this.state.creatingFile) {
            this.setState({countingSecond:5})
            this.setState({isReAttemptButtonLoading:false})
            clearInterval(this.state.intervalId);
        }
    }

    handleNewSubmission = () => {
        this.setState({isGsuiteReattemptClicked:false})
    }

    gsuiteCorrectFileRepresentation = (gsuiteFile) => {
        return {
            fileId: gsuiteFile.id ? gsuiteFile.id : gsuiteFile.fileId,
            name: gsuiteFile.name,
            mimeType: gsuiteFile.mimeType,
            url: gsuiteFile.webViewLink ? gsuiteFile.webViewLink : gsuiteFile.url,
            thumbnailUrl: gsuiteFile.thumbnailLink,
            parentFolderIDs: gsuiteFile.parents,
            iconLink: gsuiteFile.iconLink,
            createdTime: gsuiteFile.createdTime
        }
    }

    createNewFile = async(type,gsuiteTempleteUrl) => {
        const {
            name,
            buddyStudents,
            grade,
            section,
            classroomTitle,
            schoolName
        } = getMe()
        const buddyNames = buddyStudents && buddyStudents.length > 0 ? buddyStudents.map(buddy => get(buddy, 'name', '')).join(', ') : null
        const userName = buddyNames || name 
        const gsuiteTempleteUrlOrFile = gsuiteTempleteUrl || get(this.state.blockBasedPractices,'gsuiteTempleteURL', '')
        const gsuiteFileType = get(this.state.blockBasedPractices, 'gsuiteFileType', '')
        const title = get(this.state.blockBasedPractices, 'title','')
        let gradeSection;
        if (grade && section) gradeSection = `${grade} ${section}`;
        let studentFileCreationName = '';
        studentFileCreationName = `${title}-${userName}-${gradeSection}`
        this.setState({ creatingFile: true })
        const res = await requestToGraphql(gql`
            query {
                createGsuiteLastRevisionFile(gsuiteTempleteUrlOrFile: "${gsuiteTempleteUrlOrFile}", gsuiteFileType: "${gsuiteFileType}", studentFileCreationName: "${studentFileCreationName}", schoolName: "${schoolName}", classroomTitle:"${classroomTitle}"){
                  id
                  name
                  createdTime
                  parentFolderIDs
                  iconLink
                  thumbnailLink
                  mimeType
                  webViewLink
                }
              }
        `)
        if(type === 'startPractice'){
            this.setState({reAttemptGsuiteFile:res.data.createGsuiteLastRevisionFile})
            await gsuiteQueries('updateAnswerLinkAndIsGsuiteVisited',{userBlockBasedId: get(this.props.userBlockBasedPractices.toJS()[0], "id"),url: res.data.createGsuiteLastRevisionFile.webViewLink,visitedBool:true, props: this.props,activeQuestionIndex:this.state.activeQuestionIndex})
            this.setState({isGsuiteFileVisited:true})
        }else{
            // window.open(res.data.createGsuiteLastRevisionFile.webViewLink, '_blank');
            // window.open(this.withHttps(get(res.data.createGsuiteLastRevisionFile, 'webViewLink', '')), "_blank");
            this.setState({ 
                reAttemptGsuiteFile: res.data.createGsuiteLastRevisionFile
            })

        }
        this.setState({ creatingFile: false })
        return res.data.createGsuiteLastRevisionFile.webViewLink
    }

    handleGsuitePopup = () => {
        this.setState({gsuitePopup: ''})
    }

    updateConfirmNewSubmission = () => {
        const gsuiteFileData = {
            fileId: this.state.reAttemptGsuiteFile.id ? this.state.reAttemptGsuiteFile.id : this.state.reAttemptGsuiteFile.fileId,
            name: this.state.reAttemptGsuiteFile.name,
            mimeType: this.state.reAttemptGsuiteFile.mimeType,
            url: this.state.reAttemptGsuiteFile.webViewLink ? this.state.reAttemptGsuiteFile.webViewLink : this.state.reAttemptGsuiteFile.url,
            thumbnailUrl: this.state.reAttemptGsuiteFile.thumbnailLink,
            parentFolderIDs: this.state.reAttemptGsuiteFile.parents,
            iconLink: this.state.reAttemptGsuiteFile.iconLink,
            createdTime: this.state.reAttemptGsuiteFile.createdTime
        }
        const gsuiteLastRevisionData = {
            fileId: this.state.gsuiteFile.id ? this.state.gsuiteFile.id : this.state.gsuiteFile.fileId,
            name: this.state.gsuiteFile.name,
            mimeType: this.state.gsuiteFile.mimeType,
            url: this.state.gsuiteFile.webViewLink ? this.state.gsuiteFile.webViewLink : this.state.gsuiteFile.url,
            thumbnailUrl: this.state.gsuiteFile.thumbnailLink,
            parentFolderIDs: this.state.gsuiteFile.parents,
            iconLink: this.state.gsuiteFile.iconLink,
            createdTime: this.state.gsuiteFile.createdTime
        }
        this.setState({gsuiteFile:gsuiteFileData})
        this.setState({gsuiteLastRevision:gsuiteLastRevisionData})
    }

    makingEmptyGsuiteFile = async () => {
        const gsuiteLastRevisionData = {
            fileId: this.state.gsuiteFile.id ? this.state.gsuiteFile.id : this.state.gsuiteFile.fileId,
            name: this.state.gsuiteFile.name,
            mimeType: this.state.gsuiteFile.mimeType,
            url: this.state.gsuiteFile.webViewLink ? this.state.gsuiteFile.webViewLink : this.state.gsuiteFile.url,
            thumbnailUrl: this.state.gsuiteFile.thumbnailLink,
            parentFolderIDs: this.state.gsuiteFile.parents,
            iconLink: this.state.gsuiteFile.iconLink,
            createdTime: this.state.gsuiteFile.createdTime
        }
        this.setState({gsuiteFile: {}})
        this.setState({isGsuiteFileVisited: false})
        this.setState({isRedirectedFromDelete: true})
        get(this.state.gsuiteLastRevision,'fileId') && await requestToGraphql(this.deleteQuery(this.state.gsuiteLastRevision.fileId))
        this.setState({gsuiteLastRevision:gsuiteLastRevisionData})
    }

    createNewFileIfNotExists = async (gsuiteTempleteUrl) => {
        const newTab =  this.newHTMLTABComponentRedirect()
        this.setState({isButtonLoading:true})
        const link = await this.createNewFile('startPractice',gsuiteTempleteUrl);
        const reAttemptGsuiteFile = {
            fileId: this.state.reAttemptGsuiteFile.id,
            name: this.state.reAttemptGsuiteFile.name,
            mimeType: this.state.reAttemptGsuiteFile.mimeType,
            url: this.state.reAttemptGsuiteFile.webViewLink,
            thumbnailUrl: this.state.reAttemptGsuiteFile.thumbnailLink,
            parentFolderIDs: this.state.reAttemptGsuiteFile.parents,
            iconLink: this.state.reAttemptGsuiteFile.iconLink,
            createdTime: this.state.reAttemptGsuiteFile.createdTime
        }
        const tempGsuiteFile = this.state.gsuiteFile
        this.setState({gsuiteFile: reAttemptGsuiteFile})
        if(link && newTab && !this.isSubmissionButtonClicked){
            newTab.location.href = link;
        }                           
        if(this.state.isSubmissionButtonClicked){
            await gsuiteQueries('updateGsuiteLastRevisionReattempt',{userBlockBasedId: get(this.props.userBlockBasedPractices.toJS()[0], "id"),gsuiteFile: this.state.reAttemptGsuiteFile,reAttemptGsuiteFile: tempGsuiteFile, props: this.props,activeQuestionIndex:this.state.activeQuestionIndex})
        }else{
            await gsuiteQueries('updateGsuiteNewFile',{userBlockBasedId:get(this.props.userBlockBasedPractices.toJS()[0], "id"),newFile:this.state.reAttemptGsuiteFile, props: this.props, activeQuestionIndex:this.state.activeQuestionIndex})
        }             
        this.setState({isButtonLoading:false})
    }

    newHTMLTABComponentRedirect = () => {
        let newTab = window.open('', '_blank')
        const newTabHeaderTitleConfig =  {
            'create' : 'Creating your document...',
            'reAttempt': 'Re-attempting the practice...',   
        }
        const newTabParaTitleConfig = {
            'reAttempt' : 'Confirm the new submission on the assignment page after completion.',
            'create': 'Redirecting you in a few seconds...',   
        }
        const blockBasedData = this.state.blockBasedPractices && get(this.state, 'blockBasedPractices')
        const isStartPractice = get(blockBasedData, 'layout', null) === 'gsuite' && !this.state.isGsuiteFileVisited
        const newTabHeaderTitle = isStartPractice ? newTabHeaderTitleConfig.create : newTabHeaderTitleConfig.reAttempt
        const newTabParaTitle = isStartPractice ? newTabParaTitleConfig.create : newTabParaTitleConfig.reAttempt
        // tekie loadr
        newTab.document.write(
            `<html>
                <head>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300&display=swap" rel="stylesheet">
                <style>
                .loading-text{
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    animation: loading 1s infinite;

                }
                span{
                   
                    animation: fade 0.3s linear infinite;
                    animation-direction: alternate;

                    }
                    span:nth-child(2){
                        animation-delay: 0.3s;
                    }
                    span:nth-child(3){
                        animation-delay: 0.6s;
                    }

                    @keyframes fade{
                        0%{
                            opacity: 1;
                        }
                        100%{
                            opacity: 0;
                        }
                    
                    }
                   </style> 
                </head>
                <body onload="ready()">
                <div className='loaderContainer' style="width: 100vw;height: 100vh;display: flex;align-items: center;justify-content: center;font-family: Nunito,sans-serif">
                    <div className='loaderContentContainer' 
                        style="align-items: center;
                        justify-content: center;
                        display: flex;
                        flex-flow: column;"
                    >
                    <div className='loaderGifContainer' style="height: 100;width: 100px; align-items: center;">
                        <img src='/static/media/tekieLoader.fb89967d.gif' alt="loading" height='100%' width='100%' />
                    </div>
                    <h1 className='loadingText' style="weight: 900; font-size:28px line-height: 140%; margin-bottom: 0px; color: #333;">
                        ${newTabHeaderTitle}
                    </h1>
                    <p className='loadingText' style="font-weight: 500; size=18px; margin-bottom:10px;">${newTabParaTitle}</p>
                    <h2 class='loading-text' style="font-size: 20px; color: #999; padding: 12px 0px; ">
                    Please wait
                       <span>.</span>
                        <span>.</span>
                        <span>.</span>
                    </h2>
                    </div>
                </div>
          

                <script>
                    let timer = 5;
                    let timerFunction = setInterval(function() {
                        timer--;
                        
                        document.getElementById("timer").innerHTML = timer;
                        if(timer <= 0){
                            clearInterval(timerFunction);
                        }
                    },1000);
                </script>
                </body>
            </html>`
        );
        return newTab
    }
    handleNextItem = () => {
        const {activeQuestionIndex} = this.state
        const { topicId } = this.props.match.params
        const type = this.state.isHomeworkActive ? HOMEWORK_COMPONENTS_CONFIG.homeworkPractice : TOPIC_COMPONENTS.blockBasedPractice
        const isRevisit = this.props.match.path.includes('/revisit')
        this.setState({activeQuestionIndex  : activeQuestionIndex + 1})
        const {
            filteredComponentLink
        } = filteredComponentsLink(
            {
                topicId,
                isRevisit,
                url: this.props.location.pathname,
                classwork: !this.state.isHomeworkActive,
                component: type

            }
        )

        const nextLink = filteredComponentLink[activeQuestionIndex + 1]
        this.props.history.push(nextLink)
    }

    deleteQuery = (id) => gql`
    query{
        deleteGsuiteFileOrFolder(id: "${id}"){
        result
        }
    }
    `;

    setIsModalOpen = (boolValue,intervalId) => {
        if(intervalId) this.setState({intervalId: intervalId})
        this.setState({isModalOpen:boolValue})
    }

    checkIfPracticeAttempted = async() => {
        let userBlockBasedPractices =  this.props.allBlockBasedPractice && this.props.allBlockBasedPractice.toJS();
        let answerAttemptCount = 0;
        userBlockBasedPractices = userBlockBasedPractices.filter(project => {
            return project.blockBasedPractice.isSubmitAnswer === true;
        })
        
        // eslint-disable-next-line array-callback-return
        userBlockBasedPractices.map((userBlockBasedPractice)=> {
            if ((get(userBlockBasedPractice, 'blockBasedPractice.layout') === 'fileUpload') && get(userBlockBasedPractice, 'attachments', []).length) {
                answerAttemptCount += 1
            }
            else if ((get(userBlockBasedPractice, 'blockBasedPractice.layout') === 'externalPlatform') && get(userBlockBasedPractice, 'answerLink')) {
                answerAttemptCount += 1
            }
            else if ((get(userBlockBasedPractice, 'blockBasedPractice.layout') === 'gsuite') && (get(userBlockBasedPractice, 'isGsuiteFileVisited', false) || get(userBlockBasedPractice, 'answerLink', false))) {
                answerAttemptCount += 1
            }
            else if ((get(userBlockBasedPractice, 'blockBasedPractice.layout') === 'playground') && get(userBlockBasedPractice, 'savedBlocks', '').length) {
                answerAttemptCount += 1
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
        if((answerAttemptCount === userBlockBasedPractices.length) && userBlockBasedPractices.length > 0){
            const batchSessionId = getDataFromLocalStorage('currentSessionId')
            let batchSessionData
            batchSessionData = await updatedBatchSession(batchSessionId)
            const sessionComponentTrackers = get(batchSessionData,'data.batchSessionData.sessionComponentTracker')
            const sessionComponentTrackersId = get(sessionComponentTrackers,'id')
            const assignmentData = get(sessionComponentTrackers,'blockBasedPractice')
            const loggedInUser = get(this.props.loggedInUser.toJS(),'[0].id')
            const userBuddies = this.props.userBuddies
            let input = {}
            input = {
                practice:{
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
                        delete input.practice.updateWhere.userReferenceId;
                        input.practice.updateWhere.userReferenceId = buddy.id;
                        await updateSessionComponentTracker(sessionComponentTrackersId, input);
                    }
                }
            }

        }
    }

    renderShowAnswerToggle = () => {
        const { blockBasedPractices } = this.state
        const answerFormatDescription = (get(blockBasedPractices, 'answerFormatDescription', '') || '').trim()
        if (answerFormatDescription && checkIfEmbedEnabled()) {
            const backToPage = getEmbedData('backToPage')
            if (backToPage !== backToPageConst.trainingResourcesClasswork) {
                return true;
            }
        }
        return false;
    }

    isCanvaAssignment = () => { 
        const { isCanvaSsoEnabled } = getMe()
        if (!isCanvaSsoEnabled) return false;
        const blockBasedData = this.state.blockBasedPractices && get(this.state, 'blockBasedPractices')
        return get(blockBasedData, 'externalPlatformLink', '') ? get(blockBasedData, 'externalPlatformLink', '').toLowerCase().includes("canva") : false || get(blockBasedData, 'platFormLinkLabel', '') ? get(blockBasedData, 'platFormLinkLabel', '').toLowerCase().includes("canva") : false;
    }

    render() {
        const { email} = getMe()
        const blockBasedData = this.state.blockBasedPractices && get(this.state, 'blockBasedPractices')
        const gsuiteFileData = this.state.gsuiteFile && get(this.state, 'gsuiteFile')
        const userTopicJourneyPractices = this.getBlockBasedPracticesArr()
        const revisitRoute = typeof window !== 'undefined' && get(window, 'location.pathname', '').includes('/revisit')
        const { projectId } = this.props.match.params
        const quizReportTopicId = (this.props.location.state && this.props.location.state.quizReportTopicId) || getPreviousTopicIdFromLocalStorage()
        const { isLoading, activeQuestionIndex } = this.state
        const isSubmittedForReview = this.props.mentorMenteeSession && this.props.mentorMenteeSession.getIn([0, 'isSubmittedForReview'])
        const codes = [
            { value: 'javascript', label: 'javascript' },
            { value: 'python', label: 'python' },
        ]
        const isElectron = typeof window !== 'undefined' && window.native
        const userBlockBasedPracticeId =  this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.getIn([0, 'id']);
        const layout = this.state.blockBasedPractices && get(this.state.blockBasedPractices, 'layout')
        const uniquePlaygroundId = `${get(blockBasedData, 'id') || ''}:${userBlockBasedPracticeId || ''}`;
        const isLastQuestion = (activeQuestionIndex === get( userTopicJourneyPractices, 'length', 0) - 1)
        return (
            <>
                {/* <UpdatedSideNavBar
                    mobileNav
                    computedMatch={this.props.computedMatch || this.props.match}
                    pageTitle="Practice"
                    parent={(this.state.isHomeworkActive && !quizReportTopicId) ? 'homework' : 'sessions'}
                    revisitRoute={this.props.match.path.includes('/revisit')}
                    showSubmitOverlay={submitForReviewFn => this.submitForReview = submitForReviewFn}
                /> */}
                <Prompt
                    when={this.state.isGsuiteReattemptClicked}
                    message="Changes that you made may not be saved."
                >
                </Prompt>
                <div
                    className={cx({
                        'practice-mainContainer': true,
                    })}
                    style={{
                        marginTop: `${isMobile() ? '60px' : ''}`
                    }}
                >
                    <CanvaSSOComponent
						canvaSSORef={this.canvaSSORef}
						email={email}
					/>
                    <CorrectAnswerModal
                        blockBasedPractices={this.state.blockBasedPractices}
                        blockBasedData={blockBasedData}
                        onCloseSeeAnswerModal={this.onCloseSeeAnswerModal}
                        isSeeAnswerVisible={this.state.isSeeAnswerVisible}
                    />
                    { isLoading ? (
                        <>
                        <div className="practice-details-container practice-details-container-override" style={{height: "fit-content",marginTop: "7%"}}>
                            <div className="practice-submission-top-container">
                                <Skeleton></Skeleton>
                            </div>
                        </div>
                        <footer className={cx(codingStyles.footerContainer, checkIfEmbedEnabled() && codingStyles.footerContainerForTeacherApp)}>
                            <FooterBtnSkeleton ></FooterBtnSkeleton>
                        </footer>
                        </>
                    ) : (
                        blockBasedData ? (
                            <>
                                {this.state.isBadgeModalVisible &&
                                    <BadgeModal
                                        closeModal={this.closeBadgeModal}
                                        shouldAnimate
                                        unlockBadge={this.state.badge}
                                    />
                                }
                                {(userTopicJourneyPractices.length > 1) && (
                                    isMobile() ? (
                                        <div className={pqStyles.indicatorContainer}>
                                            {(userTopicJourneyPractices.length > 1) ? (
                                                userTopicJourneyPractices.map((blockBasedPractice, index) => {
                                                    return (
                                                        <motion.div
                                                            whileTap={{
                                                                scale: 0.9
                                                            }}
                                                            className={cx({
                                                                circle: true,
                                                                activeCircle: (get(blockBasedData, 'id') === get(blockBasedPractice, 'id')),
                                                            })}
                                                            style={{
                                                                cursor: `${(!revisitRoute && !this.state.isHomeworkActive) ? 'default' : ''}`
                                                            }}
                                                            key={blockBasedPractice.id}
                                                            onClick={() => {
                                                                if (revisitRoute || this.state.isHomeworkActive) {
                                                                    this.setState({
                                                                        activeQuestionIndex: index
                                                                    })
                                                                    this.routeToPracticeSession(get(blockBasedPractice, 'id'))
                                                                }
                                                            }}
                                                        >
                                                            <div
                                                                className={cx({
                                                                    activeBorder: (get(blockBasedData, 'id') === get(blockBasedPractice, 'id')),
                                                                })}
                                                            />
                                                            {index + 1}
                                                        </motion.div>
                                                    )
                                                })
                                            ) : null}
                                            <span />
                                        </div>
                                    ) : (
                                        <div className={cx(pqStyles.questionAreaContainer, checkIfEmbedEnabled() && pqStyles.questionAreaContainerForTeacherApp)}>
                                            <div className={isElectron ? pqStyles.questionNumberContainerElectron : pqStyles.questionNumberContainer} style={{
                                                marginTop: `${checkIfEmbedEnabled() ? '0' : ''}`
                                            }}>
                                                <div
                                                    onClick={() => {
                                                        if (activeQuestionIndex > 0) {
                                                            this.setState({
                                                                activeQuestionIndex: activeQuestionIndex - 1
                                                            }, () => {
                                                                const blockBasedPractice = userTopicJourneyPractices.filter((el, index) => index === this.state.activeQuestionIndex)[0]
                                                                this.routeToPracticeSession(get(blockBasedPractice, 'id'))
                                                            })
                                                        }
                                                    }}
                                                    className={pqStyles.arrowSVGContainer}
                                                >
                                                    <ArrowSVG
                                                        className={cx({
                                                            [pqStyles.arrowSVG]: true,
                                                            [pqStyles.disabled]: activeQuestionIndex === 0
                                                        })}
                                                    />
                                                </div>
                                                <div className={pqStyles.indicatorContainer}>
                                                    {(userTopicJourneyPractices.length > 1) ? (
                                                        userTopicJourneyPractices.map((blockBasedPractice, index) => {
                                                            return (
                                                                <motion.div
                                                                    whileTap={{
                                                                        scale: 0.9
                                                                    }}
                                                                    className={cx({
                                                                        circle: true,
                                                                        activeCircle: (get(blockBasedData, 'id') === get(blockBasedPractice, 'id')),
                                                                    })}
                                                                    key={blockBasedPractice.id}
                                                                    onClick={() => {
                                                                        this.setState({
                                                                            activeQuestionIndex: index
                                                                        })
                                                                        this.routeToPracticeSession(get(blockBasedPractice, 'id'))
                                                                    }}
                                                                
                                                                >
                                                                    <div
                                                                        className={cx({
                                                                            activeBorder: (get(blockBasedData, 'id') === get(blockBasedPractice, 'id')),
                                                                        })}
                                                                    />
                                                                    {index + 1}
                                                                </motion.div>
                                                            )
                                                        })
                                                    ) : null}

                                                    <div className='practice-inActiveProgressBar'>
                                                        <div
                                                            className='activeProgressBar'
                                                            style={{
                                                                width: this.getActiveProgressPercentage(userTopicJourneyPractices, get(blockBasedData, 'id'))
                                                            }}
                                                        />
                                                        
                                                    </div>
                                                </div>
                                                <div
                                                    style={{ marginLeft: 22, transform: 'scaleX(-1)' }}
                                                    onClick={() => {
                                                        if (userTopicJourneyPractices && (activeQuestionIndex < userTopicJourneyPractices.length - 1)) {
                                                            this.setState({
                                                                activeQuestionIndex: activeQuestionIndex + 1
                                                            }, () => {
                                                                const blockBasedPractice = userTopicJourneyPractices.filter((el, index) => index === this.state.activeQuestionIndex)[0]
                                                                this.routeToPracticeSession(get(blockBasedPractice, 'id'))
                                                            })
                                                        }
                                                    }}
                                                    className={pqStyles.arrowSVGContainer}
                                                >
                                                    <ArrowSVG
                                                        className={cx({
                                                            [pqStyles.arrowSVG]: true,
                                                            [pqStyles.disabled]: activeQuestionIndex >= userTopicJourneyPractices.length - 1,
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
  
                                <div className={`practice-details-container practice-details-container-override ${get(this.state, 'isHomeworkActive', false) ? 'homework-' : ''}practice-page-mixpanel-identifier`} style={{
                                    marginBottom: '7%'
                                }}>
                                    <div className='practice-submission-top-container'>
                                        <div className='practice-top-flex-container'>
                                           
                                            <div className='practice-top-details-container'>
                                                <div className="practice-top-info">
                                                    <div className='practice-top-details-heading'>
                                                    <div>{get(blockBasedData, 'title', '-')}</div>
                                                </div>
                                                {(this.renderShowAnswerToggle()) ? (
                                                    <div className='practice-see-answer-button' onClick={() => this.setState({ isSeeAnswerVisible: true })}>
                                                        <span>Show Correct Answer</span>
                                                        <ViewIcon className={'practice-see-answer-button-viewIcon'} />
                                                    </div>
                                                ) : null}
                                                {get(blockBasedData, 'projectDescription') && (
                        
                                                    <div
                                                     className='practice-top-details-description'>
                                                        <TekieCEParser
                                                            practice
                                                            value={blockBasedData.projectDescription}
                                                            init={{ selector: `BB-practice_${blockBasedData.id}` }}
                                                            legacyParser={(projectDescription) => {
                                                                return parseMetaTags({ statement: projectDescription })
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                     {get(blockBasedData, 'externalPlatformLink', null) && get(blockBasedData, 'layout', null) !== 'gsuite' && (
                                                    <UpdatedButton  text={blockBasedData.platFormLinkLabel || "Go to Practice"} leftIcon onBtnClick={() => {
                                                     this.isCanvaAssignment() ? this.canvaSSORef.current.click() : window.open(this.withHttps(this.appendQueryParam(get(blockBasedData, 'externalPlatformLink', ''), uniquePlaygroundId)), '_blank', 'noreferrer')
                                                    }}>
                               
                                                        {get(blockBasedData, 'externalPlatformLogo.uri', null) && (
                                                                <div className='practice-btn-image'>
                                                                <img className="practiceLabelImg"
                                                                 src={getPath(blockBasedData.externalPlatformLogo.uri)}
                                                                  alt='logo' />
                                                            </div>
                                                        )
                                                     }

                                                    </UpdatedButton>
                                                )
                                                
                                                }

                                                {get(blockBasedData, 'layout', null) === 'gsuite' && !this.state.isGsuiteFileVisited && (
                                                    <UpdatedButton isLoading={this.state.isButtonLoading} isDisabled={this.state.isButtonLoading} text={get(blockBasedData, 'platFormLinkLabel', null) ? get(blockBasedData, 'platFormLinkLabel', null) : "Start practice"} leftIcon 
                                                    onBtnClick={async () => {
                                                        this.setState({isModalOpen:true})
                                                        var intervalId = setInterval(this.handlingCountingSecond,1000)
                                                        const newTab =   get(this.state.gsuiteFile, 'url', '') && this.newHTMLTABComponentRedirect()
                                                        const link = get(this.state.gsuiteFile, 'url', '')
                                                        if(link && newTab){
                                                            newTab.location.href = link;
                                                        }
                                                        const gsuiteLastRevision = this.props.userBlockBasedPractices && this.props.userBlockBasedPractices.getIn([0, 'gsuiteLastRevision'])
                                                        await this.createNewFileIfNotExists()
                                                        this.setState({intervalId: intervalId})
                                                        this.setState({isModalOpen:false})
                                                        this.updateAuthorsArray()
                                                    }}>
                               
                                                                <div className='practice-btn-image'>
                                                                <img className="practiceLabelImg"
                                                                 src={this.state.mimeType === 'presentation' ? slidesLogo : 
                                                                    this.state.mimeType === 'document' ? documentLogo :
                                                                    this.state.mimeType === 'spreadsheet' ? sheetsLogo : ''
                                                                }
                                                                  alt='logo' />
                                                            </div>
                                                    </UpdatedButton>
                                                )
                                                }

                                                {get(blockBasedData, 'layout', null) === 'gsuite' && this.state.isGsuiteFileVisited && (
                                                    <UpdatedButton  text={"Re-attempt practice"} leftIcon 
                                                    onBtnClick={async () => {
                                                        this.setState({isModalOpen:true})
                                                        const newTab = this.newHTMLTABComponentRedirect()
                                                        var intervalId = setInterval(this.handlingCountingSecond,1000)
                                                        const link = await this.createNewFile('reAttempt')
                                                        newTab.location.href = link;
                                                        this.setState({isReAttemptButtonLoading:true})
                                                        this.setState({intervalId: intervalId})
                                                        this.setState({isModalOpen:false})
                                                        this.setState({isGsuiteReattemptClicked: true})                                                      
                                                    }}>
                               
                                                        {get(blockBasedData, 'externalPlatformLogo.uri', null) && (
                                                            <div className='practice-btn-image'>
                                                                <img className="practiceLabelImg"
                                                                 src={this.state.mimeType === 'presentation' ? slidesLogo : 
                                                                 this.state.mimeType === 'document' ? documentLogo :
                                                                 this.state.mimeType === 'spreadsheet' ? sheetsLogo :
                                                                 getPath(blockBasedData.externalPlatformLogo.uri)
                                                                }
                                                                  alt='logo' />
                                                            </div>
                                                        )
                                                     }
                                                    </UpdatedButton>
                                                )
                                                }

                                                {/* {this.state.isGsuiteReattemptClicked && get(blockBasedData, 'layout', null) === 'gsuite' && 
                                                    <UpdatedButton  text={"Resume practice"} leftIcon 
                                                        onBtnClick={async () => {
                                                            window.open(this.withHttps(get(this.state.reAttemptGsuiteFile, 'webViewLink', '')), "_blank");                                            
                                                    }}>
                               
                                                        {get(blockBasedData, 'externalPlatformLogo.uri', null) && (
                                                            <div className='practice-btn-image'>
                                                                <img className="practiceLabelImg"
                                                                 src={this.state.mimeType === 'presentation' ? slidesLogo : 
                                                                 this.state.mimeType === 'document' ? documentLogo :
                                                                 this.state.mimeType === 'spreadsheet' ? sheetsLogo :
                                                                 getPath(blockBasedData.externalPlatformLogo.uri)
                                                                }
                                                                  alt='logo' />
                                                            </div>
                                                        )
                                                     }
                                                    </UpdatedButton>
                                                } */}

                                              

                                                {this.state.isModalOpen && this.state.isGsuiteReattemptClicked && 
                                                    <>
                                                        <div className='modalPopup'>
                                                            <h2>You are re-attempting the practice...</h2>
                                                            <p>Come back and update the new submission once done.</p>
                                                            <h1>Redirecting in {this.state.countingSecond}...</h1>
                                                        </div>
                                                        <div className='modalOverlay'></div>
                                                    </>
                                                }
                                                {this.state.isModalOpen && !this.state.isGsuiteReattemptClicked && 
                                                    <>
                                                        <div className='modalPopup'>
                                                            <h2>Creating your document...</h2>
                                                            <p>Redirecting you in a few seconds...</p>
                                                            <h1>
                                                                Please wait
                                                                <span>.</span>
                                                                <span>.</span>
                                                                <span>.</span>
                                                            </h1>
                                                        </div>
                                                        <div className='modalOverlay'></div>
                                                    </>
                                                }

                                                {this.state.isGsuiteReattemptClicked && 
                                                    <>
                                                        <div className='modalPopup'>
                                                            <AnimatePresence>
                                                            <motion.div 
                                                            initial={{opacity: 0}}
                                                            animate={{opacity: 1}}
                                                            exit={{opacity: 0}}
                                                            className='practice-top-upload-container'>
                                                                <div className="practice-file-max-modal">

                                                                <div className='practice-file-max-header'>Confirm New Submission?</div>
                                                                <div className="practice-file-max-body">

                                                                <div className='practice-file-max-desc'>The old submission will be replace with the new one you just created.</div>
                                                                <div className="practice-file-popup-btns">
                                                                <>
                                                                    <UpdatedButton 
                                                                    type='secondary' 
                                                                    text='No, keep the same' 
                                                                    isLoading={this.state.isKeepTheSameLoading}
                                                                    leftIcon={true}
                                                                    loadingType='overlay'
                                                                    onBtnClick={async () => {
                                                                        this.setState({isKeepTheSameLoading:true})
                                                                        await requestToGraphql(this.deleteQuery(this.state.reAttemptGsuiteFile.id))
                                                                        this.setState({isKeepTheSameLoading:false})
                                                                        this.handleNewSubmission()
                                                                        this.handleGsuitePopup()
                                                                        this.setState({isGsuiteReattemptClicked:false})
                                                                    }}
                                                                    />
                                                                    <UpdatedButton 
                                                                    text='Yes, Confirm' 
                                                                    isLoading={this.state.isConfirmButtonClicked}
                                                                    loadingType='overlay' 
                                                                    onBtnClick={async () => {
                                                                        this.setState({isConfirmButtonClicked:true})
                                                                        let previousGsuiteFileIdToDelete = this.state.gsuiteLastRevision.fileId
                                                                        await gsuiteQueries('updateGsuiteLastRevisionReattempt',{userBlockBasedId: get(this.props.userBlockBasedPractices.toJS()[0], "id"),gsuiteFile: this.state.gsuiteFile,reAttemptGsuiteFile: this.state.reAttemptGsuiteFile, props: this.props, activeQuestionIndex:this.state.activeQuestionIndex})
                                                                        await gsuiteQueries('updateAnswerLink',{userBlockBasedId: get(this.props.userBlockBasedPractices.toJS()[0], "id"),url: this.state.reAttemptGsuiteFile.webViewLink || this.state.reAttemptGsuiteFile.url, props: this.props, activeQuestionIndex:this.state.activeQuestionIndex })
                                                                        // this.updateBuddyStudentsData({answerLink: this.state.reAttemptGsuiteFile.webViewLink || this.state.reAttemptGsuiteFile.url})
                                                                        // const buddyGsuiteFile = this.gsuiteCorrectFileRepresentation(this.state.reAttemptGsuiteFile)
                                                                        // this.updateBuddyStudentsData({gsuiteFile: buddyGsuiteFile})
                                                                        get(this.state.gsuiteLastRevision,'fileId') && await requestToGraphql(this.deleteQuery(previousGsuiteFileIdToDelete))
                                                                        this.setState({isConfirmButtonClicked:false})
                                                                        // this.updateBuddyStudentsData({gsuiteLastRevision: this.state.gsuiteFile})
                                                                        this.handleNewSubmission()
                                                                        this.updateConfirmNewSubmission()
                                                                        this.handleGsuitePopup()
                                                                        this.setState({isGsuiteReattemptClicked:false})
                                                                    }}
                                                                    />
                                                                </>
                                                                </div>
                                                                </div>

                                                                </div>
                                                            </motion.div>
                                                            </AnimatePresence>
                                                        </div>
                                                        <div className='modalOverlay'></div>
                                                    </>
                                                }

                                                </div>
                                        
                                                    {((this.state.blockBasedPractices.layout === 'externalPlatform' || 
                                                    this.state.blockBasedPractices.layout === 'fileUpload' ||
                                                    this.state.blockBasedPractices.layout === 'gsuite') && this.state.blockBasedPractices.isSubmitAnswer) &&
                                                     <PracticeSubmission 
                                                        withHttps={this.withHttps}
                                                        layout={layout}
                                                        projectId={projectId}
                                                        isHomework={this.state.isHomeworkActive}
                                                        projectLink={this.state.projectLink}
                                                        userBlockBasedPractices={this.props.userBlockBasedPractices.toJS()} 
                                                        id={this.props.userBlockBasedPractices.getIn([0, 'id'])}
                                                        isPracticeSubmitted={this.state.projectLinkSubmitted} 
                                                        loading={this.props.dumpBlockBasedPractice.getIn([projectId,'loading'])}
                                                        success={this.props.dumpBlockBasedPractice.getIn([projectId,'success'])}
                                                        updateProjectLink={this.updateProjectLink}
                                                        dumpBlockBasedPractice={this.practiceLinkSubmission}
                                                        gsuiteFile={this.state.gsuiteFile}
                                                        updatingIsGsuiteFileVisitedQuery={this.updatingIsGsuiteFileVisitedQuery}
                                                        isGsuiteFileVisited={this.state.isGsuiteFileVisited}
                                                        gsuitePopup={this.state.gsuitePopup}
                                                        reAttemptGsuiteFile={this.state.reAttemptGsuiteFile}
                                                        handleNewSubmission={this.handleNewSubmission}
                                                        handleGsuitePopup={this.handleGsuitePopup}
                                                        mimeType={this.state.mimeType}
                                                        updateConfirmNewSubmission={this.updateConfirmNewSubmission}
                                                        makingEmptyGsuiteFile={this.makingEmptyGsuiteFile}
                                                        createNewFileIfNotExists={this.createNewFileIfNotExists}
                                                        isButtonLoading={this.state.isButtonLoading}
                                                        isReAttemptButtonLoading={this.state.isReAttemptButtonLoading}
                                                        newHTMLTABComponentRedirect={this.newHTMLTABComponentRedirect}
                                                        activeQuestionIndex={this.state.activeQuestionIndex}
                                                        setIsModalOpen={this.setIsModalOpen}
                                                        handlingCountingSecond={this.handlingCountingSecond}
                                                        updateAuthorsArray={this.updateAuthorsArray}
                                                        handelIsSubmissionButtonClicked={this.handelIsSubmissionButtonClicked}
                                                        props={this.props}
                                                        gsuiteCorrectFileRepresentation={this.gsuiteCorrectFileRepresentation}
                                                        checkIfPracticeAttempted={this.checkIfPracticeAttempted}
                                                        >
                                                    </PracticeSubmission>
                                                    
                                                    }
                                            </div>
                                        </div>
                                    </div>
                                    {get(blockBasedData, 'projectCreationDescription') && (
                                        <div className='practice-creation-description'>
                                            {(get(blockBasedData, 'externalDescriptionEnabled', false) && this.checkIfDomainAllowed(get(blockBasedData, 'projectCreationDescription'))) ?
                                                <IframeContent
                                                projectDescription={get(blockBasedData, 'projectCreationDescription')}
                                                embedViewHeight={get(blockBasedData, 'embedViewHeight')}
                                                /> :
                                                <TekieCEParser
                                                practice
                                                value={blockBasedData.projectCreationDescription}
                                                init={{ selector: `BB-practice-create_${blockBasedData.id}` }}
                                                legacyParser={(projectCreationDescription) => {
                                                    return (
                                                        <span className='practice-legacy-text-padding'>
                                                            {parseMetaTags({ statement: projectCreationDescription })}
                                                        </span>
                                                    )
                                                }}
                                            />}
                                        </div>
                                        
                                    )}
                                   
                                </div>
                               
                                {(this.state.activeState === 'started' && this.state.blockBasedPractices.layout === 'playground') && (
                                    <Editor
                                        editorMode='blockly'
                                        initialBlocks={this.savedBlocks || this.initialBlocks || ''}
                                        blocklySave={this.onClickSave}
                                        saveBtn={true}
                                        scrollbarsvertical={false}
                                        isMobile={isMobile()}
                                    />
                                )}
                                {this.state.isHomeworkActive ? (
                                <div className={cx(codingStyles.footerContainer, checkIfEmbedEnabled() && codingStyles.footerContainerForTeacherApp)}>
                                     <NextFooter
                                            match={this.props.match}
                                            classwork={!this.state.isHomeworkActive}
                                            loading={this.state.nextLoading}
                                            nextItem={() => this.handleNextItem()}
                                            lastItem={isLastQuestion}
                                            dumpSession={this.dumpBlockBasedPractice}
                                            saveHomeWork={this.handleHomeworkSave}
                                        >

                                        </NextFooter>
                                </div>
                            ) : isMobile() ?
                                <div className={cx(codingStyles.footerContainer, checkIfEmbedEnabled() && codingStyles.footerContainerForTeacherApp)}>
                                    {isMobile() ? (
                                        <button className={videoStyles.nextButton}
                                            style={{ margin: 0 }}
                                            onClick={() => this.handleNext(revisitRoute)}
                                        >
                                            <div className={videoStyles.nextTitle}>
                                                {this.getButtonTitle(revisitRoute)}
                                            </div>
                                            {this.props.dumpBlockBasedPractice.getIn([projectId, 'loading']) ? (
                                                <span className={videoStyles.loader} />
                                            ) : (
                                                <img
                                                    style={{ marginLeft: "10px" }}
                                                    width="25px"
                                                    src="https://img.icons8.com/material-sharp/50/ffffff/circled-chevron-right.png"
                                                    alt="arrow right"
                                                />
                                            )}
                                        </button>
                                    ) : null}
                                </div> : 
                                <NextFooter
                                    classwork={!this.state.isHomeworkActive}
                                    match={this.props.match}
                                    loading={this.state.nextLoading}
                                    nextItem={() => this.handleNextItem()}
                                    lastItem={isLastQuestion}
                                    dumpSession={this.dumpBlockBasedPractice}
                                >

                                </NextFooter>
                            }
                            </>
                        ) : (
                            <div className='practice-error-text'>
                                Some Error Occured, Please Try Again!
                            </div>
                        )
                    )}
                </div>
                {/* <FeedBackModal>
                    
                </FeedBackModal> */}
                {(this.props.match.path === '/sessions/practice/:courseId/:topicId/:projectId') && (
                    <MentorFeedback
                        sessionId={this.props.mentorMenteeSessionEndSession.getIn([0, 'id'])}
                        postSubmit={async () => {
                            const isCompleted = await this.checkIfCourseCompleted()
                            let loginWithCode = this.props.loggedInUser && this.props.loggedInUser.toJS() && get(this.props.loggedInUser.toJS(), '[0].fromOtpScreen')
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
                {this.state.showCredentialModal && <CredentialsPopup email={get(this.props.loggedInUser.toJS(), '[0].email')} password={get(this.props.loggedInUser.toJS(), '[0].savedPassword')} onClickFn={() => {
                    this.props.dispatch({ type: 'LOGOUT' })
                }} />}
            </>
        )
    }
}

export default Practice