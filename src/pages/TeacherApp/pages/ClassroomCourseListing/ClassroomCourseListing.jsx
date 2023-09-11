import React, { createRef } from 'react';
import styles from './classroomCourseListing.module.scss';
import ClassroomDetailsHeader from '../Classroom/ClassroomDetails/ClassroomDetailsHeader';
import get from 'lodash/get';
import cx from 'classnames'
import qs from 'query-string'
import sortBy from 'lodash/sortBy';
import fetchAllottedMentorBatches from '../../../../queries/teacherApp/classroomCourseListing/fetchAllottedMentorBatches';
import fetchBatchDetails from '../../../../queries/teacherApp/classroomCourseListing/fetchBatchDetails';
import fetchBatchSessions from '../../../../queries/teacherApp/classroomCourseListing/fetchBatchSessions';
import SessionModal from '../TimeTable/components/SessionModal/SessionModal';
import SessionCard, { isViewContentInTheory, renderTooltipContent } from './components/SessionCard';
import ProgressBar from '../Classroom/components/BatchCarousel/ProgressBar';
import { ChevronLeft } from '../../../../constants/icons';
import { NextArrowIcon } from '../../components/svg';
import LoadingSpinner from '../../components/Loader/LoadingSpinner';
import moment from 'moment';
import fetchMentorSession from '../../../../queries/teacherApp/classroomCourseListing/fetchMentorSession';
import { getSelectedSlotsStringArray } from '../../constants/report/getSlotTime';
import { getMappedCourseForTopic, getRevisionTopic, getSessionDetailsForModal, getTopicsOfCourse, sortBatches } from '../../utils';
import endBatchSession from '../../../../queries/teacherApp/endBatchSession';
import addMentorSession from '../../../../queries/mentorSessions/addMentorSession';
import addBatchSession from '../../../../queries/batchSessions/addBatchSession';
import updateMentorSession from '../../../../queries/mentorSessions/updateMentorSession';
import Button from '../../components/Button/Button';
import getPath from '../../../../utils/getPath';
import PreserveState from '../../../../components/PreserveState';
import { filterKey } from '../../../../utils/data-utils';
import ViewDetailsModal from './components/ViewDetailsModal';
import { isBase64 } from '../../../../utils/base64Utility';
import { backToPageConst } from '../../constants';
import markSessionAsIncomplete from '../../../../queries/teacherApp/markSessionAsIncomplete';
import getMe from '../../../../utils/getMe';
import { fireGtmEvent } from '../../../../utils/analytics/gtmActions';
import { gtmEvents } from '../../../../utils/analytics/gtmEvents';
import { ClearFilter } from './components/ClearFilter';
import { Pill } from './components/Pill';
import { ClassroomIcon } from '../../components/svg';
import { filterSessionType, getTooltipCount, redirectInClassroomPage, sessionType } from './utils';
import Tooltip from '../../../../library/Tooltip/Tooltip';
import fetchTeacherBatches from '../../../../queries/teacherApp/fetchTeacherBatches';

