import { get, sortBy } from 'lodash'
import React from 'react'
import Select from 'react-select'
import { homeworkComponents } from '../../../../constants/homework'
import fetchMenteeCourseSyllabus from '../../../../queries/sessions/fetchMenteeCourseSyllabus'
import fetchMenteeHomeworkSyllabus from '../../../../queries/sessions/fetchMenteeHomeworkSyllabus'
import fetchMentorChild from '../../../../queries/teacherApp/fetchMentorChild'
import { setDataInLocalStorage } from '../../../../utils/data-utils'
import getStudentAppRoute from '../../../../utils/teacherApp/getRoute'
import Collapsible from '../../../Homework/components/Collapsible'
import PastHomework from '../../../Homework/components/PastHomework'
import LoadingSpinner from '../../components/Loader/LoadingSpinner'
import { backToPageConst } from '../../constants'
import { getCourseLanguage } from '../../utils'
import { newStyles } from '../Classroom/ClassroomDetails/ClassroomDetailsHeader'
import styles from './TrainingResourcesAssessment.module.scss'

class TrainingResourcesAssessment extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            mentorBatches: [],
            selectedBatch: '',
            isFetchingSyllabus: false,
            isNavigationLoading: false,
        }
    }
    componentDidMount = async () => {
        const { mentorChild, mentorChildFetchStatus } = this.props
        const mentorBatches = (mentorChild && get(mentorChild.toJS(), 'batches', [])) || []
        const isFetchingMentorChild = (mentorChildFetchStatus && mentorChildFetchStatus.toJS() && get(mentorChildFetchStatus.toJS(), 'loading')) || false
        await fetchMentorChild()
    }
    componentDidUpdate = (prevProps, prevState) => {
        const { mentorChild, menteeCourseSyllabusStatus } = this.props
        if (prevProps.mentorChild !== mentorChild && mentorChild) {
            const mentorBatches = (mentorChild && get(mentorChild.toJS(), 'batches', [])) || []
            const batchIdFromParams = get(this.props, 'match.params.batchId', '')
            this.setState({ mentorBatches }, () => this.selectMentorBatch(batchIdFromParams))
        }
        if (menteeCourseSyllabusStatus && !get(menteeCourseSyllabusStatus.toJS(), 'loading')
            && get(menteeCourseSyllabusStatus.toJS(), 'success') &&
            (prevProps.menteeCourseSyllabusStatus !== menteeCourseSyllabusStatus)) {
            this.setState({ isFetchingSyllabus: false })
        }
    }
    getCurrentBatchDetail = (key) => {
        const { mentorBatches, selectedBatch } = this.state
        const currentBatch = mentorBatches.find(batch => get(batch, 'id') === selectedBatch);
        if (currentBatch) {
            if (key) return get(currentBatch, key)
            return currentBatch
        }
        return null
    }
    sortAscending = (data, path) => {
        return data.sort((a, b) => {
            return a[path] - b[path]
        })
    }
    selectMentorBatch = async (batchId = '') => {
        const { mentorBatches } = this.state
        const { mentorChild } = this.props
        let selectedBatch = batchId
        if (!selectedBatch) {
            selectedBatch = get(mentorBatches, '[0].id')
        }
        this.setState({ selectedBatch, isFetchingSyllabus: true }, async () => {
            this.props.history.push(`/${backToPageConst.trainingResourcesAssessment}/${selectedBatch}`)
            setDataInLocalStorage("activeClassroom", selectedBatch)
            const mentorChildData = (mentorChild && get(mentorChild.toJS(), 'studentUser', {})) || {}
            fetchMenteeCourseSyllabus()
            await fetchMenteeHomeworkSyllabus(
            null,
            null,
            get(mentorChildData, 'id'),
            'menteeCompletedFilter',
            'withMenteeToken',
                true,
                '',
                '',
            selectedBatch,
        )
        })
    }
    isLoading = () => {
        const { mentorChildFetchStatus, menteeCourseSyllabusStatus } = this.props
        const { isFetchingSyllabus } = this.state
        if ((mentorChildFetchStatus && mentorChildFetchStatus.toJS() && get(mentorChildFetchStatus.toJS(), 'loading')) ||
            (menteeCourseSyllabusStatus && menteeCourseSyllabusStatus.toJS() && get(menteeCourseSyllabusStatus.toJS(), 'loading')) ||
            isFetchingSyllabus
        ) {
            return true
        }
        return false
    }
    getSessions = () => {
        const { coursePackages, menteeCourseSyllabus } = this.props
        const coursePackage = (coursePackages && coursePackages.toJS() && get(coursePackages.toJS(), '0')) || {}
        const sessions = (menteeCourseSyllabus && menteeCourseSyllabus.toJS()[0]) || []
        const viewContentBasedOnCurrentComponent = this.getCurrentBatchDetail('viewContentBasedOnCurrentComponent')
        let upComingSessions  = []
        let notBookedSessions = []
        let firstComponent = {}
        let previousTopicObj = {}
        let completedSessions = []
        let allSessions = []
        if (sessions) {
            const upComingSession =  sessions.upComingSession 
                ? this.sortAscending(sessions.upComingSession, ['topicOrder']).filter(session => session.classType !== 'theory')
                : []
            const bookedSessions = sessions.bookedSession 
                ? this.sortAscending(sessions.bookedSession, ['topicOrder']).filter(session => session.classType !== 'theory')
                : []
            completedSessions = sessions.completedSession
                ? this.sortAscending(sessions.completedSession, ['topicOrder']).filter(session => session.classType !== 'theory')
                : []
            firstComponent = sessions.firstComponent ? sessions.firstComponent : {}
            // new logic
            previousTopicObj = sessions.previousTopic ? sessions.previousTopic : {}
            completedSessions = completedSessions.map(session => ({
                ...session, sessionStatus: 'completed'
            }))
            allSessions = [
                ...upComingSession,
                ...bookedSessions,
                ...completedSessions,
            ]
            if (viewContentBasedOnCurrentComponent && allSessions.length) {
                allSessions = allSessions.map(session => ({
                    ...session,
                    sessionStatus: get(session, 'sessionStatus') === 'completed' ? 'completed' : 'started'
                }))
            }
            completedSessions = allSessions.filter(session => get(session, 'sessionStatus') === 'completed')
        }



        const sessionsList = allSessions
            ? this.sortAscending(allSessions, ['topicOrder'])
                .map((session, i) => ({ ...session, i: i + 1, type: session.sessionStatus }))
            : []
        
        let nextSessionToShow = []
        if (sessionsList && sessionsList.length > 0) {
            nextSessionToShow = sessionsList[0]
        }
        for (let i = 0; i < sessionsList.length; i += 1) {
            if (sessionsList[i].type === 'started') {
                nextSessionToShow = sessionsList[i]
            } else if (sessionsList[i].type === 'completed') {
                nextSessionToShow = sessionsList[i + 1]
            }
        }
        return {
            firstComponent,
            previousTopicObj,
            upComingSessions,
            notBookedSessions,
            nextSessionToShow,
            completedSessions,
            allSessions: sessionsList,
            showBookOption: get(sessions, 'bookedSession', []).length ? false : true,
            showPurchaseOption: !get(nextSessionToShow, 'isAccessible'),
            courses: get(coursePackage, 'courses', [])
        }
    }
    getCurrentHomework = () => {
        const completedSessions = this.getCompletedSessions()
        if (completedSessions.length) {
            const sortedCompletedSessions = sortBy(completedSessions, 'order')
            return sortedCompletedSessions[sortedCompletedSessions.length - 1] || {}
        }
        return {}
    }
    getPastHomeWorks = () => {
        const completedSessions = this.getCompletedSessions()
        const pastHomeWorks = {}
        if (completedSessions.length) {
            const sortedCompletedSessions = sortBy(completedSessions, 'order').map((session, i) => ({ ...session, i: i + 1 }))
            sortedCompletedSessions.forEach((session, index) => {
                const topicChapterMapping = this.getTopicChapterMapping()
                const chapterId = topicChapterMapping[session.topic.id].chapterId
                if (pastHomeWorks[chapterId]) {
                    const currentList = pastHomeWorks[chapterId]
                    currentList.push(session)
                    pastHomeWorks[chapterId] = currentList
                } else {
                    pastHomeWorks[chapterId] = [session]
                }
            })
        }
        return pastHomeWorks
    }
    getTopicQuestionsMeta = (topicId) => {
        if (topicId) {
            const filteredTopic = this.getTopicDetail(topicId)
            if (filteredTopic) {
                const topicQuestionsLength = get(filteredTopic, 'topicQuestions', []).map(el => ({ ...el.question })).filter(el => get(el, 'status') === 'published').length
                const topicAssignmentLength = get(filteredTopic, 'topicHomeworkAssignmentQuestion', []).map(el => ({ ...el.assignmentQuestion })).length
                const practiceQuestionsLength = get(filteredTopic, 'topicComponentRule', []).filter(el => get(el, 'componentName') === 'homeworkPractice').length;
                return {
                    questionsLength: topicQuestionsLength, assignmentsLength: topicAssignmentLength, practiceLength: practiceQuestionsLength
                }
            }
        }
        return { questionsLength: null, assignmentsLength: null }
    }
    getHomeworkComponents = (topicId) => {
        if (topicId) {
            const topicDetail = this.getTopicDetail(topicId)
            const topicComponentRuleDoc = (sortBy(get(topicDetail, 'topicComponentRule', []), 'order') || [])
            return topicComponentRuleDoc.filter(el => homeworkComponents.includes(get(el, 'componentName')))
        }
        return []
    }
    getTopicDetail = (topicId) => {
        let { mentorMenteeSession } = this.props
        const { selectedBatch } = this.state
        mentorMenteeSession = (mentorMenteeSession && mentorMenteeSession.toJS()) || []
        if (mentorMenteeSession.length) {
            const topicDetail = mentorMenteeSession.find(session => get(session, 'topic.id') === topicId
                && get(session, 'batchId') === selectedBatch)
            return get(topicDetail, 'topic', {}) || {}
        }
        return {}
    }
    handleSolve = async (topicId) => {
        const { allSessions = [], courses = [] } = this.getSessions()
        const topicDetail = allSessions.find(session => get(session, 'topicId') === topicId)
        const { id: batchId, classroomTitle, documentType } = this.getCurrentBatchDetail()
        let courseId = ''
        if (topicDetail) {
            courseId = get(topicDetail, 'course.id')
        }
        const topicComponentRule = this.getHomeworkComponents(topicId)
        let redirectLink = ''
        if (topicComponentRule && topicComponentRule.length) {
            if (get(topicComponentRule[0], 'componentName') === 'homeworkAssignment') {
                redirectLink = `/homework/${courseId}/${topicId}/codingAssignment`
            } else if (get(topicComponentRule[0], 'componentName') === 'homeworkPractice') {
                const projectId = get(topicComponentRule[0], 'blockBasedProject.id')
                redirectLink = `/homework/${courseId}/${topicId}/${projectId}/practice`
            }
            redirectLink = `/homework/${courseId}/${topicId}/quiz`
        }
        if (redirectLink) {
            const thisCourse = courses.find(course => get(course, 'id') === courseId)
            const codingLanguage = getCourseLanguage(thisCourse)
            const sessionUrl = getStudentAppRoute({
                route: 'session-embed',
                courseId,
                topicId,
                batchId,
                sessionId: topicId,
                documentType,
                isRevisit: true,
                sessionStatus: 'completed',
                codingLanguage,
                backToPage: backToPageConst.trainingResourcesAssessment,
                classroomTitle,
                sessionUrl: redirectLink
            })
            if (sessionUrl) {
                window.open(sessionUrl, "_self");
            }
        }
    }
    getCompletedSessions = () => {
        let { mentorMenteeSession } = this.props
        const { selectedBatch } = this.state
        const completedSessions = []
        mentorMenteeSession = (mentorMenteeSession && mentorMenteeSession.toJS()) || []
        if (mentorMenteeSession.length) {
            mentorMenteeSession.forEach((session) => {
                if (session && this.isHomeworkIncluded(get(session, 'topic.id')) && get(session, 'batchId') === selectedBatch) {
                    completedSessions.push(session)
                }
            })
        }
        return completedSessions
    }

    isHomeworkIncluded = (topicId) => {
       const topicComponentRuleDoc = this.getHomeworkComponents(topicId)
        let isHomeworkVisible = false
        if (topicComponentRuleDoc && topicComponentRuleDoc.length) {
            topicComponentRuleDoc.forEach(rule => {
                if (rule && (homeworkComponents.includes(get(rule, 'componentName')))) {
                    isHomeworkVisible = true
                }
            })
        }
        return isHomeworkVisible
    }
    getTopicChapterMapping = () => {
        const completedSessions = this.getCompletedSessions()
        const chapters = {}
        if (completedSessions && completedSessions.length) {
            completedSessions.forEach((session) => {
                chapters[get(session, 'topic.id')] = {
                    chapterId: get(session, 'topic.chapter.id')
                }
            })
        }
        return chapters
    }
    getFirstOrLatestQuizReports = (sortKey = 'asc') => {
        return []
    }
    render() {
        if (this.isLoading()) {
          return (
            <div className={styles.trainingResourcesLoaderBackdrop}>
              <LoadingSpinner
                height='40vh'
                position='absolute'
                left='50%'
                top='50%'
                borderWidth='6px'
                transform='translate(-50%, -50%)'
                flexDirection='column'
                showLottie
              >
                <span className='timetable-loading-text'>Loading Details</span>
              </LoadingSpinner>
            </div>
          )
        }
        const { mentorBatches, selectedBatch } = this.state
        const modifiedfetchedClassrooms = mentorBatches.map(classroom => ({
            label: get(classroom, 'classroomTitle'),
            value: get(classroom, 'id'),
            key: get(classroom, 'id')
        }))
        const defaultBatch=modifiedfetchedClassrooms.find(batch=>get(batch,'value')===selectedBatch)
        return (
            <div className={styles.trainingResourcesMainContainer}>
                {modifiedfetchedClassrooms.length > 1 ? <div className={styles.dropdownContainer}>
                    <Select
                        components={{ IndicatorSeparator: () => null }}
                        value={defaultBatch}
                        controlShouldRenderValue={true}
                        placeholder='All Classrooms'
                        styles={newStyles}
                        isSearchable={false}
                        options={modifiedfetchedClassrooms}
                        onChange={(batch, action) => {
                            this.selectMentorBatch(batch.value)
                        }}
                    />
                </div> : null}
                <PastHomework
                    newFlow={true}
                    startNavigationLoading={() => { this.setState({ isNavigationLoading: true }) }}
                    stopNavigationLoading={() => { this.setState({ isNavigationLoading: false }) }}
                    currentHomework={this.getCurrentHomework()}
                    chapterWisePastHomework={this.getPastHomeWorks()}
                    topics={this.props.topics}
                    isLoading={this.isLoading()}
                    getTopicQuestionsMeta={(topicId) => this.getTopicQuestionsMeta(topicId)}
                    getHomeworkComponents={(topicId) => this.getHomeworkComponents(topicId)}
                    handleSolve={(topicId) => this.handleSolve(topicId)}
                    allSessions={this.getCompletedSessions()}
                    getFirstOrLatestQuizReports={this.getFirstOrLatestQuizReports}
                    fromTeacherApp
                />
            </div>
        )
    }
}

export default TrainingResourcesAssessment;
