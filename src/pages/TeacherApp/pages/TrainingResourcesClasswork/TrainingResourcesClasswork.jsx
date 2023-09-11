import { get } from 'lodash';
import React from 'react'
import Select from 'react-select'
import CollapsibleTopics from '../../../../components/CollapsibleTopics/CollapsibleTopics';
import fetchComponents from '../../../../queries/fetchComponents';
import fetchMenteeCourseSyllabus from '../../../../queries/sessions/fetchMenteeCourseSyllabus';
import fetchMentorChild from '../../../../queries/teacherApp/fetchMentorChild';
import { setDataInLocalStorage } from '../../../../utils/data-utils';
import { markAttendance } from '../../../../utils/mmSessionAddOrDelete';
import getStudentAppRoute from '../../../../utils/teacherApp/getRoute';
import TopicsSectionHeader from '../../../Sessions/components/TopicsSectionHeader';
import LoadingSpinner from '../../components/Loader/LoadingSpinner';
import { backToPageConst } from '../../constants';
import { getCourseLanguage } from '../../utils';
import { newStyles } from '../Classroom/ClassroomDetails/ClassroomDetailsHeader';
import styles from './TrainingResourcesClasswork.module.scss'

class TrainingResources extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            coursePackage: [],
            selectedCourse: '',
            sessionStatus: 'allClasses',
            mentorBatches: [],
            selectedBatch: '',
            isFetchingSyllabus: false,
        }
    }
    componentDidMount = async () => {
        const { mentorChild, mentorChildFetchStatus } = this.props
        const mentorBatches = (mentorChild && get(mentorChild.toJS(), 'batches', [])) || []
        const isFetchingMentorChild = (mentorChildFetchStatus && mentorChildFetchStatus.toJS() && get(mentorChildFetchStatus.toJS(), 'loading')) || false
        if ((!mentorBatches || !mentorBatches.length) && !isFetchingMentorChild) {
            await fetchMentorChild()
        } else {
            const batchIdFromParams = get(this.props, 'match.params.batchId', '')
            this.setState({ mentorBatches }, () => this.selectMentorBatch(batchIdFromParams))
        }
    }
    selectMentorBatch = async (batchId = '') => {
        const { mentorBatches } = this.state
        let selectedBatch = batchId
        if (!selectedBatch) {
            selectedBatch = get(mentorBatches, '[0].id')
        }
        this.setState({ selectedBatch, isFetchingSyllabus: true }, async () => {
            this.props.history.push(`/${backToPageConst.trainingResourcesClasswork}/${selectedBatch}`)
            setDataInLocalStorage("activeClassroom", selectedBatch)
            await fetchMenteeCourseSyllabus();
        })
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
    selectCourse=(e)=>{
        this.setState({selectedCourse:e.target.value})
    }
    clearAllSelectedCourses=()=>{
        this.setState({selectedCourse:null})
    }
    filterSessionsBy=(sessionStatus='allClasses')=>{
        this.setState({sessionStatus})
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
    checkIfCourseCompleted = (sessions) => {
        const upcomingSessions = get(sessions, 'upComingSession', [])
        const bookedSession = get(sessions, 'bookedSession', [])
        const { menteeCourseSyllabusStatus } = this.props
        if (menteeCourseSyllabusStatus && menteeCourseSyllabusStatus.getIn(['success'])) {
            if ((upcomingSessions && upcomingSessions.length < 1) &&
                (bookedSession && bookedSession.length < 1) &&
                !this.isLoading()
            ) {
                return true
            }
        }
        return false
    }
    getSelectedCourseTopics = (courseId = '', coursePackage = []) => {
        if(courseId && coursePackage){
            const courses=coursePackage.courses
            const course = courses.find(course => get(course, 'id') === courseId)
            return get(course,'topicsData') || []
        }
        return []
    }
    sortAscending = (data, path) => {
        return data.sort((a, b) => {
            return a[path] - b[path]
        })
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
    getPercentage=(val1,val2)=>{
        if(val1 && val2) return Math.round(val1*100/val2)
        return 0
    }
    fetchThisTopicData= async (topicId, courseId) => {
        const topicComponentsWithLink = await fetchComponents(
        topicId,
        courseId
        ).sidebar(true)
        return topicComponentsWithLink || []
    }
      goToInSession = async (topicId) => {
        let { mentorChild } = this.props
        const mentorChildId = (mentorChild && mentorChild.toJS() && get(mentorChild.toJS(), 'id')) || ''
        const { allSessions = [], courses = [] } = this.getSessions()
        const topicDetail = allSessions.find(session => get(session, 'topicId') === topicId)
        const { id: batchId, classroomTitle, documentType } = this.getCurrentBatchDetail()
        let courseId = ''
        if (topicDetail) {
            courseId = get(topicDetail, 'course.id')
            const batchSessionId = get(topicDetail, 'batchSession.id')
            if (mentorChildId && get(topicDetail, 'batchSession.id')) {
                await markAttendance(batchSessionId, mentorChildId)
            }
        }
        const topicComponentsWithLink = await this.fetchThisTopicData(topicId, courseId)
        let redirectLink = ''
        if (topicComponentsWithLink && topicComponentsWithLink.length) {
            const firstComponent = topicComponentsWithLink[0]
            redirectLink = get(firstComponent, 'link')
            if (get(firstComponent, 'navType') === 'parent' && get(firstComponent, 'childComponents', []).length) {
                redirectLink = get(firstComponent, 'childComponents[0].link')
            }
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
                backToPage: backToPageConst.trainingResourcesClasswork,
                classroomTitle,
                sessionUrl: redirectLink
            })
            if (sessionUrl) {
                window.open(sessionUrl, "_self");
            }
        }
    }
    getTopicsNestedInChapter = (sessions) => {
        const chapterTopicsMap = {}
        for (const session of sessions) {
        const { chapterTitle, chapterOrder, chapterId, ...topic } = session
        if (chapterTopicsMap[chapterId]) {
            chapterTopicsMap[chapterId].topics.push(topic)
        } else {
            chapterTopicsMap[chapterId] = {
            chapterTitle,
            chapterOrder,
            id: chapterId,
            topics: [topic]
            }
        }
        }
        const chapterTopics = Object.values(chapterTopicsMap)
        return chapterTopics
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
        const { coursePackages, menteeCourseSyllabus } = this.props
        const sessions = (menteeCourseSyllabus && menteeCourseSyllabus.toJS()[0]) || []
        const coursePackage = (coursePackages && coursePackages.toJS() && coursePackages.toJS()[0]) || {}
        const { sessionStatus, selectedCourse, mentorBatches, selectedBatch } = this.state
        const { completedSessions = [], allSessions = [] } = this.getSessions(sessions)
        const upComingChapterTopics = this.getTopicsNestedInChapter(
            allSessions.filter(session => session.type === 'upcoming')
        )
        const completedChapterTopics = this.getTopicsNestedInChapter(
            allSessions.filter(session => session.type === 'completed')
        )
        return (
            <div className={styles.trainingResourcesMainContainer}>
                <TopicsSectionHeader
                    courseCompletionPercentage={
                        this.getPercentage(
                            completedSessions.length,
                            allSessions.length
                        )
                    }
                    allSessions={allSessions}
                    coursePackage={coursePackage}
                    selectCourse={this.selectCourse}
                    selectedCourse={selectedCourse}
                    clearAllSelectedCourses={this.clearAllSelectedCourses}
                    filterSessionsBy={this.filterSessionsBy}
                    sessionStatus={sessionStatus}
                    fromTeacherApp
                    renderBatchSelector={() => {
                        const modifiedfetchedClassrooms = mentorBatches.map(classroom => ({
                            label: get(classroom, 'classroomTitle'),
                            value: get(classroom, 'id'),
                            key: get(classroom, 'id')
                        }))
                        if (modifiedfetchedClassrooms.length > 1) {
                            const defaultBatch=modifiedfetchedClassrooms.find(batch=>get(batch,'value')===selectedBatch)
                            return <div className={styles.dropdownContainer}>
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
                            </div>
                        }
                        return null
                    }}
                    />
                    <div>
                        <CollapsibleTopics
                        goToInSession={this.goToInSession}
                        startLoading={() => {}}
                        courses={get(coursePackage, 'courses', [])}
                        stopLoading={() => {}}
                        menteeCourseSyllabus={this.props.menteeCourseSyllabus && this.props.menteeCourseSyllabus.toJS()}
                        sessionStatus={sessionStatus}
                        coursePackageExists={true}
                        isB2BStudent={true}
                        topics={[]}
                        courseDetails={{}}
                        isCourseCompleted={() => this.checkIfCourseCompleted(menteeCourseSyllabus)}
                        loadingPage={this.props.loadingPage}
                        allSessions={allSessions}
                        selectedCourse={selectedCourse}
                        selectedCourseTopics={this.getSelectedCourseTopics(selectedCourse,coursePackage)}
                        upComingChapterTopics={upComingChapterTopics}
                        completedChapterTopics={completedChapterTopics}
                        studentProfile={{}}
                        coursePackageTopics={get(this.props.bookSessionProps, 'coursePackageTopics', []) || []}
                        batchSessions={[]}
                        fromTeacherApp
                        />
                    </div>
            </div>
        )
    }
}

export default TrainingResources;