class ClassroomCourseListing extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            selectedBatchId: '',
            batches: [],
            coursePackageTopicRule: [],
            courseTopicsByClasstype: null,
            batchSessions: [],
            isSessionDetailsModalVisible: false,
            sessionDetails: {},
            isEndSessionModalVisible: false,
            isDeleteSessionModalVisible: false,
            coursePackageDetail: null,
            courses: [],
            selectedCourseId: '',
            selectedChapterIds: [],
            isCreatingSessionFrom: '',
            isBackToTopVisible: false,
            batchCurrentComponentTopic: null,
            isViewDetailsModalVisible: false,
            viewModalLoading: '',
            isCompletedLoading: false,
            viewCurrentSession: '',
            sessionName: '',
            courseRefContent: '',
            viewModalFooter: true,
            viewModalWidth: null,
            viewModalId: '',
            viewModalStatus: '',
            forceStartSessionBtn: false,
            forceStartSessionBtnCount: 1,
            fromTeacherTrainingBatch: (get(props, 'match.path', '').includes('/teacher/training-classrooms') || false),
            mentorChildData: this.props.mentorChildData.toJS() || [],
            firstTopicWithContent: "",
            firstTopicTheory:  "",
            selectedSessionType: "",
            filteredTopics: [],
            theoryTooltipShow: true,
        }
        this.isSessionDetailsModalOpenedRef = createRef()
        this.sessionTabref = createRef()
    }
    // checkIfClassroomEnabled = () => {
    //     const { loggedInUser } = this.props
    //     let loggedInUserData = (loggedInUser && loggedInUser.toJS()) || {}
    //      return get(loggedInUserData, 'mentorProfile.schools[0].isClassroomEnabled', false)
    //          || get(loggedInUserData, 'rawData.mentorProfile.schools[0].isClassroomEnabled')
    // }
    componentDidMount = async () => {
        const { match, loggedInUser } = this.props
        const batchIdFromParams = get(match, 'params.batchId')
        const screenWrapper = document.querySelector(".splitScreen-main-component")
        screenWrapper.addEventListener("scroll", this.scrollHandler)
        if (screenWrapper.scrollTop > 100) this.setState({ isBackToTopVisible: true })
        else this.setState({ isBackToTopVisible: false })
        if (batchIdFromParams) {
            this.setState({ selectedBatchId: batchIdFromParams }, this.fetchCoursePackageAndSessionsForSelectedBatch)
        }
        const user = loggedInUser && loggedInUser.toJS()
        await fetchTeacherBatches({}, user)
        setTimeout(() => {
          const teacherPageViewEvent = gtmEvents.classroomSessionsPageVisit
          const userParams = this.getUserParams()
          fireGtmEvent(teacherPageViewEvent,{userParams})
        })
    }
    scrollHandler = () => {
        const screenWrapper = document.querySelector(".splitScreen-main-component")
        if (screenWrapper.scrollTop > 100) this.setState({ isBackToTopVisible: true })
        else this.setState({ isBackToTopVisible: false })
    }
    componentWillUnmount = () => {
        const screenWrapper = document.querySelector(".splitScreen-main-component")
        screenWrapper.removeEventListener("scroll", this.scrollHandler)
    }
    fetchCoursePackageAndSessionsForSelectedBatch = async () => {
        const { selectedBatchId } = this.state
        if (this.state.batchSessions.length || this.state.coursePackageTopicRule.length) {
            this.setState({ batchSessions: [], coursePackageTopicRule: [] })
        }
        let { loggedInUser } = this.props
        const user = loggedInUser && loggedInUser.toJS()
        fetchBatchDetails(selectedBatchId, user)
        fetchBatchSessions(selectedBatchId, user)
    }
    setCoursePackageTopicRule = () => {
        let { batchDetails } = this.props
        const { selectedBatchId } = this.state
        batchDetails = filterKey(batchDetails, `batchCoursePackageDetail/${selectedBatchId}`)
        batchDetails = (batchDetails && batchDetails.toJS()) || []
        if (batchDetails && batchDetails.length) {
            batchDetails = batchDetails[0]
            const batchCurrentComponentTopic = get(batchDetails, 'currentComponent.currentTopic')
            let coursePackageTopicRule = get(batchDetails, 'coursePackage.topics', [])
            if (get(batchDetails, 'coursePackageTopicRule', []).length) {
                coursePackageTopicRule = get(batchDetails, 'coursePackageTopicRule', [])
            }
            coursePackageTopicRule = sortBy(coursePackageTopicRule, 'order')
            const courses = get(batchDetails, 'coursePackage.courses', [])
            coursePackageTopicRule.forEach(topicRule => {
                if (get(topicRule, 'topic')) {
                    topicRule.course = getMappedCourseForTopic(courses, get(topicRule, 'topic'))
                }
                if (get(topicRule, 'isRevision', false)) {
                    const revisionTopic = getRevisionTopic(coursePackageTopicRule, topicRule)
                    if (revisionTopic) {
                        topicRule.course = get(revisionTopic, 'course')
                        topicRule.order = get(revisionTopic, 'order')
                        topicRule.topic = get(revisionTopic, 'topic')
                    }
                }
            })
            const coursePackageDetail = {
                title: get(batchDetails, 'coursePackage.title'),
                id: get(batchDetails, 'coursePackage.id'),
            }
            const courseTopicsByClasstype = this.getTopicsByClassType(this.getFilterTopics(coursePackageTopicRule))
            this.setState({
                coursePackageTopicRule,
                filteredTopics: coursePackageTopicRule,
                courseTopicsByClasstype,
                coursePackageDetail,
                courses: sortBy(courses, 'order'),
                batchCurrentComponentTopic
            }, this.onLoadSessionClick)
        }
    }
    setBatchSessionsData = () => {
        let { batchSessions } = this.props
        batchSessions = (batchSessions && batchSessions.toJS()) || []
        console.log({batchSessions})
        this.setState({ batchSessions: sortBy(batchSessions, 'bookingDate') }, this.onLoadSessionClick)
    }
    getTopicOrder = (topic) => {
        if (!topic) return 0;
        const { filteredTopics } = this.state
        let filteredCoursePackageTopicRule = []
        filteredTopics.forEach((topicRule,i) => {
            const isRevision = get(topicRule, 'isRevision', false)
            const isMandatory = get(topicRule, 'isMandatory', false)
            const classType = get(topicRule, 'topic.classType')
            const category = get(topicRule, 'course.category')
            if(classType === 'lab'){
                if(!isRevision && get(topicRule, 'topic.id')){
                    filteredCoursePackageTopicRule.push(topicRule)
                }
            }
        })
        const topicRule = filteredCoursePackageTopicRule.find(topicRule => get(topicRule, 'topic.id') === get(topic, 'id'))
        if (topicRule) return get(topicRule, 'order')
        return 0;
    }
    onLoadSessionClick = () => {
        const { sessionDetails, selectedBatchId, fromTeacherTrainingBatch  } = this.state
        const { sessionId, endCurrentSession, inCompleteSession } = qs.parse(window.location.search)
        if (get(sessionDetails, 'id') && !sessionId && (!endCurrentSession || !inCompleteSession)) return
        const { batchSessionToEnd, batchSessionToMarkAsIncomplete } = this.getFilteredBatchSessionAndTopicRule()
        let retakeSessionId = false
        const startedRetakeSession = get(batchSessionToEnd, 'retakeSessions', []).find(retakeSession => get(retakeSession, 'sessionStatus') === "started")
        if (startedRetakeSession) {
            retakeSessionId = get(startedRetakeSession, 'id')
        }
        if (batchSessionToEnd) {
            this.onSessionClick({
                batchSession: batchSessionToEnd,
                topicRule: get(batchSessionToEnd, 'topic'),
                topicOrder: get(batchSessionToEnd, 'topicOrder'),
                sessionStatus: 'completed',
                isEndingSession: true
            })
            endBatchSession(sessionId, retakeSessionId).then(res =>{
                if (get(res, 'updateBatchSession.id')) {
                    const newRetakeSessions = this.getUpdatedRetakeSessions(batchSessionToEnd, 'endSession', retakeSessionId, {})
                    this.updateSessionLocally('updateSessionStatus', get(res, 'updateBatchSession.id'), {
                        ...get(res, 'updateBatchSession', {}),
                        retakeSessions: newRetakeSessions
                    })
                }
            })
        } else if (batchSessionToMarkAsIncomplete) {
            this.onSessionClick({
                batchSession: batchSessionToMarkAsIncomplete,
                topicRule: get(batchSessionToMarkAsIncomplete, 'topic'),
                topicOrder: get(batchSessionToMarkAsIncomplete, 'topicOrder'),
            })
            markSessionAsIncomplete({ sessionId })
        }
        if ((batchSessionToEnd || batchSessionToMarkAsIncomplete)) {
            if (fromTeacherTrainingBatch) {
                return this.props.history.push(`/${backToPageConst.trainingClassrooms}/${selectedBatchId}`)
            } else this.props.history.push(`/${backToPageConst.classroom}/${selectedBatchId}`)
        }
    }
    
    getUpdatedRetakeSessions = (batchSession, updateType, retakeSessionId, updateObj = null) => {
        let retakeSessions = get(batchSession, 'retakeSessions', [])
        if (updateType === 'endSession' && retakeSessionId) {
            const retakeSessionIndex = retakeSessions.findIndex(retakeSession => get(retakeSession, 'id') === retakeSessionId)
            if (retakeSessionIndex !== -1) retakeSessions[retakeSessionIndex].sessionStatus = 'completed'
        } else if (updateType === 'retakeSession' && updateObj) {
            retakeSessions = [...retakeSessions, updateObj]
        }
        return retakeSessions || []
    }
    componentDidUpdate = (prevProps, prevState) => {
        const { batchesFetchStatus, batches, batchDetailsFetchStatus, batchSessionsFetchStatus,
            mentorChildFetchStatus, mentorChildData, batchDetails } = this.props
        console.log('batch details ', batchDetails && batchDetails.toJS())
        const { selectedBatchId } = this.state
        if (batchesFetchStatus && !get(batchesFetchStatus.toJS(), 'loading')
            && get(batchesFetchStatus.toJS(), 'success') &&
            (prevProps.batchesFetchStatus !== batchesFetchStatus)) {
            this.setState({
                batches: sortBatches((batches && batches.toJS())[0].groups || []) || []
            })
        }
        const batchDetailsFetchingStatus = batchDetailsFetchStatus && batchDetailsFetchStatus.getIn([`batchCoursePackageDetail/${selectedBatchId}`])
        const prevBatchDetailsFetchingStatus = prevProps.batchDetailsFetchStatus && prevProps.batchDetailsFetchStatus.getIn([`batchCoursePackageDetail/${selectedBatchId}`])
        if (batchDetailsFetchingStatus && !get(batchDetailsFetchingStatus.toJS(), 'loading')
            && get(batchDetailsFetchingStatus.toJS(), 'success') &&
            (prevBatchDetailsFetchingStatus !== batchDetailsFetchingStatus)) {
            this.setCoursePackageTopicRule()
        }
        if (batchSessionsFetchStatus && !get(batchSessionsFetchStatus.toJS(), 'loading')
            && get(batchSessionsFetchStatus.toJS(), 'success') &&
            (prevProps.batchSessionsFetchStatus !== batchSessionsFetchStatus)) {
            this.setBatchSessionsData()
        }
        if (mentorChildFetchStatus && !get(mentorChildFetchStatus.toJS(), 'loading')
            && get(mentorChildFetchStatus.toJS(), 'success') &&
            (prevProps.mentorChildFetchStatus !== mentorChildFetchStatus)) {
                // let mentorChildDataTemp = (mentorChildData && mentorChildData.toJS()) || []
                // this.setState({ mentorChildData: mentorChildDataTemp })
        }
        const batchIdFromParams = get(this.props, 'match.params.batchId')
        const prevBatchIdFromParams = get(prevProps, 'match.params.batchId')
        if (prevBatchIdFromParams !== batchIdFromParams) {
            this.setState({
                selectedBatchId: batchIdFromParams,
                selectedChapterIds: [],
                coursePackageTopicRule: [],
                batchSessions: [],
                coursePackageDetail: null,
                courses: [],
                selectedCourseId: '',
                isCreatingSessionFrom: '',
                batchCurrentComponentTopic: null,
                firstTopicWithContent: '',
            }, this.fetchCoursePackageAndSessionsForSelectedBatch)
        }
    }
    labSessions = () => {
       return get(this.state.courseTopicsByClasstype,'lab',[])
    }
    getFilteredBatchSessionAndTopicRule = () => {
        const { batchSessions,coursePackageTopicRule } = this.state
        const { sessionId, endCurrentSession, inCompleteSession } = qs.parse(window.location.search)
        let batchSessionsDetailsArray = []
        const labSessions = this.labSessions()
        batchSessions.forEach(batchSession => {
            const topicRuleForSessionIndex = labSessions.findIndex(topicRule =>
                get(topicRule, 'topic.id') === get(batchSession, 'topicData.id'))
            if (topicRuleForSessionIndex !== -1) {
                const topicRuleForSession = labSessions[topicRuleForSessionIndex]
                batchSessionsDetailsArray.push({
                    ...batchSession,
                    topicOrder: topicRuleForSessionIndex + 1,
                    topic: topicRuleForSession
                })
            }
        })
        batchSessionsDetailsArray = sortBy(batchSessionsDetailsArray, 'topicOrder') 
        const completedBatchSessions = batchSessionsDetailsArray.filter((batchSession) =>
            get(batchSession, 'sessionStatus') === 'completed')
        const startedOrCompletedSessions = batchSessionsDetailsArray.filter((batchSession) =>
            get(batchSession, 'sessionStatus') === 'completed' || get(batchSession, 'sessionStatus') === 'started')
        const liveBatchSessions = batchSessionsDetailsArray.filter(batchSession => get(batchSession, 'sessionStatus') === 'started' || get(batchSession, 'isRetakeSession'))
        let batchSessionToEnd = null
        let batchSessionToMarkAsIncomplete = null
        if (sessionId && endCurrentSession) {
            batchSessionToEnd = batchSessionsDetailsArray.find(batchSession => get(batchSession, 'id') === sessionId)
        }
        if (sessionId && inCompleteSession) {
            batchSessionToMarkAsIncomplete = liveBatchSessions.find(batchSession => get(batchSession, 'id') === sessionId)
        }
        return {
            coursePackageTopicRule: this.getFilterTopics(coursePackageTopicRule),
            batchSessions: batchSessionsDetailsArray,
            completedBatchSessions,
            liveBatchSessions,
            batchSessionToEnd: batchSessionToEnd ? { ...batchSessionToEnd, isRetakeSession: false } : null,
            startedOrCompletedSessions,
            batchSessionToMarkAsIncomplete
        }
    }
    getFilterTopics = (topics,classTypeFilter) => {
        classTypeFilter = 'lab'
        let filteredCoursePackageTopicRule = []
         topics.forEach((topicRule,i) => {
            const isRevision = get(topicRule, 'isRevision', false)
            const isMandatory = get(topicRule, 'isMandatory', false)
            const classType = get(topicRule, 'topic.classType')
            const category = get(topicRule, 'course.category')
            if(classTypeFilter && classTypeFilter !== classType) return
            if(!isRevision && get(topicRule, 'topic.id')){
                filteredCoursePackageTopicRule.push(topicRule)
            }
          
        })
        return filteredCoursePackageTopicRule
        
    }
    getTopicsByClassType = (topics) => {
        let topicsByClassType = { theory: [], lab: [] }    
        topics.forEach(topicRule => {
            if (get(topicRule, 'topic.classType')) {
                const classType = get(topicRule, 'topic.classType')
                topicsByClassType[classType].push(topicRule)
            }
        }) 
        return topicsByClassType
    }
    getFirstTopicIdForCourse = () => {
        const {courses } = this.state
        const {coursePackageTopicRule} = this.getFilteredBatchSessionAndTopicRule()
        let firstTopic = []
        const filteredCourses = courses.filter((course) => {
            const courseTopics = getTopicsOfCourse(course, coursePackageTopicRule)
            if (courseTopics.length) return true
            return false
        })
        filteredCourses.forEach(course => {
            const courseId = get(course, 'id')
            const firstTopicForCourse = coursePackageTopicRule.find(topicRule => get(topicRule, 'course.id') === courseId)
            if (firstTopicForCourse) firstTopic.push(get(firstTopicForCourse, 'topic.id'))
        })
        return firstTopic
    }
    getUserParams = () => {
        const { sessionId } = qs.parse(window.location.search)
        const me = getMe()
        return {
          userName: get(me, 'name'),
          userId: get(me,'id'),
          role: get(me,'thisChild.role'),
          schoolName: get(me,'thisChild.schoolTeacher.mentorProfile.schools[0].name',''),
          schoolId: get(me,'thisChild.schoolTeacher.mentorProfile.schools[0].id'),
          batchId: get(this.props, 'match.params.batchId'),
          sessionId:sessionId,
        }
    }
    onViewReportsCtaClick = () => {
        const viewReportClicked = gtmEvents.reportsViewedViaClassroomSessionsPage
        const userParams = this.getUserParams()
        fireGtmEvent(viewReportClicked,{userParams})
    }
    getChapterForSelectedCourse = () => {
        const { courses, selectedCourseId } = this.state
        if (!selectedCourseId) return []
        // update here for - theory classes
        // const coursePackageTopicRule  = this.state.filteredTopics

        const coursePackageTopicRule  = this.getFilterTopics(this.state.coursePackageTopicRule)
        const selectedCourse = courses.find(course => get(course, 'id') === selectedCourseId)
            const courseTopics = get(selectedCourse, 'topicsData', []).map(topic => get(topic, 'id'))
            const selectedCourseTopics = []
            coursePackageTopicRule.forEach(topicRule => {
                if (courseTopics.includes(get(topicRule, 'topic.id'))) {
                    selectedCourseTopics.push(topicRule)
                }
            })
            const groupedTopicsByChapter = selectedCourseTopics.reduce((accumulator, currentValue) => {
                accumulator[get(currentValue, 'topic.chapter.id')] =
                    accumulator[get(currentValue, 'topic.chapter.id')] || {
                        chapterId: get(currentValue, 'topic.chapter.id'),
                        chapterTitle: get(currentValue, 'topic.chapter.title'),
                        chapterOrder: get(currentValue, 'topic.chapter.order'),
                        topics: []
                    };
                accumulator[get(currentValue, 'topic.chapter.id')].topics.push(currentValue);
                return accumulator;
            }, {});
            const chaptersData = []
            Object.keys(groupedTopicsByChapter).forEach(chapterId => {
                chaptersData.push({
                    ...groupedTopicsByChapter[chapterId]
                })
            })
            return sortBy(chaptersData, 'chapterOrder')
    }
    onCourseClick = (courseId) => {
        this.setState(prevState => ({
            selectedCourseId: prevState.selectedCourseId === courseId ? '' : courseId,
        }), () => {
            const chaptersData = this.getChapterForSelectedCourse()
            if (chaptersData.length) {
                this.onChapterClick(get(chaptersData, '[0].chapterId'))
            } else {
                this.setState({ selectedChapterIds: [] })
            }
        })
    }
    onChapterClick = (chapterId) => {
        const { selectedChapterIds } = this.state
        if (selectedChapterIds.includes(chapterId)) {
            const newSelectedChapterIds = [...selectedChapterIds].filter(selectedChapterId => selectedChapterId !== chapterId)
            this.setState({ selectedChapterIds: newSelectedChapterIds })
        } else {
            this.setState({ selectedChapterIds: [...selectedChapterIds, chapterId] })
        }
    }
    renderClassroomDetail = () => {
        const { coursePackageDetail, courses, selectedCourseId, selectedBatchId, fromTeacherTrainingBatch } = this.state
        const { completedBatchSessions, startedOrCompletedSessions } = this.getFilteredBatchSessionAndTopicRule()
        const coursePackageTopicRule = this.labSessions()
        const classProgressPercent = (startedOrCompletedSessions.length / coursePackageTopicRule.length) * 100
        const filteredCourses = courses.filter((course) => {
            const courseTopics = getTopicsOfCourse(course, coursePackageTopicRule)
            if (courseTopics.length) return true
            return false
        })
        const classroomDetail = (
            <div>
                <div className={styles.courseProgressDetails}>
                    <div className={styles.courseProgressHeader}>
                        <h2 className={styles.courseProgressTitle}>
                            {get(coursePackageDetail, 'title') ? <span className={styles.coursePackageTitle}>{get(coursePackageDetail, 'title')} : </span> : null}
                            <span className={styles.courseProgressPercent}>{Math.round(classProgressPercent || 0)}%</span>
                        </h2>
                        <p className={styles.courseProgressOutOfValue}>({completedBatchSessions.length}/{get(this.state.courseTopicsByClasstype,'lab',[]).length} Lab Sessions Complete)</p>
                    </div>
                    {!fromTeacherTrainingBatch ?
                        <button className={styles.viewReportCta} onClick={() => {
                            const teacherPageViewEvent = gtmEvents.reportsViewedViaClassroomSessionsPage
                            const userParams = this.getUserParams()
                            fireGtmEvent(teacherPageViewEvent,{userParams})
                            this.props.history.push(`/teacher/reports/classroom/${selectedBatchId}`)}}>View Reports</button>
                         : null}
                </div>
                <ProgressBar done={classProgressPercent || 0} fromClassroomCoursePage />
                <div className={styles.pillContainer}>
                    {filteredCourses.map((course) => (
                        <Pill
                            active={selectedCourseId === get(course, 'id')}
                            handleClick={() => this.onCourseClick(get(course, 'id'))}
                            iconComponent={get(course, 'thumbnail.uri') ? <div className={styles.courseThumbnail}>
                                     <img src={getPath(get(course, 'thumbnail.uri'))} alt='' />
                                     </div> : null
                                 }
                            label={get(course, 'title')}
                        />
                    ))}
                    {selectedCourseId ?
                        <ClearFilter 
                            handleClick={() => this.onCourseClick(selectedCourseId)} 
                        /> : null
                    }
                    <div className={cx(styles.pillContainer,styles.sessionTabContainer)}>
                        {this.state.selectedSessionType ?
                            <ClearFilter 
                                handleClick={() => {
                                    this.setState({selectedSessionType: ''})
                                    this.setState({filteredTopics: this.state.coursePackageTopicRule})
                                }} 
                            /> : null
                        }
                        {/* {
                            sessionType.map((item,index) => {
                                return (
                                    <>
                                        <div ref={this.sessionTabref}> 
                                            <Pill 
                                                key={index}
                                                active={this.state.selectedSessionType === item.value}
                                                label={item.label}
                                                handleClick={() => {
                                                    this.setState({selectedSessionType: item.value})
                                                    const filterSessions = filterSessionType(item.value, this.state.coursePackageTopicRule)
                                                    this.setState({filteredTopics: filterSessions})
                                                
                                                }}
                                                iconComponent={<ClassroomIcon />}

                                            />
                                        </div>
                                    </>
                                )
                            })
                        
                        } */}
                       
                    </div>
                </div>
            </div>
        )
        return classroomDetail
    }
    updateFirstTopicWithContent = (topicId) => {
        if(this.state.firstTopicWithContent) return
        this.setState(
            {
                firstTopicWithContent: topicId
            }
        )
    }
    updateFirstTopicTheory = (topicId) => {
        if(this.state.firstTopicTheory) return
        this.setState(
            {
            firstTopicTheory: topicId
            }
        )
    }
    renderClassroomSessions = () => {
        const { loggedInUser } = this.props
        const { selectedCourseId, selectedChapterIds, isCreatingSessionFrom,viewModalLoading, mentorChildData } = this.state
        const sessionCards = []
        const upComingCard = []
        const {
            batchSessions,
            completedBatchSessions,
            liveBatchSessions,
        } = this.getFilteredBatchSessionAndTopicRule()
        const coursePackageTopicRule = this.getFilterTopics(this.state.filteredTopics)
        const labSessions = this.labSessions()
        const lastCompletedBatchSession = completedBatchSessions.length ?
            completedBatchSessions[completedBatchSessions.length - 1] : null
        let upComingOrLiveSession = null
        if (liveBatchSessions.length) {
            const latestLiveSession = liveBatchSessions[liveBatchSessions.length - 1]
            const topicRuleForLiveSession = labSessions.find(topicRule =>
                get(topicRule, 'topic.id') === get(latestLiveSession, 'topicData.id'))
            upComingOrLiveSession = {
                ...latestLiveSession,
                currentStatus: 'liveSession',
                topic: topicRuleForLiveSession,
                topicOrder: get(topicRuleForLiveSession, 'order'),
                topicId: get(topicRuleForLiveSession, 'topic.id'),
                topicDetail: get(topicRuleForLiveSession, 'topic')
            }
        }
        else if (!liveBatchSessions.length && lastCompletedBatchSession) {
            const lastCompletedBatchSessionIndex = labSessions.findIndex(topicRule =>
                get(topicRule, 'topic.id') === get(lastCompletedBatchSession, 'topicData.id'))
            
            if (lastCompletedBatchSessionIndex !== -1 && lastCompletedBatchSessionIndex < labSessions.length - 1) {
                const upComingTopicDetail = labSessions[lastCompletedBatchSessionIndex + 1]
                upComingOrLiveSession = {
                    ...upComingTopicDetail,
                    currentStatus: 'upComingSession',
                    topicOrder: get(upComingTopicDetail, 'order'),
                    topicId: get(upComingTopicDetail, 'topic.id'),
                    topicDetail: get(upComingTopicDetail, 'topic')
                }
            }
        }
        else {
            const upComingTopicDetail = labSessions[0]
            upComingOrLiveSession = {
                ...upComingTopicDetail,
                currentStatus: 'upComingSession',
                topicOrder: get(upComingTopicDetail, 'order'),
                topicId: get(upComingTopicDetail, 'topic.id'),
                topicDetail: get(upComingTopicDetail, 'topic')
            }
        }
        let nextUpComingTopic = null;
        if (upComingOrLiveSession) {
            const topicDetail = get(upComingOrLiveSession, 'topicDetail');
            const { currentStatus: sessionStatus, title: sessionTitle } = upComingOrLiveSession
            const upComingOrLiveSessionIndex = labSessions.findIndex(topicRule => get(topicRule, 'topic.id') === get(topicDetail, 'id'))
            const sessionOrder = (topicDetail && this.state.courseTopicsByClasstype) && (this.state.courseTopicsByClasstype[get(topicDetail,'classType')] || []).findIndex(topicRule => get(topicRule,'topic.id') === get(topicDetail,'id')) + 1
            const batchSessionForTopic = batchSessions.find(batchSession => get(batchSession, 'topicData.id') === get(upComingOrLiveSession, 'topicId'))
            let updatedSessionStatus
            const originalSessionStatus = get(batchSessionForTopic, 'sessionStatus')
            const topicComponentRule = get(topicDetail, 'topicComponentRule', [])
            if (originalSessionStatus === 'allotted' && topicComponentRule && !topicComponentRule.length) {
                updatedSessionStatus = 'allotted'
            }
            upComingCard.push(
                <SessionCard
                    loggedInUser={loggedInUser}
                    sessionStatus={sessionStatus}
                    withUpComingCard={true}
                    sessionOrder={sessionOrder}
                    topicDetail={topicDetail}
                    sessionTitle={sessionTitle}
                    topicsByClassType={this.state.courseTopicsByClasstype}
                    key={get(topicDetail, 'id')}     
                    sessionDetails={{ ...batchSessionForTopic }}
                    isCreatingSession={isCreatingSessionFrom === 'mainSessionCard'}
                    mentorChildData={this.props.mentorChildData.toJS()}
                    topicRule= {labSessions[upComingOrLiveSessionIndex]}
                    onSessionClick={() => this.onSessionClick({
                        batchSession: batchSessionForTopic,
                        topicRule: labSessions[upComingOrLiveSessionIndex],
                        topicOrder: sessionOrder,
                        sessionStatus: updatedSessionStatus ? updatedSessionStatus : sessionStatus,
                        isCreatingSessionFrom: 'mainSessionCard',
                        viewModalLoading: 'mainSessionCard'
                    })}
                />
            )
        }
        // const isSessionStartedOneHrBefore = liveBatchSessions.length && get(upComingOrLiveSession, 'sessionStartDate')
        //     && get(upComingOrLiveSession, 'sessionStatus') === 'started' && getSlotDifference(get(upComingOrLiveSession, 'sessionStartDate'), 1)
        // let nextTopicIdToStart = ''
        // if (isSessionStartedOneHrBefore) {
        //     const currentTopicRuleIndex = coursePackageTopicRule.findIndex(topicRule => get(topicRule, 'topic.id') === get(upComingOrLiveSession, 'topicId'))
        //     if (currentTopicRuleIndex !== -1) {
        //         const nextTopicRule = coursePackageTopicRule[currentTopicRuleIndex + 1]
        //         nextTopicIdToStart = get(nextTopicRule, 'topic.id')
        //     }
        // }
        if (lastCompletedBatchSession) {
            const lastCompletedBatchSessionIndex = coursePackageTopicRule.findIndex(topicRule =>
                get(topicRule, 'topic.id') === get(lastCompletedBatchSession, 'topicData.id'))
            if (lastCompletedBatchSessionIndex !== -1 && lastCompletedBatchSessionIndex < coursePackageTopicRule.length - 1) {
                const upComingTopicDetail = coursePackageTopicRule[lastCompletedBatchSessionIndex + 1]
                if (upComingTopicDetail) nextUpComingTopic = upComingTopicDetail
            }
        }
        if (selectedCourseId) {
            const chaptersData = this.getChapterForSelectedCourse()
            chaptersData.forEach((chapterData, index) => {
                const isSelectedChapter = selectedChapterIds.includes(get(chapterData, 'chapterId'))
                const classesCount = (get(chapterData, 'topics', []) || []).length
                sessionCards.push(
                    <>
                        <div className={styles.classroomCourseListingChapter}>
                            <div className={styles.classroomCourseChapterHeader}
                                onClick={() => this.onChapterClick(get(chapterData, 'chapterId'))}
                            >
                                <div className={styles.classroomCourseChapterTitleArea}>
                                    <NextArrowIcon className={cx(styles.classroomCourseChapterArrow, isSelectedChapter && styles.classroomCourseChapterArrowDown)} />
                                    <p className={styles.classroomCourseChapterTitle}>Chapter {index + 1} - {get(chapterData, 'chapterTitle')}</p>
                                </div>
                                <span className={styles.classroomCourseTopicCount}>{classesCount} {`Class${classesCount === 1 ? '' : 'es'}`}</span>
                            </div>
                            <div className={cx(styles.classroomCourseChaptersCollapsed,
                                isSelectedChapter && styles.classroomCourseChaptersOpened)}>
                                {get(chapterData, 'topics', []).map((topicRule,i) => {
                                    const batchSessionForTopic = batchSessions.find(batchSession =>
                                        get(batchSession, 'topicData.id') === get(topicRule, 'topic.id')
                                        && get(batchSession, 'courseData.id') === get(topicRule, 'course.id'))
                                    let sessionStatus = get(batchSessionForTopic, 'sessionStatus')
                                    const { topic: topicDetail, title: sessionTitle } = topicRule
                                    if (upComingOrLiveSession && get(upComingOrLiveSession, 'topicId') === get(topicDetail, 'id')) {
                                        sessionStatus = get(upComingOrLiveSession, 'currentStatus')
                                    }
                                    const topicOrderValue = coursePackageTopicRule.findIndex(topic =>
                                        get(topic, 'topic.id') === get(topicRule, 'topic.id'))
                                    if((!sessionStatus || sessionStatus === 'allotted') && topicOrderValue > 0 ) {
                                        const prevTopic = get(chapterData, 'topics', [])[i - 1]
                                        const prevTopicSession = batchSessions.find(batchSession =>
                                            get(batchSession, 'topicData.id') === get(prevTopic, 'topic.id')
                                            && get(batchSession, 'courseData.id') === get(prevTopic, 'course.id'))
                                        const prevTopicSessionStatus = get(prevTopicSession, 'sessionStatus')
                                        if (prevTopicSessionStatus === 'started' || prevTopicSessionStatus === 'completed') {
                                            sessionStatus = 'upComingSession'
                                        }
                                        else{
                                            sessionStatus = 'allotted'
                                        }
                                    }                                   
                                    if (get(batchSessionForTopic, 'sessionStatus') === 'completed' && get(batchSessionForTopic, 'retakeSessions', []).length) {
                                        const retakeSession = get(batchSessionForTopic, 'retakeSessions', []).find(retakeSession => get(retakeSession, 'sessionStatus') !== 'completed')
                                        if (retakeSession && get(retakeSession, 'sessionStatus') === 'allotted') sessionStatus = 'upComingSession'
                                    }
                                    if (liveBatchSessions.length && upComingOrLiveSession) {
                                        const lastStartedSessionIndex = coursePackageTopicRule.findIndex(topicRule => get(topicRule, 'topic.id') === get(upComingOrLiveSession, 'topicId'))
                                        if (topicOrderValue < lastStartedSessionIndex && sessionStatus === 'allotted') sessionStatus = 'upComingSession'
                                    }
                                    if (nextUpComingTopic && sessionStatus === 'allotted') {
                                        if (get(topicRule, 'topic.id') === get(nextUpComingTopic, 'topic.id')) {
                                            sessionStatus = 'upComingSession'
                                        } else {
                                            const nextUpComingTopicIndex = coursePackageTopicRule.findIndex(topicRule => get(topicRule, 'topic.id') === get(nextUpComingTopic, 'topic.id'))
                                            if (topicOrderValue < nextUpComingTopicIndex) sessionStatus = 'upComingSession'
                                        }
                                    }    
                                    const sessionOrder = (topicDetail && this.state.courseTopicsByClasstype) && (this.state.courseTopicsByClasstype[get(topicDetail,'classType')] || []).findIndex(topicRule => get(topicRule,'topic.id') === get(topicDetail,'id')) + 1
                                    if(this.getFirstTopicIdForCourse().includes(get(topicRule, 'topic.id')) && (!sessionStatus || sessionStatus === 'allotted')) sessionStatus = 'upComingSession'
                                    // if (this.state.forceStartSessionBtn && sessionStatus === 'allotted') sessionStatus = 'upComingSession'
                                     const getTopicComponentRule = get(topicRule, 'topic.topicComponentRule', []).length > 0
                                     if (sessionStatus === 'allotted') {
                                        sessionStatus = 'upComingSession'
                                     }
                                     if(!getTopicComponentRule){
                                        sessionStatus = 'allotted'
                                     }
                                    return (
                                        <SessionCard
                                            loggedInUser={loggedInUser}
                                            sessionStatus={sessionStatus}
                                            topicDetail={topicDetail}
                                            sessionOrder={sessionOrder}
                                            sessionTitle={sessionTitle}
                                            sessionDetails={{ ...batchSessionForTopic }}
                                            topicRule={topicRule}
                                            topicsByClassType={this.state.courseTopicsByClasstype}                                    
                                            key={get(topicDetail, 'id')}
                                            isCreatingSession={isCreatingSessionFrom === `bottomSessionCard-${get(topicRule, 'topic.id')}`}
                                            isViewModalLoading={viewModalLoading === `bottomSessionCard-${get(topicRule, 'topic.id')}`}
                                            mentorChildData={this.props.mentorChildData.toJS()}
                                            onSessionClick={() => this.onSessionClick({
                                                batchSession: batchSessionForTopic,
                                                topicRule: topicRule,
                                                topicOrder: sessionOrder,
                                                sessionStatus,
                                                isCreatingSessionFrom: `bottomSessionCard-${get(topicRule, 'topic.id')}`,
                                                viewModalLoading: `bottomSessionCard-${get(topicRule, 'topic.id')}`
                                            })}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                        {index < chaptersData.length - 1 && <div className={styles.classroomCourseChapterDivider} />}
                    </>
                )
            })
        } else {
            coursePackageTopicRule.forEach((topicRule, ind) => {
                const batchSessionForTopic = batchSessions.find(batchSession =>
                    get(batchSession, 'topicData.id') === get(topicRule, 'topic.id')
                    && get(batchSession, 'courseData.id') === get(topicRule, 'course.id'))
                let sessionStatus = get(batchSessionForTopic, 'sessionStatus')
                const { topic: topicDetail, title: sessionTitle } = topicRule
                const prevTopic = coursePackageTopicRule[ind - 1]
                if (upComingOrLiveSession && get(upComingOrLiveSession, 'topicId') === get(topicDetail, 'id')) {
                    sessionStatus = get(upComingOrLiveSession, 'currentStatus')
                }
                 if (!sessionStatus || sessionStatus === 'allotted') {
                    const prevTopicRule = coursePackageTopicRule[ind - 1]
                    const prevBatchSessionForTopic = batchSessions.find(batchSession =>
                        get(batchSession, 'topicData.id') === get(prevTopicRule, 'topic.id')
                        && get(batchSession, 'courseData.id') === get(prevTopicRule, 'course.id'))
                    if ((get(prevBatchSessionForTopic, 'sessionStatus') === 'started' || this.getFirstTopicIdForCourse().includes(get(prevTopicRule, 'topic.id'))) && get(prevTopicRule,'topic.classType') === 'lab') sessionStatus = 'upComingSession'
                    else{
                        sessionStatus = 'allotted'
                    }
                }
                if (get(batchSessionForTopic, 'sessionStatus') === 'completed' && get(batchSessionForTopic, 'retakeSessions', []).length) {
                    const retakeSession = get(batchSessionForTopic, 'retakeSessions', []).find(retakeSession => get(retakeSession, 'sessionStatus') !== 'completed')
                    if (retakeSession && get(retakeSession, 'sessionStatus') === 'allotted') sessionStatus = 'upComingSession'
                }
                // We are showing the startSession option for in between topics when the started sessions are of past and of future
                if (liveBatchSessions.length && upComingOrLiveSession) {
                    const lastStartedSessionIndex = coursePackageTopicRule.findIndex(topicRule => get(topicRule, 'topic.id') === get(upComingOrLiveSession, 'topicId'))
                    if (ind < lastStartedSessionIndex && sessionStatus === 'allotted') sessionStatus = 'upComingSession'
                }
                


                if (nextUpComingTopic && sessionStatus === 'allotted') {
                    if (get(topicRule, 'topic.id') === get(nextUpComingTopic, 'topic.id')) {
                        sessionStatus = 'upComingSession'
                    } else {
                        const nextUpComingTopicIndex = coursePackageTopicRule.findIndex(topicRule => get(topicRule, 'topic.id') === get(nextUpComingTopic, 'topic.id'))
                        if (ind < nextUpComingTopicIndex) sessionStatus = 'upComingSession'
                    }
                }
                 if(this.getFirstTopicIdForCourse().includes(get(topicRule, 'topic.id')) && (!sessionStatus || sessionStatus === 'allotted')) sessionStatus = 'upComingSession'

                const sessionOrder = (topicDetail && this.state.courseTopicsByClasstype) && (this.state.courseTopicsByClasstype[get(topicDetail,'classType')] || []).findIndex(topicRule => get(topicRule,'topic.id') === get(topicDetail,'id')) + 1
                // if (this.state.forceStartSessionBtn && sessionStatus === 'allotted') sessionStatus = 'upComingSession'
                const getTopicComponentRule = get(topicRule, 'topic.topicComponentRule', []).length > 0
                if (sessionStatus === 'allotted') {
                    sessionStatus = 'upComingSession'
                }
                if(!getTopicComponentRule){
                    sessionStatus = 'allotted'
                }
                sessionCards.push(
                    <SessionCard
                        loggedInUser={loggedInUser}
                        onViewDetailsClick={this.onViewDetailsClick}
                        sessionStatus={sessionStatus}
                        sessionStatusTemp={get(batchSessionForTopic, 'sessionStatus')}
                        topicDetail={topicDetail}
                        firstTopicWithContent={this.state.firstTopicWithContent}
                        updateFirstTopicWithContent={this.updateFirstTopicWithContent}
                        updateFirstTopicTheory={this.updateFirstTopicTheory}
                        topicsByClassType={this.state.courseTopicsByClasstype}
                        sessionOrder={sessionOrder}
                        isFirstSession={ind === 0 && !selectedChapterIds.length}
                        firstTopicTheory={this.state.firstTopicTheory}
                        sessionTitle={sessionTitle}
                        prevTopicRule={prevTopic}
                        sessionDetails={{ ...batchSessionForTopic }}
                        key={get(topicDetail, 'id')}
                        topicRule= {topicRule}
                        isCreatingSession={isCreatingSessionFrom === `bottomSessionCard-${get(topicRule, 'topic.id')}`}
                        isViewModalLoading={viewModalLoading === `bottomSessionCard-${get(topicRule, 'topic.id')}`}
                        mentorChildData={this.props.mentorChildData.toJS()}
                        sessionDetail={{
                            batchSession: batchSessionForTopic,
                            topicRule: topicRule,
                            topicOrder: ind + 1,
                            sessionStatus,
                        }}
                        onSessionClick={() => this.onSessionClick({
                            batchSession: batchSessionForTopic,
                            topicRule: topicRule,
                            topicOrder: sessionOrder,
                            sessionStatus,
                            isCreatingSessionFrom: `bottomSessionCard-${get(topicRule, 'topic.id')}`,
                            viewModalLoading:  `bottomSessionCard-${get(topicRule, 'topic.id')}`,
                        })}
                    />
                )
            })
        }
        return {
            sessionCards,
            upComingCard
        }
    }
    setIsSessionDetailsModalVisible = () => {
        this.setState(prevState =>({ isSessionDetailsModalVisible: !prevState.isSessionDetailsModalVisible }))
    }
    setIsRescheduleModalVisible = () => {}
    setIsEndSessionModalVisible = () => {
        this.setState(prevState =>({ isEndSessionModalVisible: !prevState.isEndSessionModalVisible }))
    }
    setIsDeleteSessionModalVisible = () => {
        this.setState(prevState =>({ isDeleteSessionModalVisible: !prevState.isDeleteSessionModalVisible }))
    }
    isLoading = () => {
        const { batchDetailsFetchStatus, batchesFetchStatus, batchSessionsFetchStatus } = this.props
        const { selectedBatchId } = this.state
        const batchDetailsFetchingStatus = batchDetailsFetchStatus && batchDetailsFetchStatus.getIn([`batchCoursePackageDetail/${selectedBatchId}`])
        return (batchDetailsFetchingStatus && get(batchDetailsFetchingStatus.toJS(), 'loading'))
            || (batchesFetchStatus && get(batchesFetchStatus.toJS(), 'loading'))
            || (batchSessionsFetchStatus && get(batchSessionsFetchStatus.toJS(), 'loading'))
    }
    onSessionClick = async ({ batchSession, topicRule, topicOrder, sessionStatus, isCreatingSessionFrom, isEndingSession = false,viewModalLoading }) => {
        let { loggedInUser } = this.props
        console.log('batch session ', batchSession)
        loggedInUser = (loggedInUser && loggedInUser.toJS()) || null
        const loggedInUserId = get(loggedInUser, 'id')
        const classType = get(topicRule,'topic.classType') 
        const courseId = get(topicRule, 'course.id')
        const batchId = this.state.selectedBatchId
        const topicId = get(topicRule, 'topic.id')
        const topicComponentRule = get(topicRule, 'topic.topicComponentRule', [])
        const videoComponentId = isViewContentInTheory(get(topicRule,'topic',null))

        if(classType === 'theory' && videoComponentId){
            let backToPage = backToPageConst.classroom
            if (this.state.fromTeacherTrainingBatch) backToPage = backToPageConst.trainingClassrooms
            return redirectInClassroomPage({
                courseId,
                topicId,
                batchId,
                componentId: videoComponentId,
                backToPage,
             })
        }
        const { selectedBatchId, batches, coursePackageDetail, batchCurrentComponentTopic } = this.state
        const uniqueTopicId = {topicId: viewModalLoading, courseId: get(topicRule, 'course.id'), batchId: selectedBatchId,userId: loggedInUserId}
        if (this.state.isCreatingSessionFrom) return;
        if (!get(batchSession, 'id')) {
            if (sessionStatus === 'upComingSession') {
                this.setState({
                    isCreatingSessionFrom,
                })
                const _momentObj = moment()
                const currentHour = _momentObj.get('hours')
                const bookingDate = _momentObj.startOf('day').toISOString()
                // const mentorSessionRes = await fetchMentorSession(null, loggedInUserId, 1)
                const mentorSessionRes = []
                const mentorSessionInput = {
                    sessionType: 'batch',
                };
                const batchSessionInput = {
                    bookingDate,
                    sessionMode: 'offline',
                    sessionStatus: 'allotted',
                    allottedTeacherId: get(loggedInUser, 'id')
                };
                const courseConnectId = get(topicRule, 'course.id')
                const topicConnectId = get(topicRule, 'topic.id')
                const coursePackageConnectId = get(coursePackageDetail, 'id')
                // batchSessionInput[`slot${currentHour}`] = true;
                if (mentorSessionRes && get(mentorSessionRes, 'mentorSessions', []).length) {
                    const mentorSessionConnectId = get(mentorSessionRes, 'mentorSessions[0].id')
                    const openedSlotsArray = getSelectedSlotsStringArray(get(mentorSessionRes, 'mentorSessions[0]'))
                    const addedBatchSession = await addBatchSession({
                        batchConnectId: selectedBatchId,
                        topicConnectId,
                        courseConnectId,
                        mentorSessionConnectId,
                        coursePackageConnectId,
                        input: batchSessionInput,
                        loggedInUser
                    })
                    this.updateSessionLocally('addNewSession', '', get(addedBatchSession, 'addBatchSession', {}),viewModalLoading)
                    // if (openedSlotsArray.includes(`slot${currentHour}`)) {
                    // } else {
                    //     mentorSessionInput[`slot${currentHour}`] = true;
                    //     await updateMentorSession(mentorSessionConnectId, courseConnectId, mentorSessionInput);
                    //     const addedBatchSession = await addBatchSession({
                    //         batchConnectId: selectedBatchId,
                    //         topicConnectId,
                    //         courseConnectId,
                    //         mentorSessionConnectId,
                    //         coursePackageConnectId,
                    //         input: batchSessionInput
                    //     })
                    //     this.updateSessionLocally('addNewSession', '', get(addedBatchSession, 'addBatchSession', {}), viewModalLoading)
                    // }
                } else {
                    // mentorSessionInput[`slot${currentHour}`] = true;
                    // const addedMentorSession = await addMentorSession(loggedInUserId, courseConnectId, mentorSessionInput)
                    // const mentorSessionConnectId = get(addedMentorSession, 'addMentorSession.id')
                    const addedBatchSession = await addBatchSession({
                        batchConnectId: selectedBatchId,
                        topicConnectId,
                        courseConnectId,
                        // mentorSessionConnectId,
                        coursePackageConnectId,
                        input: batchSessionInput,
                        loggedInUser
                    })
                    this.updateSessionLocally('addNewSession', '', get(addedBatchSession, 'batchSession', {}),viewModalLoading)
                }
            } else {
                let batchDetail = batches.find(batch => get(batch, 'groupId') === selectedBatchId)
                const batchCurrentComponentTopicOrder = this.getTopicOrder(batchCurrentComponentTopic)
                batchDetail = {
                    ...batchDetail,
                    currentComponentTopicOrder: batchCurrentComponentTopicOrder
                }
                const sessionDetails = getSessionDetailsForModal(batchSession, batchDetail, topicRule, topicOrder, sessionStatus, isEndingSession)
                if (classType === 'theory'){
                    const newOrder = topicOrder < 10 ? `0${topicOrder}` : topicOrder
                    const title = <span>Classroom {newOrder}: <strong>{get(topicRule,'topic.title')}</strong></span>
                    this.setState({
                        isViewDetailsModalVisible: true,
                        sessionName: title,
                        viewCurrentSession: get(sessionDetails, 'id'),
                        viewModalFooter: sessionStatus !== 'completed',
                        viewModalWidth: get(topicRule,'topic.referenceContentWidth'),
                        viewModalId: uniqueTopicId,       
                        viewModalLoading:  (get(topicRule,'topic.referenceContent') && isBase64(get(topicRule,'topic.referenceContent'))) && `${viewModalLoading}`,
                        courseRefContent: get(topicRule,'topic.referenceContent'),     
                        viewModalStatus: sessionStatus,          

                        })
                    }
                    else {
                        this.isSessionDetailsModalOpenedRef.current = true
                        this.setState({
                            sessionDetails,
                            isSessionDetailsModalVisible: true,
                        })
                    }
                }
        } else {
            let batchDetail = batches.find(batch => get(batch, 'groupId').toString() === selectedBatchId)
            // const batchCurrentComponentTopicOrder = this.getTopicOrder(batchCurrentComponentTopic)
            batchDetail = {
                ...batchDetail,
                // currentComponentTopicOrder: batchCurrentComponentTopicOrder
            }
            const sessionDetails = getSessionDetailsForModal(batchSession, batchDetail, topicRule, topicOrder, sessionStatus, isEndingSession)
            // showing different Modal on the basis of ClassType
            if (classType === 'theory'){
                const newOrder =topicOrder < 10 ? `0${topicOrder}` : topicOrder
                const title = <span>Classroom {newOrder}: <strong style={{fontWeight: 600}}>{get(topicRule,'topic.title')}</strong></span>
                this.setState({isViewDetailsModalVisible: true,
                    sessionName: title,
                    viewCurrentSession: get(sessionDetails, 'id'),
                    viewModalFooter: sessionStatus !== 'completed',
                    viewModalWidth: get(topicRule,'topic.referenceContentWidth'),
                    viewModalId: uniqueTopicId,
                    viewModalLoading:  (get(topicRule,'topic.referenceContent') || !isBase64(get(topicRule,'topic.referenceContent'))) && `${viewModalLoading}`,
                    courseRefContent: get(topicRule,'topic.referenceContent'),  
                    viewModalStatus: sessionStatus,          
                })
            }
            else {
                this.isSessionDetailsModalOpenedRef.current = true
                this.setState({
                    sessionDetails,
                    isSessionDetailsModalVisible: true,
                })
            }
        }
    }
    
    onViewDetailsModalSubmit = async () => {
        this.setState({isCompletedLoading: true})
        await endBatchSession(this.state.viewCurrentSession, '', true).then(res => {
            // update locally 
        this.updateSessionLocally('updateSessionStatus', get(res, 'updateBatchSession.id'), {
                ...get(res, 'updateBatchSession', {})
            })
        })

        this.setState({isCompletedLoading: false,isViewDetailsModalVisible: false})
        

    }
    updateSessionLocally = (updateType = '', batchSessionId, dataObj = {}, viewModalLoading) => {
        if (!updateType) return
        const { batchSessions } = this.state
        const newBatchSessions = [...batchSessions]
        const batchSessionIndex = newBatchSessions.findIndex(batchSession => get(batchSession, 'id') === batchSessionId)
        let batchSessionObj = {}
        if (batchSessionIndex !== -1) batchSessionObj = { ...newBatchSessions[batchSessionIndex] }
        switch (updateType) {
            case 'updateSessionStatus':
                if (batchSessionIndex !== -1) {
                    newBatchSessions[batchSessionIndex] = {
                        ...batchSessionObj, ...dataObj
                    }
                    this.setState({ batchSessions: newBatchSessions })
                }
                break;
            case 'updateAttendance':
                if (batchSessionIndex !== -1) {
                    newBatchSessions[batchSessionIndex] = {
                        ...batchSessionObj, ...dataObj
                    }
                    this.setState({ batchSessions: newBatchSessions })
                }
                break;
            case 'addNewSession':
                if (get(dataObj, 'id')) {
                    this.setState({
                        batchSessions: [...newBatchSessions, dataObj],
                        isCreatingSessionFrom: ''
                    }, () => {
                        const { batchSessions } = this.getFilteredBatchSessionAndTopicRule()
                        const sessionToStart = batchSessions.find(batchSession => get(batchSession, 'id') === get(dataObj, 'id'))
                        this.onSessionClick({
                            batchSession: sessionToStart,
                            topicRule: get(sessionToStart, 'topic'),
                            topicOrder: get(sessionToStart, 'topicOrder'),
                            sessionStatus: 'upComingSession',
                            viewModalLoading: viewModalLoading,
                        })
                    })
                }
                break;
            case 'updateSessionOtp':
                if (batchSessionIndex !== -1) {
                    const newRetakeSessions = this.getUpdatedRetakeSessions(batchSessionObj, 'retakeSession', '', get(dataObj, 'retakeSession'))
                    newBatchSessions[batchSessionIndex] = {
                        ...batchSessionObj,
                        retakeSessions: newRetakeSessions
                    }
                    this.setState({ batchSessions: newBatchSessions })
                }
                break;
            default:
                break;
        }
    }
    checkIfBatchSessionExist = (topicId) => {
        const { batchSessions } = this.state
        const batchSession = batchSessions.find(batchSession => get(batchSession, 'topicData.id') === topicId)
        return batchSession ? true : false
    }
    getPrevTopicDetails = () => {
        const { sessionDetails,courseTopicsByClasstype } = this.state
        let topicRuleIndex;
        if(courseTopicsByClasstype && get(courseTopicsByClasstype,'lab', []).length){
        topicRuleIndex =  get(courseTopicsByClasstype,'lab', []).findIndex(topicRule => 
                get(topicRule,'topic.id') === get(sessionDetails, 'extendedProps.topic.id'))
        }
        if (topicRuleIndex > 0) {
            const prevTopicRule = get(courseTopicsByClasstype, `lab[${topicRuleIndex - 1}]`, null)
            if (prevTopicRule) {
                const { course, topic } = prevTopicRule
                return {
                    courseId: get(course, 'id'),
                    topicId: get(topic, 'id'),
                    topicComponentRule: get(topic, 'topicComponentRule', []),
                    batchSessionExist: this.checkIfBatchSessionExist(get(topic, 'id')),
                    topicOrder: topicRuleIndex
                }
            }
        }
        return {}
    }
    onBackToTopClick = () => {
        const screenWrapper = document.querySelector(".splitScreen-main-component")
        screenWrapper.scrollTo({ top: 0, behavior: "smooth" });
    }
    render() {
        const { loggedInUser, updateBatchSessionQueryStatus, updateAdhocSessionQueryStatus,
            fetchLiveAttendance, fetchLiveAttendanceStatus } = this.props
        const { selectedBatchId, batches, isSessionDetailsModalVisible,
            sessionDetails, isEndSessionModalVisible,
            isDeleteSessionModalVisible, isBackToTopVisible, fromTeacherTrainingBatch } = this.state
        const { endCurrentSession } = qs.parse(window.location.search)
        const { coursePackageTopicRule, completedBatchSessions, liveBatchSessions } = this.getFilteredBatchSessionAndTopicRule()
        const classProgressPercent = (completedBatchSessions.length / coursePackageTopicRule.length) * 100
        if (this.isLoading()) {
          return (
            <div className={styles.classroomCourseListingLoaderBackdrop}>
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
        return (
            <div className={styles.classroomCourseListingContainer}>
                <div
                    style={{
                        display: 'block',
                        width: '10px',
                        height: '10px',
                        position: 'fixed',
                        cursor: 'pointer',
                        top: 0,
                        right: 0,
                    }}
                    onClick={() => {
                        const forceStartSessionBtnCount = this.state.forceStartSessionBtnCount;
                        this.setState({ forceStartSessionBtnCount: forceStartSessionBtnCount + 1 })
                        if ((forceStartSessionBtnCount%10) === 0) {
                            this.setState({ forceStartSessionBtn: !this.state.forceStartSessionBtn })
                        }
                    }}
                />
                {selectedBatchId && (
                    <PreserveState
                        state={this.state}
                        setState={(state, callback = () => { }) => {
                            this.setState({},
                            callback)
                        }}
                        persistIf={id => {
                            return id === this.props.match.url
                        }}
                        saveIf={this.state.selectedBatchId}
                        id={this.props.match.url}
                        preserveScroll={['splitScreen-main-container']}
                    />
                )}
                <span className='individual-classrooms-page-mixpanel-identifier' />
                <ClassroomDetailsHeader
                    loggedInUser={loggedInUser && loggedInUser.toJS()}
                    fetchedClassrooms={batches}
                    batchId={selectedBatchId}
                    fromClassroomCoursePage
                    fromTeacherTrainingBatch={fromTeacherTrainingBatch}
                />
                {this.renderClassroomSessions().upComingCard}
                {this.renderClassroomDetail()}
                <div className={styles.classroomCourseLists}>
                    {this.renderClassroomSessions().sessionCards.length
                        ? this.renderClassroomSessions().sessionCards
                        : <h2 className={styles.classroomCourseNoSession}>No Session Available</h2>}
                </div> 
                 {isSessionDetailsModalVisible &&
                    <SessionModal
                        loggedInUser={loggedInUser}
                        sessionDetails={sessionDetails}
                        setIsRescheduleModalVisible={this.setIsRescheduleModalVisible}
                        isEndSessionModalVisible={isEndSessionModalVisible}
                        setIsEndSessionModalVisible={this.setIsEndSessionModalVisible}
                        isDeleteSessionModalVisible={isDeleteSessionModalVisible}
                        setIsDeleteSessionModalVisible={this.setIsDeleteSessionModalVisible}
                        updateBatchSessionQueryStatus={updateBatchSessionQueryStatus && updateBatchSessionQueryStatus.toJS()}
                        updateAdhocSessionQueryStatus={updateAdhocSessionQueryStatus && updateAdhocSessionQueryStatus.toJS()}
                        isUpcomingSession={null}
                        setClassEvents={() => {}}
                        isFromSessionEmbed={endCurrentSession}
                        liveAttendanceData={fetchLiveAttendance}
                        fetchLiveAttendanceStatus={fetchLiveAttendanceStatus && fetchLiveAttendanceStatus.toJS()}
                        setIsSessionDetailsModalVisible={this.setIsSessionDetailsModalVisible} 
                        updateSessionLocally={this.updateSessionLocally}
                        isSessionDetailsModalOpenedRef={this.isSessionDetailsModalOpenedRef}
                        fromClassroomCoursePage
                        previousTopicDetails={this.getPrevTopicDetails()}
                        classProgressPercent={classProgressPercent}
                        evaluationData={this.props.evaluationData && this.props.evaluationData.toJS()}
                        evaluationDataFetchStatus={this.props.evaluationDataFetchStatus && this.props.evaluationDataFetchStatus.toJS()}
                        liveBatchSessions={liveBatchSessions}
                        coursePackageTopicRule={coursePackageTopicRule}
                        fetchBatchSessionOtpData={this.props.fetchBatchSessionOtpData && this.props.fetchBatchSessionOtpData.toJS()}
                        fetchBatchSessionOtpStatus={this.props.fetchBatchSessionOtpStatus && this.props.fetchBatchSessionOtpStatus.toJS()}
                        fromTeacherTrainingBatch={fromTeacherTrainingBatch}
                    />}
                    
                <div className={cx(styles.backToTop, isBackToTopVisible && styles.visibleButton)}>
                <Button text={<ChevronLeft />} type='secondary' textClass='addIcon' onBtnClick={this.onBackToTopClick} />
                </div>
                
                { get(this.props.mentorChildData.toJS(),'mentor') && 
                    (
                        <>
                             <Tooltip
                                anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "left",
                                }}
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "left",
                                }}
                                tooltipClassName={styles.theoryTooltipContainer}
                                fullCenter
                                open={
                                    this.state.theoryTooltipShow && (getTooltipCount(get(this.props.mentorChildData.toJS(),'mentor'), 'sessionTab') > 0)
                                }
                                anchorEl={this.sessionTabref.current}
                                type='secondary'
                                handleMouseEnter={() => {
                                //   handleMouseOver()
                                }}
                                handleMouseLeave={() => {
                                //   handleMouseOut()
                                }}
                                fromClassroonListing={true}
                                orientation='bottom'
                            >
                                    {renderTooltipContent("Switch between lab & theory Sessions",true,"Switch between lab & theory Sessions", get(this.props.mentorChildData.toJS() ,'mentor'), 'theory',() => {this.setState({theoryTooltipShow: false})})}
                            </Tooltip>

                        </>
                    )   
                }

               
            </div>
        )
    }
}

export default ClassroomCourseListing;
