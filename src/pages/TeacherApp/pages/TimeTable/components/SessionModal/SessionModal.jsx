import { get } from 'lodash'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import Button from '../../../../components/Button/Button'
import { CalenderSvg } from '../../../../components/svg'
import Heading from './components/Heading'
import MoreDetails from './components/MoreDetails'
import styles from './SessionModal.module.scss'
import fetchPreviousClassromDetails from './queries/fetchPreviousClassromDetails';
import { Book, CloseCircle, LockClosedOutline, MarkAsComplete, PlayCircle, PlayOutlineIcon, RetakeClassIcon, RevisitClassContent, StartClassIcon, StartEvaluationIcon, StartSessionIcon} from '../../../../../../constants/icons'
import { filterKey } from '../../../../../../utils/data-utils'
import { List } from 'immutable'
import DeleteSessionModal from '../DeleteSessionModal/DeleteSessionModal'
import deleteBatchSession from '../../../../../../queries/teacherApp/deleteBatchSession'
import deleteAdhocSession from '../../../../../../queries/teacherApp/deleteAdhocSession'
import getClassroomSessions from '../../../../../../queries/teacherApp/getClassroomSessions'
import { getToasterBasedOnType } from '../../../../../../components/Toaster'
import startBatchSession from '../../../../../../queries/teacherApp/startBatchSession'
import startAdhocSession from '../../../../../../queries/teacherApp/startAdhocSession'
import getSessionComponentMeta from '../../../../../../queries/teacherApp/getSessionComponentMeta'
import endBatchSession from '../../../../../../queries/teacherApp/endBatchSession'
import endAdhocSession from '../../../../../../queries/teacherApp/endAdhocSession'
import { getFilteredLoComponentRule, getLORedirectKey } from '../../../../../UpdatedSessions/utils'
import EndSessionModal from '../EndSessionModal/EndSessionModal'
import getStudentAppRoute from '../../../../../../utils/teacherApp/getRoute'
import fetchLiveAttendance from '../../../../../../queries/teacherApp/fetchLiveAttendance'
import { connect } from 'react-redux'
import useClickOutside from '../../../../../../utils/teacherApp/useClickOutside'
import EmptyState from './components/EmptyState'
import hs from '../../../../../../utils/scale'
import { generateOtpForUnAttendedSession, generateRetakeClass, isSomeSessionInProgress } from '../../utils'
import { evaluationTypes, getCourseLanguage, PUBLISHED_STATUS, UNPUBLISHED_STATUS } from '../../../../utils'
import { EvaluationContextProvider } from '../../../Classroom/components/EvaluationModal/contexts/EvaluationContext'
import EvaluationModal from '../../../Classroom/components/EvaluationModal/EvaluationModal'
import fetchEvaluationData from '../../../../../../queries/teacherApp/fetchEvaluationData'
import { getsortedEvaluationData } from '../../../Classroom/ClassroomDetails/ClassroomDetails.helpers'
import fetchBatchSessionOtp from '../../../../../../queries/teacherApp/fetchBatchSessionOtp'
import requestToGraphql from '../../../../../../utils/requestToGraphql'
import gql from 'graphql-tag'
import { backToPageConst } from '../../../../constants'
import addSessionComponentTracker from './queries/addSessionComponentTracker'
import markSessionAsIncomplete from '../../../../../../queries/teacherApp/markSessionAsIncomplete'
import ViewDetailsModal from '../../../ClassroomCourseListing/components/ViewDetailsModal'
import store from '../../../../../../store'
import getMe from '../../../../../../utils/getMe'
import { fireGtmEvent } from '../../../../../../utils/analytics/gtmActions'
import { gtmEvents } from '../../../../../../utils/analytics/gtmEvents'
import { getUserParams } from '../../../../../../utils/getUserParams'
import addSubSession from '../../../../../../queries/subSessions/addSubSession'


const sessionStatusMap = {
    completed: 'completed',
    allotted: 'yetToBegin',
    started: 'inProgress',
    unattended: 'unAttended',
    liveSession: 'inProgress',
    upComingSession: 'yetToBegin'
}

const FORCE_COUNT = 5;


let user = filterKey(window && window.store.getState().data.getIn(['user', 'data']), 'loggedinUser') || List([])
user = user.toJS()[0]
const showDeleteBtn = get(user, 'mentorProfile.scheduleManagement.isDeleteSessions')

const SessionModal = (props) => {
    const { setIsSessionDetailsModalVisible, sessionDetails, setIsRescheduleModalVisible, isDeleteSessionModalVisible = false, setIsDeleteSessionModalVisible, filterClassroomSessionQuery, loggedInUser, updateBatchSessionQueryStatus, updateAdhocSessionQueryStatus, isUpcomingSession, isEndSessionModalVisible, setIsEndSessionModalVisible, setClassEvents, isFromSessionEmbed, liveAttendanceData, fetchLiveAttendanceStatus, isSessionDetailsModalOpenedRef, updateSessionLocally, previousTopicDetails, classEvents, fromClassroomCoursePage = false, liveBatchSessions,
        coursePackageTopicRule, fetchBatchSessionOtpStatus, fetchBatchSessionOtpData, fromTeacherTrainingBatch } = props
    const { id, start, end, isBatchSessionPresent, isStartingSession = false, isRetakeSession = false, extendedProps: { title, topic, course, order, grades, sections, bookingDate, sessionMode, sessionStatus, sessionRecordingLink, thumbnail, documentType, classroom, sessionStartTime, sessionEndTime, startMinutes, endMinutes, totalStudents, attendance, previousTopic, sessionType, classType, topicComponentRule,sessionStartedByMentorAt, retakeSessions = [], classroomTitle, referenceContent, contentStatus } } = sessionDetails
    const [prevTopicTitle, setPrevTopicTitle] = React.useState('-')
    const [forceRescheduleButton, setForceRescheduleButton] = React.useState(0);
    const [homeworkSubmissions, setHomeworkSubmissions] = useState({ hwSubmissions: '-', quizSubmissions: '-', completedPQMeta: '-', isPQComponentExists: false, isHomeworkExists: false, isQuizExists: false })
    const [prevTopicDataArr, setPrevTopicData] = useState({})
    const [presentStudents, setPresentStudents] = useState([])
    const [totalStudentsInClass, setTotalStudentsInClass] = useState([])
    const [sessionStatusInState, setSessionStatusInState] = useState(sessionStatus)
    const [isStartingSessionInState, setIsStartingSessionInState] = useState(isStartingSession)
    const [retakeSessionsRecord, setRetakeSessionsRecord] = useState([])
    const [evaluationModalDetails,setEvaluationModalDetails]=useState({ isOpen: false, evaluationType:evaluationTypes.PRACTICE })
    const [evaluationData, setEvalautionData] = useState({})
    const [isFetchingEvaluationData, setIsFetchingEvaluationData] = useState(null)
    const [isStartEvaluationButtonClicked, setIsStartEvaluationButtonClicked] = useState(false)
    const [completedUserAssignmentData, setCompletedUserAssignmentData] = useState([])
    const [isGeneratingOtp, setIsGeneratingOtp] = useState(false)
    const [isCreatingRetakeClass, setIsCreatingRetakeClass] = useState(false)
    const [isRetakeClassButtonClicked, setIsRetakeClassButtonClicked] = useState(false)
    const [markingSessionAsInComplete, setMarkingSessionAsInComplete] = useState(false)
    const [showTeacherManualModal, setShowTeacherManualModal] = useState(false)
    const [isAddingSubSession, setIsAddingSubSession] = useState(false)

    const roles = get(loggedInUser && loggedInUser.toJS(), 'roles', [])
    const rawDataRoles = get(loggedInUser && loggedInUser.toJS(), 'rawData.roles', [])
    const isCmsAdmin = roles.includes('cmsAdmin') || rawDataRoles.includes('cmsAdmin')

    useEffect(() => {
        if (attendance && attendance.length && sessionStatusInState === 'allotted') {
            const presentStudentsList = [];
            for (let index = 0; index < attendance.length; index++) {
                const element = attendance[index];
                if (get(element, "isPresent", "") === true) {
                    presentStudentsList.push(element);
                }
            }
            if (presentStudentsList.length) setPresentStudents(presentStudentsList)
        }
    }, [sessionStatusInState])
    useEffect(() => {
        if (!sessionStatusInState) {
            setSessionStatusInState(sessionStatus)
            if (sessionStatus === 'completed') setIsStartingSessionInState(true)
            else setIsStartingSessionInState(isStartingSession)
        }
        if (retakeSessions && retakeSessions.length) {
            setRetakeSessionsRecord(retakeSessions)
        }
    }, [id])
    const firstMount = useRef(true)
    const attendanceIntervalRef = useRef()
    const domRef=useClickOutside(()=>{setIsSessionDetailsModalVisible(false);isSessionDetailsModalOpenedRef.current=false})
    const hasDeletedSession = window && window.store.getState().data.getIn(['deleteClassroomSession', 'deleteStatus', 'deleteClassroomSession', 'success'])
    const hasDeleteSessionFailed = window && window.store.getState().data.getIn(['deleteClassroomSession', 'deleteStatus', 'deleteClassroomSession', 'failure'])
    const isDeletingSession = window && window.store.getState().data.getIn(['deleteClassroomSession', 'deleteStatus', 'deleteClassroomSession', 'loading'])
    const previousSessionTopicData = window && window.store.getState().data.getIn(['previousSessionTopicData', 'data'])
    const previousSessionTopicDataLoading = props.previousSessionTopicDataLoading && get(props, 'previousSessionTopicDataLoading')
    const currentClassroomMetaLoading = props.currentClassroomMetaLoading && get(props,'currentClassroomMetaLoading')
    const classroomNextSessionsLoading=props.classroomNextSessionsLoading && get(props,'classroomNextSessionsLoading')
    const classroomPreviousSessionsLoading = window && window.store.getState().data.getIn(['classroomPreviousSessions', 'fetchStatus', 'classroomPreviousSessions', 'loading'])
    const liveAttendance = liveAttendanceData && liveAttendanceData.toJS();


    const isUpdateBatchSessionStatusLoading = get(updateBatchSessionQueryStatus, 'loading')
    const isUpdateBatchSessionStatusSuccess = get(updateBatchSessionQueryStatus, 'success')
    const isUpdateBatchSessionStatusFailure = get(updateBatchSessionQueryStatus, 'failure')
    const isUpdateAdhocSessionStatusLoading = get(updateAdhocSessionQueryStatus, 'loading')
    const isUpdateAdhocSessionStatusSuccess = get(updateAdhocSessionQueryStatus, 'success')
    const isUpdateAdhocSessionStatusFailure = get(updateAdhocSessionQueryStatus, 'failure')
    const fetchLiveAttendanceStatusSuccess = get(fetchLiveAttendanceStatus, 'success')
    const fetchLiveAttendanceStatusLoading = get(fetchLiveAttendanceStatus, 'loading')
    const fetchLiveAttendanceStatusFailure = get(fetchLiveAttendanceStatus, 'failure')
    const fetchBatchSessionOtpStatusSuccess = get(fetchBatchSessionOtpStatus, 'success')
    const fetchBatchSessionOtpStatusLoading = get(fetchBatchSessionOtpStatus, 'loading')
    const fetchBatchSessionOtpStatusFailure = get(fetchBatchSessionOtpStatus, 'failure')

    const isCurrentTimeBetweenSessionStartAndEndTime = (fromClassroomCoursePage && isStartingSessionInState && sessionStatusInState !== 'completed') ?
        true : ((start && end) && ((start.getTime() - 600000) <= new Date().getTime()) && (end.getTime() >= new Date().getTime()))
    const isClassTypeTheory=classType==='theory'

    useEffect(() => {
        if (sessionStatus === 'completed' && retakeSessions.length) {
            const retakeSession = retakeSessions.find(retakeSession => get(retakeSession, 'sessionStatus') !== 'completed')
            if (retakeSession && get(retakeSession, 'sessionStatus') === 'allotted') {
                setSessionStatusInState('allotted')
            }
        }
    }, [])

    useEffect(() => {
        const otpModalShown = localStorage.getItem("otpModalShown") || false;
        if ([true, 'true', 'True'].includes(otpModalShown)) {
            localStorage.setItem("otpModalShown", "false");
        }
    }, [])

    useEffect(() => {
        // if ((sessionStatusInState === 'allotted' && id !== isUpcomingSession) || sessionStatusInState === 'unattended') {
        //     fetchPreviousClassromDetails(get(classroom, 'id'), bookingDate)
        //         .then((res) => {
        //             const classroomDetails = get(
        //                 res,
        //                 "getNextOrPrevClassroomSessions[0]"
        //             );
        //             if (classroomDetails) {
        //                 setHomeworkSubmissions((prev) => ({
        //                     ...prev,
        //                     hwSubmissions: get(
        //                         classroomDetails,
        //                         "sessions[0].completedHomeworkMeta"
        //                     ),
        //                     quizSubmissions: get(
        //                         classroomDetails,
        //                         "sessions[0].completedQuizMeta"
        //                     ),
        //                     isHomeworkExists: get(classroomDetails,
        //                         "sessions[0].isHomeworkExists"),
        //                     isQuizExists: get(classroomDetails,
        //                         "sessions[0].isQuizExists")
        //                 }));
        //                 setPrevTopicTitle(
        //                     `${get(classroomDetails, "sessions[0].topicTitle")}`
        //                 );
        //             }
        //         })
        //         .catch((error) => console.log(error));
        // }
        // if ((sessionStatusInState === 'allotted' && id === isUpcomingSession) || sessionStatusInState === 'started' || sessionStatusInState === 'completed') {
        //     getSessionComponentMeta(id).then(res => {
        //         setCompletedUserAssignmentData(get(res, 'getSessionComponentMeta.completedAssignmentDetailsByUser'))
        //         const { completedHomeworkMeta, completedQuizMeta, completedPracticeMeta, completedAssignmentMeta, } = getHomeworkSubmissionMeta(get(res, 'getSessionComponentMeta.completedAssignmentDetailsByUser', []))
        //         if (get(res, 'getSessionComponentMeta')) {
        //             setHomeworkSubmissions((prev) => ({ ...prev, hwSubmissions: completedHomeworkMeta, quizSubmissions: completedQuizMeta, completedPQMeta: completedPracticeMeta, isPQComponentExists: get(res, 'getSessionComponentMeta.isPQComponentExists') }))
        //         }
        //     }).catch(error => console.log(error))
        // }

    }, [])

    const getHomeworkSubmissionMeta = (completedAssignmentDetailsByUser) => {
        let completedHomeworkMeta = 0
        let completedQuizMeta = 0
        let completedPracticeMeta = 0
        let completedAssignmentMeta = 0
        completedAssignmentDetailsByUser && completedAssignmentDetailsByUser.forEach(item => {
            if (get(item, 'isHomeworkSubmitted')) {
                completedHomeworkMeta += 1
            }
            if (get(item, 'isQuizSubmitted')) {
                completedQuizMeta += 1
            }
            if (get(item, 'isAssignmentSubmitted')) {
                completedPracticeMeta += 1
            }
            if (get(item, 'isPracticeSubmitted')) {
                completedAssignmentMeta += 1
            }
        })
        return {
            completedHomeworkMeta,
            completedQuizMeta,
            completedPracticeMeta,
            completedAssignmentMeta,
        }
    }

    const getGradesAndSections = (grades = [], sections = []) => {
        const gradesSections = grades.map((grade, idx) => {
            if (grades.length === 1) {
                return `${grade}${sections[idx]}`
            }
            if (idx === grades.length - 1) {
                return `${grade}${sections[idx]}`
            }
            return `${grade}${sections[idx]}`
        })
        const removeGradeText = gradesSections.map(element => element.split('Grade')[1])
        return removeGradeText
    }
    const getCurrentLiveStudent = () => {
        const presentStudentsList = [];
        const attendanceStudentArray = get(liveAttendance[0], "attendance", []);
        for (let index = 0; index < attendanceStudentArray.length; index++) {
            const element = attendanceStudentArray[index];
            if (get(element, "isPresent", "") === true) {
                presentStudentsList.push(element);
            }
        }
        setTotalStudentsInClass(attendanceStudentArray.length)
        setPresentStudents(presentStudentsList);
        if (fromClassroomCoursePage && presentStudentsList.length) {
            updateSessionLocally('updateAttendance', id, { attendance: attendanceStudentArray })
        }
    }

    const getTime = (dateObj) => {
        return moment(dateObj).format('LT').toLowerCase()
    }

    const deleteScheduledSession = async (sessionId) => {
        if (documentType === 'batchSession') {
            await deleteBatchSession(sessionId)
        }
        if (documentType === 'adhocSession') {
            await deleteAdhocSession(sessionId)
        }
    }
    const getRedirectionLink = (prevTopicData, isRevisit = false, isViewingContent = false, openInNewTab = false, homework = false) => {
        let redirectURL
        let topicCompRule;
        let backToPage = backToPageConst.timeTable
        if (fromClassroomCoursePage) backToPage = backToPageConst.classroom
        if (fromTeacherTrainingBatch) backToPage = backToPageConst.trainingClassrooms
        let prevTopicId = get(prevTopicData, '[0].id')
        if (!prevTopicId) prevTopicId = get(previousTopicDetails,'topicId')
        const prevTopicOrder = get(previousTopicDetails, 'topicOrder')
        const codingLanguage = getCourseLanguage(course)
        if(get(previousTopicDetails,'topicComponentRule',[]).length){
            topicCompRule=get(previousTopicDetails,'topicComponentRule')
        }
        if (topicCompRule && !isRevisit && !homework) {
            const isHomeworkPresentInPreviousTopic = topicCompRule.find(rule => get(rule, 'componentName') === 'quiz' || get(rule, 'componentName') === 'homeworkAssignment' || get(rule, 'componentName') === 'homeworkPractice')
            if (isHomeworkPresentInPreviousTopic && get(previousTopicDetails, 'batchSessionExist')) {
                redirectURL = getStudentAppRoute({
                    route: 'session-embed',
                    courseId: get(course, 'id'), topicId: get(topic, 'id'), batchId: get(classroom, 'id'), prevTopicId,
                    sessionId: id, documentType: documentType,
                    componentName: 'homework',
                    backToPage,
                    codingLanguage,
                    prevTopicOrder,
                    title,
                    classroomTitle,
                    grade: grades[0],
                    section: sections[0],
                    referenceContent
                })
                if (redirectURL) {
                    window.open(redirectURL, "_self");
                    return;
                }
            }
        }
        if (redirectURL) {
            if (openInNewTab) {
                window.open(redirectURL, '_self', 'noreferrer');
            } else {
                window.open(redirectURL, "_self");
            }
            return
        }
        const sortedTopicComponentRule = [...(topicComponentRule || [])].sort((a, b) => get(a, 'order') - get(b, 'order'))

        const filteredSortedTopicComponentRule=sortedTopicComponentRule.filter(rule=>rule.componentName==='quiz'||rule.componentName==='homeworkAssignment'||rule.componentName==='homeworkPractice')
        
        const firstHomeworkComponent=filteredSortedTopicComponentRule[0]
        
        const firstComponent = sortedTopicComponentRule[0]

        if(homework && ((firstHomeworkComponent && firstHomeworkComponent.componentName === 'quiz') || (firstHomeworkComponent && firstHomeworkComponent.componentName === 'homeworkAssignment'))){
             redirectURL = getStudentAppRoute({ route: 'session-embed', courseId: get(course, 'id'), topicId: get(topic, 'id'), batchId: get(classroom, 'id'), prevTopicId, componentName: get(firstHomeworkComponent, 'componentName'), sessionId: id, documentType: documentType, isRevisit, codingLanguage, backToPage, prevTopicOrder,title,classroomTitle,grade: grades[0],section: sections[0], referenceContent })

        } else if (homework && firstHomeworkComponent && firstHomeworkComponent.componentName === 'homeworkPractice'){
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId: get(course, 'id'), topicId: get(topic, 'id'), batchId: get(classroom, 'id'), prevTopicId, componentId: get(firstHomeworkComponent, 'blockBasedProject.id'), componentName: get(firstHomeworkComponent, 'componentName'), sessionId: id, documentType: documentType, isRevisit, codingLanguage, backToPage, prevTopicOrder,title,classroomTitle,grade: grades[0],section: sections[0], referenceContent })

        } else if (firstComponent && firstComponent.componentName === 'blockBasedProject') {
            if (isViewingContent) {
                window.open(getStudentAppRoute({ route: 'session-embed', courseId: get(course, 'id'), topicId: get(topic, 'id'), batchId: get(classroom, 'id'), prevTopicId, componentId: get(firstComponent, 'blockBasedProject.id'), componentName: get(firstComponent, 'componentName'), sessionId: id, documentType: documentType, isRevisit,sessionStatus: sessionStatusInState, codingLanguage, backToPage, prevTopicOrder,title,classroomTitle,grade: grades[0],section: sections[0], referenceContent }), '_self')

                return
            }
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId: get(course, 'id'), topicId: get(topic, 'id'), batchId: get(classroom, 'id'), prevTopicId, componentId: get(firstComponent, 'blockBasedProject.id'), componentName: get(firstComponent, 'componentName'), sessionId: id, documentType: documentType, isRevisit, codingLanguage, backToPage, prevTopicOrder,title,classroomTitle,grade: grades[0],section: sections[0], referenceContent })
        } else if (firstComponent && firstComponent.componentName === 'video') {
            if (isViewingContent) {
                window.open(getStudentAppRoute({ route: 'session-embed', courseId: get(course, 'id'), topicId: get(topic, 'id'), batchId: get(classroom, 'id'), prevTopicId, componentId: get(firstComponent, 'video.id'), componentName: get(firstComponent, 'componentName'), sessionId: id, documentType: documentType, isRevisit,sessionStatus: sessionStatusInState, codingLanguage, backToPage, prevTopicOrder,title,classroomTitle,grade: grades[0],section: sections[0], referenceContent }), '_self')
                return
            }
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId: get(course, 'id'), topicId: get(topic, 'id'), batchId: get(classroom, 'id'), prevTopicId, componentId: get(firstComponent, 'video.id'), componentName: get(firstComponent, 'componentName'), sessionId: id, documentType: documentType, isRevisit, codingLanguage, backToPage, prevTopicOrder,title,classroomTitle,grade: grades[0],section: sections[0], referenceContent })


        } else if (firstComponent && firstComponent.componentName === 'blockBasedPractice') {
            if (isViewingContent) {
                window.open(getStudentAppRoute({ route: 'session-embed', courseId: get(course, 'id'), topicId: get(topic, 'id'), batchId: get(classroom, 'id'), prevTopicId, componentId: get(firstComponent, 'blockBasedProject.id'), componentName: get(firstComponent, 'componentName'), sessionId: id, documentType: documentType, isRevisit,sessionStatus: sessionStatusInState, codingLanguage, backToPage, prevTopicOrder,title,classroomTitle,grade: grades[0],section: sections[0], referenceContent }), '_self')
                return
            }
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId: get(course, 'id'), topicId: get(topic, 'id'), batchId: get(classroom, 'id'), prevTopicId, componentId: get(firstComponent, 'blockBasedProject.id'), componentName: get(firstComponent, 'componentName'), sessionId: id, documentType: documentType, isRevisit, codingLanguage, backToPage, prevTopicOrder,title,classroomTitle,grade: grades[0],section: sections[0], referenceContent })

        } else if (firstComponent && firstComponent.componentName === 'assignment') {
            if (isViewingContent) {
                window.open(getStudentAppRoute({ route: 'session-embed', courseId: get(course, 'id'), topicId: get(topic, 'id'), batchId: get(classroom, 'id'), prevTopicId, componentName: get(firstComponent, 'componentName'), sessionId: id, documentType: documentType, isRevisit,sessionStatus: sessionStatusInState, codingLanguage, backToPage, prevTopicOrder,title,classroomTitle,grade: grades[0],section: sections[0], referenceContent }), '_self')
                return
            }
            redirectURL = getStudentAppRoute({ route: 'session-embed', courseId: get(course, 'id'), topicId: get(topic, 'id'), batchId: get(classroom, 'id'), prevTopicId, componentName: get(firstComponent, 'componentName'), sessionId: id, documentType: documentType, isRevisit, codingLanguage, backToPage, prevTopicOrder,title,classroomTitle,grade: grades[0],section: sections[0], referenceContent })

        }
        else {
            if (firstComponent && firstComponent.componentName === 'learningObjective') {
                let LoRedirectKey = 'learning-slides'
                const sortedDefaultLoCompRule = get(course, 'defaultLoComponentRule', []).sort((a, b) => get(a, 'order') - get(b, 'order'))
                const filteredLoComponentRule = getFilteredLoComponentRule(get(firstComponent, 'learningObjective'), sortedDefaultLoCompRule, (get(firstComponent, 'learningObjectiveComponentsRule', []) || []))
                if (filteredLoComponentRule && filteredLoComponentRule.length) {
                    LoRedirectKey = getLORedirectKey(filteredLoComponentRule[0])
                    if (isViewingContent) {
                        window.open(getStudentAppRoute({ route: 'session-embed', courseId: get(course, 'id'), topicId: get(topic, 'id'), batchId: get(classroom, 'id'), prevTopicId, componentId: get(firstComponent, 'learningObjective.id'), componentName: LoRedirectKey, isLoComponent: 'true', sessionId: id, documentType: documentType, isRevisit,sessionStatus: sessionStatusInState, codingLanguage, backToPage, prevTopicOrder,title, referenceContent }), '_self')
                        return
                    }
                    redirectURL = getStudentAppRoute({ route: 'session-embed', courseId: get(course, 'id'), topicId: get(topic, 'id'), batchId: get(classroom, 'id'), prevTopicId, componentId: get(firstComponent, 'learningObjective.id'), componentName: LoRedirectKey, isLoComponent: 'true', sessionId: id, documentType: documentType, isRevisit, codingLanguage, backToPage, prevTopicOrder,title, referenceContent })         
                }
                redirectURL = getStudentAppRoute({ route: 'session-embed', courseId: get(course, 'id'), topicId: get(topic, 'id'), batchId: get(classroom, 'id'), prevTopicId, componentId: get(firstComponent, 'learningObjective.id'), componentName: LoRedirectKey, isLoComponent: 'true', sessionId: id, documentType: documentType, isRevisit, codingLanguage, backToPage, prevTopicOrder,title, referenceContent })         
            }
        }
        if (openInNewTab) {
          window.open(redirectURL, "_self", "noreferrer");
        } else {
          window.open(redirectURL, "_self");
        }
    }

    const componentTrackerData = async() => {
        const assignments = [];
        const video = [];
        const learningObjective = [];
        const practice = [];
        const trackerInput = {
            componentId: '',
            visited: false,
            submitted: false,
            userId: '',
        };
        const userIds = attendance && attendance.map(item => get(item, 'student.user.id'))
        userIds && userIds.forEach((userId) => {
            trackerInput.userId = userId
            console.log('')
            assignments.push({...trackerInput});
            video.push({...trackerInput});
            learningObjective.push({...trackerInput});
            practice.push({...trackerInput});
        });
        return { assignments, video, learningObjective, practice}
    }

    console.log('batch session id .... ', id)

    const startSession = async (sessionId, redirectLink) => {
        // const sessionData = filterKey(window && window.store.getState().data.getIn(['batchSession', 'data']), `sessionComponentTracker/${id}`).toJS()
        // if(!get(sessionData,'[0].sessionComponentTracker.id','')){
        //     const input = await componentTrackerData()
        //     await addSessionComponentTracker({batchConnectId: id, input})
        // }
        const input = await componentTrackerData()
        const inputObj = { ...input, batchSessionId: id }
        const user = loggedInUser && loggedInUser.toJS()
        await addSessionComponentTracker(inputObj, user)
        try {
            if (documentType === 'batchSession') {
                let retakeSessionId = false
                // if (retakeSessionsRecord.length) {
                //     const allottedRetakeSession = retakeSessionsRecord.find(retakeSession => get(retakeSession, 'sessionStatus') === "allotted")
                //     if (allottedRetakeSession) {
                //         retakeSessionId = get(allottedRetakeSession, 'id')
                //     }
                // }
                const updatedArr = attendanceList(attendance)
                await startBatchSession(sessionId, fromClassroomCoursePage, retakeSessionId, user, updatedArr)
                await fetchBatchSessionOtp(sessionId, user)
                localStorage.setItem('someSessionIsInProgress',true)
            } else {
                const res = await startAdhocSession(sessionId)
                localStorage.setItem('someSessionIsInProgress',true)
            }
        } catch (error) {
            getToasterBasedOnType({ message: 'Unable to start Class!', type: "error", })
        }
    }

    const endSession = async (sessionId) => {
        const user = loggedInUser && loggedInUser.toJS()
        try {
            if (documentType === 'batchSession') {
                let retakeSessionId = false
                // if (retakeSessionsRecord.length) {
                //     const startedRetakeSession = retakeSessionsRecord.find(retakeSession => get(retakeSession, 'sessionStatus') === "started")
                //     if (startedRetakeSession) {
                //         retakeSessionId = get(startedRetakeSession, 'id')
                //     }
                // }
                const attendanceArr = attendanceList(attendance)
                await endBatchSession(sessionId, retakeSessionId, user, false, attendanceArr).then(res => {
                    if (get(res, 'updateBatchSession.id') && fromClassroomCoursePage) {
                        const newBatchSession = { ...get(res, 'updateBatchSession', {}) }
                        const newRatakeSessions = get(newBatchSession, 'retakeSessions', [])
                        if (newRatakeSessions.length) {
                            const updatedRetakeSessions = newRatakeSessions.length && newRatakeSessions.map(item => get(item, 'id') === retakeSessionId ? { ...item, sessionStatus: "completed" } : item)
                            newBatchSession['retakeSessions'] = updatedRetakeSessions
                        }
                        updateSessionLocally('updateSessionStatus', get(res, 'updateBatchSession.id'), {
                            ...newBatchSession
                        })
                    }
                })
                if (!fromClassroomCoursePage) {
                    localStorage.removeItem('someSessionIsInProgress')
                }
            } else {
                 endAdhocSession(sessionId)
                // setIsSessionDetailsModalVisible(false)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (isDeleteSessionModalVisible && hasDeletedSession) {
            getToasterBasedOnType({
                className: 'teacher-app-theme',
                type: "success",
                message: "Session Successfully deleted!"
            });
            (async function () {
                try {
                    if (filterClassroomSessionQuery && filterClassroomSessionQuery.startDate && filterClassroomSessionQuery.endDate) {
                        await getClassroomSessions(filterClassroomSessionQuery, loggedInUser)
                    }
                } catch (err) {
                    console.log(err)
                }
            })()
            setIsDeleteSessionModalVisible(false)
            setIsSessionDetailsModalVisible(false)
            isSessionDetailsModalOpenedRef.current=false
        }
    }, [isDeletingSession])

    useEffect(() => {
        if (isDeleteSessionModalVisible && hasDeleteSessionFailed) {
            if(props.error){
                const errors=props.error.toJS()
                const errorItem=errors[errors.length-1]
                getToasterBasedOnType({
                    type: "error",
                    message: get(errorItem,'error.errors[0].message','Error Deleting Session')
                });
            }
        }
    }, [isDeletingSession])

    const redirectToNextPage = () => {
        getRedirectionLink()
        setIsSessionDetailsModalVisible(false)
        isSessionDetailsModalOpenedRef.current=false
    }

    const generateOtpAndRedirect = async() => {
        if (fromTeacherTrainingBatch) return redirectToNextPage()
        setIsGeneratingOtp(true)
        const generatedSessionDetail = await generateOtpForUnAttendedSession(id)
        setIsGeneratingOtp(false)
        if (get(generatedSessionDetail, 'otp')) {
            redirectToNextPage()
        }
    }

    useEffect(() => {
        if (firstMount.current) return
        if (isUpdateBatchSessionStatusSuccess && fetchBatchSessionOtpStatusSuccess && sessionStatusInState !== 'started') {
            const isOtpExist = get(fetchBatchSessionOtpData, 'otp')
            try {
                if (isOtpExist) {
                    // redirectToNextPage()
                } else {
                    generateOtpAndRedirect()
                }
            } catch (error) {
                console.log(error)
            }
        }
        if (isUpdateBatchSessionStatusFailure || fetchBatchSessionOtpStatusFailure) {
            getToasterBasedOnType({
                type: "error",
                message: "Error starting session!"
            });
        }
    }, [isUpdateBatchSessionStatusLoading, fetchBatchSessionOtpStatusLoading])

    useEffect(() => {
        if (firstMount.current) return

        if (isUpdateAdhocSessionStatusSuccess && sessionStatusInState !== 'started') {
            getToasterBasedOnType({
                className: 'teacher-app-theme',
                type: "success",
                message: "Session started successfully!"
            });

            if (!fromClassroomCoursePage) {
                setClassEvents((prevState) => ({
                    ...prevState, allEvents: prevState.allEvents.map(classroom => classroom.id !== id ? classroom : { ...classroom, sessionStatus: 'started' }), filteredEvents: prevState.filteredEvents.map(classroom => classroom.id !== id ? classroom : { ...classroom, sessionStatus: 'started' })
                }))
            }
            setIsSessionDetailsModalVisible(false)
            isSessionDetailsModalOpenedRef.current=false
        }
        if (isUpdateAdhocSessionStatusFailure) {
            getToasterBasedOnType({
                type: "error",
                message: "Error starting session"
            });
        }

    }, [isUpdateAdhocSessionStatusLoading])
    useEffect(() => {
        if (firstMount.current) return
        if (isUpdateBatchSessionStatusSuccess && (sessionStatusInState === 'started'
            || (fromClassroomCoursePage && sessionStatusInState === 'completed' && !isCreatingRetakeClass))) {
            getToasterBasedOnType({
                className: 'teacher-app-theme',
                type: "success",
                message: "Session ended successfully!"
            });
            if (!fromClassroomCoursePage) {
                setClassEvents((prevState) => ({
                    ...prevState, allEvents: prevState.allEvents.map(session => session.id !== id ? session : { ...session, sessionStatus: 'completed' }), filteredEvents: prevState.filteredEvents.map(session => session.id !== id ? session : { ...session, sessionStatus: 'completed' })
                }))
                const someSessionIsInProgress = isSomeSessionInProgress(get(classEvents,'allEvents',[]))
                if(!someSessionIsInProgress){
                    localStorage.removeItem('someSessionIsInProgress')
                }
            }
            setIsSessionDetailsModalVisible(false)
            if (isEndSessionModalVisible) setIsEndSessionModalVisible(false)
            isSessionDetailsModalOpenedRef.current=false
        }
    }, [isUpdateBatchSessionStatusLoading])

    useEffect(() => {
        if (firstMount.current) return
        //we use extra && sesionStatus in below if condition, coz update session queries are same.Hence to distinguish the type of update (start/end), we use that extra condition.
        if (isUpdateAdhocSessionStatusSuccess && sessionStatusInState === 'started' && !isCreatingRetakeClass) {
            getToasterBasedOnType({
                className: 'teacher-app-theme',
                type: "success",
                message: "Session ended successfully!"
            });
            setClassEvents((prevState) => ({
                ...prevState, allEvents: prevState.allEvents.map(classroom => classroom.id !== id ? classroom : { ...classroom, sessionStatus: 'completed' }), filteredEvents: prevState.filteredEvents.map(classroom => classroom.id !== id ? classroom : { ...classroom, sessionStatus: 'completed' })
            }))
            const someSessionIsInProgress = isSomeSessionInProgress(get(classEvents,'allEvents',[]))
            if(!someSessionIsInProgress){
                localStorage.removeItem('someSessionIsInProgress')
            }
            setIsSessionDetailsModalVisible(false)
            setIsEndSessionModalVisible(false)
            isSessionDetailsModalOpenedRef.current=false
        }
    }, [isUpdateAdhocSessionStatusLoading])

    useEffect(() => {
        if (documentType !== 'adhocSession') {
            (async function () {
                try {
                } catch (error) {
                    console.log(error)
                }
            })()
        }
    }, [])

    useEffect(() => {
        const user = loggedInUser && loggedInUser.toJS()
        if ((isCurrentTimeBetweenSessionStartAndEndTime && sessionStatusInState === 'allotted') || sessionStatusInState === 'started' || (sessionStatusInState === 'completed' && isRetakeSession)) {
            (async function () {
                await fetchLiveAttendance(id, user)
                attendanceIntervalRef.current = setInterval(
                    () => fetchLiveAttendance(id, user),
                    15000
                );
            }
            )()
        }
        return () => clearInterval(attendanceIntervalRef.current)
    }, [])

    useEffect(() => {
        // getCurrentLiveStudent();
    }, [fetchLiveAttendanceStatusSuccess]);

    //KEEP THIS USEFFECT AT THE BOTTOM
    useEffect(() => {
        firstMount.current = false
        return () => firstMount.current = true
    }, [])

    useEffect(() => {
        if (isStartEvaluationButtonClicked) {
            if (get(props.evaluationDataFetchStatus, 'loading')) {
                setIsFetchingEvaluationData(true)
            } else {
                if (get(props.evaluationDataFetchStatus, 'success')) {
                    setEvaluationDataFromProps()
                }
                setIsFetchingEvaluationData(false)
            }
        }
    }, [props.evaluationDataFetchStatus, props.evaluationData])
   
    const gtmUserParamsData = () => {
        const me = getMe()
        const userParams =  {...getUserParams(),
        topicId: get(topic, 'id'),
        batchId: get(classroom, 'id'),
        courseId: get(course, 'id'),
        }
        return userParams
    }

    const getPresentStudents = () => attendance.filter(item => get(item, 'isPresent'))

    const setEvaluationDataFromProps = () => {
        const evaluationDataFromPropsTemp = { ...props.evaluationData }
        let currentPracticeQuestion = null
        let evaluationType = null
        if (Object.keys(evaluationDataFromPropsTemp.blockBasedPracitce).length) {
            const topicComponentRule = get(topic, 'topicComponentRule')
            const blockBasedPracticeComponent = topicComponentRule && topicComponentRule.filter((rule) => get(rule, 'componentName') === 'blockBasedPractice' || get(rule, 'componentName') === 'homeworkPractice')
            const getsortedEvaluationDataTemp = getsortedEvaluationData(props.evaluationData, blockBasedPracticeComponent)
            evaluationDataFromPropsTemp.blockBasedPracitce = getsortedEvaluationDataTemp
            const { classWorkPractices, homeWorkPractices } = getsortedEvaluationDataTemp
            if (classWorkPractices && classWorkPractices.length) {
                classWorkPractices.forEach(item => {
                    if (get(item, 'evaluation') === null) {
                        currentPracticeQuestion = get(item, 'blockBasedPractice.id')
                        evaluationType = evaluationTypes.PRACTICE
                    }
                })
            }
            if (!currentPracticeQuestion && homeWorkPractices && homeWorkPractices.length) {
                homeWorkPractices.forEach(item => {
                    if (get(item, 'evaluation') === null) {
                        currentPracticeQuestion = get(item, 'blockBasedPractice.id')
                        evaluationType = evaluationTypes.HW_PRACTICE
                    }
                })
            }
            if (!currentPracticeQuestion && classWorkPractices && classWorkPractices.length) {
                currentPracticeQuestion = get(classWorkPractices[0], 'blockBasedPractice.id')
                evaluationType = evaluationTypes.PRACTICE
            }
            if (!currentPracticeQuestion && homeWorkPractices && homeWorkPractices.length) {
                currentPracticeQuestion = get(homeWorkPractices[0], 'blockBasedPractice.id')
                evaluationType = evaluationTypes.HW_PRACTICE
            }
        } else {
            const { classWorkQuestions, homeWorkQuestions } = evaluationDataFromPropsTemp.userAssignment
            if (classWorkQuestions && classWorkQuestions.length) {
                classWorkQuestions.forEach(item => {
                    if (get(item, 'assignment[0].evaluation') === null) {
                        evaluationType = evaluationTypes.CODING_ASSIGNMENT
                    }
                })
            }
            if (homeWorkQuestions && homeWorkQuestions.length) {
                homeWorkQuestions.forEach(item => {
                    if (get(item, 'assignment[0].evaluation') === null) {
                        evaluationType = evaluationTypes.HW_ASSIGNMENT
                    }
                })
            }
            if (classWorkQuestions && classWorkQuestions.length) {
                currentPracticeQuestion = get(classWorkQuestions[0], 'assignment[0].evaluation')
                evaluationType = evaluationTypes.CODING_ASSIGNMENT
            }
            if (homeWorkQuestions && homeWorkQuestions.length) {
                currentPracticeQuestion = get(homeWorkQuestions[0], 'assignment[0].evaluation')
                evaluationType = evaluationTypes.HW_ASSIGNMENT
            }
        }
        setEvalautionData(evaluationDataFromPropsTemp)
        if (isStartEvaluationButtonClicked) {
            if (currentPracticeQuestion) {
                setEvaluationModalDetails({ isOpen: true, evaluationType, currentPracticeQuestion })
            } else {
                setEvaluationModalDetails({ isOpen: true, evaluationType })
            }
        }
    }

    const openEvaluationModal = () => {
        const courseId = get(course, 'id')
        const topicId = get(topic, 'id')
        const userIds = attendance && attendance.map(item => get(item, 'student.user.id'))
        setIsStartEvaluationButtonClicked(true)
        fetchEvaluationData(userIds, topicId, courseId)
    }

    const isHomeworkPresentForTopic=()=>{
        const isPresent = get(topic,'topicComponentRule',[]).find(rule=>rule.componentName==='quiz'||rule.componentName==='homeworkAssignment'||rule.componentName==='homeworkPractice')
        return isPresent
    }

    const isEvaluationModalDisabled = () => {
        let assignmentCount = 0
        let practiceCount = 0
        completedUserAssignmentData && completedUserAssignmentData.length && completedUserAssignmentData.forEach(item => {
            if (get(item, 'isAssignmentSubmitted')) {
                assignmentCount += 1
            }
            if (get(item, 'isPracticeSubmitted')) {
                practiceCount += 1
            }
        })
        if (assignmentCount || practiceCount) {
            return false
        }
        return true
    }

    const schoolSessionOtpUpdate = (id) => gql`
        mutation {
            updateSchoolSessionOtp(id: "${id}", input: {expiryDate: "${new Date().toISOString()}"}) {
                id
            }
        }
    `;

    const updateSchoolSessionOtpTimeAndRedirect = async(schoolSessionOtpId) => {
        setIsGeneratingOtp(true)
        const res = await requestToGraphql(schoolSessionOtpUpdate(schoolSessionOtpId));
        setIsGeneratingOtp(false)
        if (get(res, 'data.updateSchoolSessionOtp.id')) {
            redirectToNextPage()
        }
    }

    const attendanceList = (attendance = []) => {
        const pushStudents = [];
        // eslint-disable-next-line no-unused-expressions
        attendance.length && attendance.forEach((studentElem) => {
          if (get(studentElem, 'student.user.id')) {
            const obj = {
              id: get(studentElem, 'student.user.id'),
              status: get(studentElem, 'status'),
            };
            pushStudents.push(obj);
          }
        });
        return pushStudents;
    };

    const addBatchSubSession = () => {
        let input = {}
        const batchSessionId = get(sessionDetails, 'id')
        const mentorId = get(user, 'id')
        if (isRetakeSession) {
            input = {
                sessionStartDate: `${get(sessionDetails, 'extendedProps.sessionStartTime')}`,
                type: 'retake',
                subType: 'resume',
                sessionStatus: sessionStatus,
                batchSessionId,
                mentorId,
            }
        } else {
            input = {
                sessionStartDate: `${get(sessionDetails, 'extendedProps.sessionStartTime')}`,
                type: 'live',
                subType: 'resume',
                sessionStatus: sessionStatus,
                batchSessionId,
                mentorId,
            }
        }
        if (attendance && attendance.length) {
            input.attendance = attendanceList(attendance)
        }
        setIsAddingSubSession(true)
        addSubSession({ input, user })
        setIsAddingSubSession(false)
    }

    const onResumeButtonClick = async () => {
        // const sessionData = filterKey(window && window.store.getState().data.getIn(['batchSession', 'data']), `sessionComponentTracker/${id}`).toJS()
        // if(!get(sessionData,'[0].sessionComponentTracker.id','')){
        //     const input = await componentTrackerData()
        //     await addSessionComponentTracker({batchConnectId: id, input})
        // }
        if (fromTeacherTrainingBatch) return redirectToNextPage()
        addBatchSubSession()
        await fetchBatchSessionOtp(id).then(res => {
            const isOtpExist = get(res, 'fetchBatchSessionOtp.schoolSessionsOtp', []).length
            const schoolSessionOtpId = get(res, 'fetchBatchSessionOtp.schoolSessionsOtp[0].id')
            try {
                if (isOtpExist) {
                    updateSchoolSessionOtpTimeAndRedirect(schoolSessionOtpId)
                } else {
                    generateOtpAndRedirect()
                }
            } catch (error) {
                console.log(error)
            }
        })
    }

    const onRetakeButtonClick = async(sessionId) => {
        // const sessionData = filterKey(window && window.store.getState().data.getIn(['batchSession', 'data']), `sessionComponentTracker/${id}`).toJS()
        // if(!get(sessionData,'[0].sessionComponentTracker.id','')){
        //     const input = await componentTrackerData()
        //     await addSessionComponentTracker({batchConnectId: id, input})
        // }
        const user = loggedInUser && loggedInUser.toJS()
        const allottedRetakeSessions = retakeSessionsRecord.filter(retakeSession => get(retakeSession, 'sessionStatus') === 'allotted')
        if (sessionStatus && sessionStatus === 'completed' && !allottedRetakeSessions.length) {
            setIsCreatingRetakeClass(true)
            // const generatedSessionDetail = await generateRetakeClass(sessionId)
            // if (get(generatedSessionDetail, 'retakeSessionDetail.id')) {
            //     const retakeSessionsRecordTemp = [...retakeSessionsRecord, get(generatedSessionDetail, 'retakeSessionDetail')]
            //     let retakeSessionId = false
            //     if (retakeSessionsRecordTemp.length) {
            //         const allottedRetakeSession = retakeSessionsRecordTemp.find(retakeSession => get(retakeSession, 'sessionStatus') === "allotted")
            //         if (allottedRetakeSession) {
            //             retakeSessionId = get(allottedRetakeSession, 'id')
            //         }
            //     }

                const updatedArr = attendanceList(attendance)
                await startBatchSession(sessionId, fromClassroomCoursePage, true, user, updatedArr)
                await fetchBatchSessionOtp(sessionId)
                localStorage.setItem('someSessionIsInProgress',true)
            // }
            setIsCreatingRetakeClass(false)
        }
    }

    const getFooter = () => {
        if (sessionStatusInState === 'unattended'){
            if(classType!=='theory'){
                return <Button children={<PlayOutlineIcon />} onBtnClick={() => startSession(id)} isLoading={get(updateBatchSessionQueryStatus, 'loading') || get(updateAdhocSessionQueryStatus, 'loading') || fetchBatchSessionOtpStatusLoading || isGeneratingOtp} text={(get(updateBatchSessionQueryStatus, 'loading') || get(updateAdhocSessionQueryStatus, 'loading') || fetchBatchSessionOtpStatusLoading || isGeneratingOtp) ? 'Starting...' : 'Start Class'} leftIcon widthFull />
            }
           return null
        }

        if (sessionStatusInState === 'completed') {
            if(isClassTypeTheory) return null
            if (documentType === 'batchSession') {
                if (sessionStatus === 'completed' && isRetakeClassButtonClicked) {
                    return (
                        <div className={styles.footerWithTwoBtns}>
                            {fromClassroomCoursePage ? <Button leftIcon children={<RevisitClassContent />} type={'secondary'} text={'View Class Content'} widthFull onBtnClick={() => {
                                getRedirectionLink('', true, true, false)
                                const userParams = gtmUserParamsData()
                                fireGtmEvent(gtmEvents.viewContentClassClickedOnAllotedSessionModal,{userParams})
                            }}
                            /> : null}
                            <Button leftIcon children={<RetakeClassIcon />} onBtnClick={() => {
                                onRetakeButtonClick(id)
                                const userParams = gtmUserParamsData()
                                fireGtmEvent(gtmEvents.retakeClassClickedOnCompleteSessionModal,{userParams})
                            }} isLoading={isCreatingRetakeClass || fetchBatchSessionOtpStatusLoading || isGeneratingOtp} text={'Retake Class'} widthFull />
                        </div>
                    )
                }
                const topicCompRuleIsPresent = topicComponentRule && topicComponentRule.length !== 0
                if(!topicCompRuleIsPresent) return null
                if(topicCompRuleIsPresent){
                    return <div className={styles.footerWithTwoBtns}>
                        <Button leftIcon children={<RevisitClassContent />} type={'secondary'} text={'Revisit Class Content'} widthFull onBtnClick={() => {
                            getRedirectionLink('', true, true, false)
                            const userParams = gtmUserParamsData()
                            fireGtmEvent(gtmEvents.revisitClassContentClickedOnCompleteSessionModal,{userParams})
                        }} />
                        <Button leftIcon children={<StartEvaluationIcon />} text={'Start Evaluation'} isLoading={isFetchingEvaluationData} widthFull type='primary' onBtnClick={() => {
                            openEvaluationModal()
                            const userParams = gtmUserParamsData()
                            fireGtmEvent(gtmEvents.startEvaluationClicked,{userParams})
                        }} isDisabled={isEvaluationModalDisabled()} />
                    </div>
                }
            }
            return documentType==='adhocSession'?<Button type={'secondary'} text={'View content'} widthFull onBtnClick={() => getRedirectionLink('', true, true, false)} />:null
        }

        if (sessionStatusInState === 'started') {
            return <div className={styles.footerWithTwoBtns}>
                {!isFromSessionEmbed && <Button leftIcon children={<MarkAsComplete />} onBtnClick={() => {
                    setIsEndSessionModalVisible(true)
                    const userParams = gtmUserParamsData()
                    fireGtmEvent(gtmEvents.endClassClickedOnLiveSessionModal,{userParams})
                }} text='End Class' type={'secondary'} widthFull />}
                {documentType === 'batchSession' && !isFromSessionEmbed && <Button text='Resume Class' leftIcon children={<PlayCircle />} widthFull onBtnClick={() => {
                    onResumeButtonClick()
                    const userParams = gtmUserParamsData()
                    fireGtmEvent(gtmEvents.endClassClickedOnLiveSessionModal,{userParams})
                }} isLoading={isGeneratingOtp || isAddingSubSession} />}
            </div>
        }

        if ((isCurrentTimeBetweenSessionStartAndEndTime) && (!sessionStartedByMentorAt || fromClassroomCoursePage) && (sessionStatusInState === 'allotted' || sessionStatusInState === 'started') && classType !== 'theory') {
            return (
                <div className={styles.footerWithTwoBtns}>
                    {fromClassroomCoursePage ? <Button type={'secondary'} text={'View content'} leftIcon children={<RevisitClassContent />} widthFull onBtnClick={() => {
                        getRedirectionLink('', true, true, false)
                        const userParams = gtmUserParamsData()
                        fireGtmEvent(gtmEvents.viewContentClassClickedOnAllotedSessionModal,{userParams})    
                    }} /> : null}
                    <Button onBtnClick={() => {
                        startSession(id)
                        const userParams = gtmUserParamsData()
                        fireGtmEvent(gtmEvents.startClassClickedOnAllotedSessionModal,{userParams})
                    }} isLoading={get(updateBatchSessionQueryStatus, 'loading') || get(updateAdhocSessionQueryStatus, 'loading') || fetchBatchSessionOtpStatusLoading || isGeneratingOtp} text={(get(updateBatchSessionQueryStatus, 'loading') || get(updateAdhocSessionQueryStatus, 'loading') || fetchBatchSessionOtpStatusLoading || isGeneratingOtp) ? 'Starting...' : 'Start Class'} leftIcon widthFull children={<StartSessionIcon />} />
                </div>
            )
        }
        return ((documentType === 'batchSession') && ((topicComponentRule || []).length!==0) && (classType !== 'theory')) ? <Button text={'View content'} widthFull onBtnClick={() => getRedirectionLink('', true, true, false)} /> : null
    }

    const isMoreDetailsHidden=()=>{
        if((sessionStatusInState==='allotted' && !isCurrentTimeBetweenSessionStartAndEndTime && !homeworkSubmissions.isHomeworkExists && !homeworkSubmissions.isQuizExists )) return true
        return false
    }

    const isContentEmpty=({sessionStatus,topicComponentRule=[]})=>{
        if((sessionStatus === 'allotted')){
            if(topicComponentRule && topicComponentRule.length) return false
            return true
        }
    }

    const checkIfUnpublished = ({ sessionStatus }) => {
        if((sessionStatus === 'allotted')){
            if(contentStatus === PUBLISHED_STATUS) return false
            return true
        }
    }

    const showFooter=()=>{
        if (isClassTypeTheory) return null
        if(sessionStatusInState==='unattended'||(sessionStatusInState === 'started')||(sessionStatusInState === 'completed')||(sessionStatusInState === 'allotted' && (contentStatus === PUBLISHED_STATUS || isCmsAdmin) && topicComponentRule && topicComponentRule.length!==0)){
            return <div className={styles.footer}>
            {getFooter()}
        </div>
        }
        return null
    }

    const getClassRoomTitle = (classroom) => {
        const classroomTitle = get(classroom, 'classroomTitle')
        return classroomTitle.replace(' ', ' - ')
    }

    const WarningForLiveClasses = () => {
        let msec = (new Date()).getTime() - (new Date(sessionStartTime)).getTime()
        const hh = Math.floor(msec / 1000 / 60 / 60)
        if (hh > 3 && liveBatchSessions.length >= 3) {
            return (
                <div className={styles.attendanceWarningContainerContain}>
                    <div className={styles.attendanceWarningContainer} style={{ background: '#fff', border: '1px solid #F2F2F2', flexDirection: 'column' }}>
                        <p style={{ color: '#666666' }}><span style={{ color: '#121212', fontWeight: '600' }}>Note:</span> You have <span style={{ color: '#B77A00', fontWeight: '600' }}>{liveBatchSessions.length} incomplete </span>classes. Complete them to increase overall course progress.</p>
                    </div>
                </div>
            )
        }
    }

    const checkIfHomeworkExists = (topicComponentRule) => {
        return topicComponentRule && topicComponentRule.filter(item => get(item, 'componentName') === 'homeworkAssignment' || get(item, 'componentName') === 'homeworkPractice' || get(item, 'componentName') === 'quiz').length
    }

    const renderTeacherManual = () => {
        return (
            <div className={styles.teacherManualContainer}>
                <p>Prepare for this topic before taking the class,<span onClick={() => {
                        setShowTeacherManualModal(true)
                        const userParams = gtmUserParamsData()
                        fireGtmEvent(gtmEvents.teacherManualOnSessionsPageClicked,{userParams})
                    }}>
                        View Teacher Manual.
                    </span></p>
            </div>
        )
    }

    return <>

        <div ref={domRef} className={styles.sessionModalContainer} role="dialog" aria-labelledby='modalTitle' aria-describedby='modalDesc'>
            <div className={styles.sessionModal}>
                <div className={styles.header}>
                    <div className={styles.header_headingContainer}>
                        <div className={styles.sessionIcon}> <CalenderSvg /></div>
                        <span id='modalTitle' className={styles.modalTitle}>{get(sessionDetails, 'groupName')}</span>
                        {/* <span id='modalTitle' className={styles.modalTitle}>{get(classroom, 'classroomTitle') ? getClassRoomTitle(classroom) : `Grade - ${getGradesAndSections(grades, sections)}`} | Session {sessionStatusInState === 'unattended' ? 'Unattended' : 'Details'}</span> */}
                    </div>
                    {(showDeleteBtn && !fromClassroomCoursePage) && <button onClick={() => setIsDeleteSessionModalVisible(true)} className={styles.deleteBtn}>
                        Delete Session
                    </button>}
                    {(forceRescheduleButton > FORCE_COUNT && !fromClassroomCoursePage) ? (sessionStatusInState === 'allotted' || sessionStatusInState === 'unattended') ? <button onClick={() => { setIsSessionDetailsModalVisible(false); setIsRescheduleModalVisible(true) }} className={styles.rescheduleBtn}>Reschedule</button> : null : <div
                        style={{
                            width: '80px',
                            height: '20px',
                        }}
                        onClick={() => {
                            setForceRescheduleButton(forceRescheduleButton + 1);
                        }}
                    />}
                    <div className={styles.closeModalIcon} onClick={() => {
                        setIsSessionDetailsModalVisible(false);
                        isSessionDetailsModalOpenedRef.current=false
                        setIsRetakeClassButtonClicked(false)
                        }}>
                        <CloseCircle height='24' width='24' color='#a27fd5' />
                    </div>
                </div>
                <div className={`${styles.body} ${(isClassTypeTheory || (sessionStatusInState==='allotted' && topicComponentRule && topicComponentRule.length===0) || (sessionStatusInState==='allotted' && (contentStatus === UNPUBLISHED_STATUS && !isCmsAdmin))) && styles.withBorderRadius}`}>
                    <Heading
                        sessionId={id}
                        isUpcomingSessionId={isUpcomingSession}
                        startTime={start}
                        isCurrentTimeBetweenSessionStartAndEndTime={isCurrentTimeBetweenSessionStartAndEndTime}
                        title={title}
                        order={order}
                        topicComponentRuleLength={(topicComponentRule||[]).length}
                        sessionType={sessionType}
                        documentType={documentType}
                        previousTopic={previousTopic}
                        time={`${getTime(start, '', startMinutes)} - ${getTime(end, start, endMinutes)}`}
                        day={`${moment(start).format('llll').split(',').slice(0, 2).join(',')}`}
                        gradeAndSection={get(classroom, 'classroomTitle') ? getClassRoomTitle(classroom) : `Grade - ${getGradesAndSections(grades, sections)}`}
                        isBatchSessionPresent={(fromClassroomCoursePage && isBatchSessionPresent)}
                        topicThumbnail={thumbnail}
                        classType={classType}
                        sessionStatus={sessionStatusMap[sessionStatusInState]}
                        isMoreDetailsHidden={isMoreDetailsHidden}
                        updateSessionLocally={updateSessionLocally}
                        fromClassroomCoursePage={fromClassroomCoursePage}
                        isStartingSession={isStartingSessionInState}
                        classroom={classroom}
                        setSessionStatusInState={setSessionStatusInState}
                        setIsStartingSessionInState={setIsStartingSessionInState}
                        isRetakeSession={isRetakeSession}
                        retakeSessionsRecord={retakeSessionsRecord}
                        setRetakeSessionsRecord={setRetakeSessionsRecord}
                        topicComponentRule={topicComponentRule}
                        sessionStatusInState={sessionStatusInState}
                        sessionStartDay={`${moment(sessionStartTime).format('llll').split(',').slice(0, 2).join(',')}`}
                        sessionStartTime={`${getTime(sessionStartTime, '', '')}`}
                        sessionEndDay={`${moment(sessionEndTime).format('llll').split(',').slice(0, 2).join(',')}`}
                        sessionEndTime={`${getTime(sessionEndTime, '', '')}`}
                        startSessionTimeFull={sessionStartTime}
                        liveAttendance={liveAttendance}
                        isRetakeClassButtonClicked={isRetakeClassButtonClicked}
                        setIsRetakeClassButtonClicked={setIsRetakeClassButtonClicked}
                        fromTeacherTrainingBatch={fromTeacherTrainingBatch}
                        contentStatus={contentStatus}
                        isCmsAdmin={isCmsAdmin}
                    />
                   {isClassTypeTheory?<EmptyState text={`Refer to your Grade ${grades[0].slice(5)} textbook for this topic.`} icon={<Book/>} containerStyles={{padding:`${hs(20)} 0 ${hs(14)} 0`}} />:(isContentEmpty({sessionStatus: sessionStatusInState,topicComponentRule}) || (checkIfUnpublished({ sessionStatus: sessionStatusInState }) && !isCmsAdmin)) ?<EmptyState text={'To view future content, please contact us.'} icon={<LockClosedOutline/>} containerStyles={{padding:`${hs(20)} 0 ${hs(14)} 0`}}/>: isMoreDetailsHidden() ? null : <div className={(checkIfHomeworkExists(get(previousTopicDetails, 'topicComponentRule', [])) || sessionStatusMap[sessionStatusInState] !== 'yetToBegin') ? styles.moreDetailsContainerAtParent : null}>
                        <MoreDetails classroomNextSessionsLoading={classroomNextSessionsLoading} currentClassroomMetaLoading={currentClassroomMetaLoading} previousSessionTopicDataLoading={previousSessionTopicDataLoading} data={{
                            isCurrentTimeBetweenSessionStartAndEndTime: isCurrentTimeBetweenSessionStartAndEndTime,
                            sessionId: id,
                            isUpcomingSessionId: isUpcomingSession,
                            recording: sessionRecordingLink,
                            topic: prevTopicTitle,
                            sessionMode: sessionMode,
                            homeworkSubmissions: {
                                hwSubmissions: get(homeworkSubmissions, 'hwSubmissions', 0), quizSubmissions: get(homeworkSubmissions, 'quizSubmissions', 0), completedPQMeta: get(homeworkSubmissions, 'completedPQMeta', 0), isPQComponentExists: get(homeworkSubmissions, 'isPQComponentExists'),
                                isHomeworkExists:get(homeworkSubmissions,'isHomeworkExists'),
                                isQuizExists:get(homeworkSubmissions,'isQuizExists'),
                            },
                            start,
                            end,
                            presentStudents: presentStudents.length,
                            sessionType: sessionStatusMap[sessionStatusInState],
                            sessionStartTime: sessionStartTime,
                            sessionEndTime: sessionEndTime,
                            totalStudents: (sessionStatusInState === 'completed' || sessionStatus === 'completed') ? totalStudents : totalStudentsInClass,
                            attendance,
                            classType,
                            topicComponentRule: topicComponentRule,
                            previousTopicDetails: previousTopicDetails,
                            completedUserAssignmentData: completedUserAssignmentData,
                            liveAttendance: liveAttendance && get(liveAttendance,'[0].attendance')
                        }} />
                    </div>}
                    {(sessionStatus === 'started' || sessionStatus === 'allotted') && !(isContentEmpty({sessionStatus: sessionStatusInState,topicComponentRule}) || (checkIfUnpublished({ sessionStatus: sessionStatusInState }) && !isCmsAdmin)) ? WarningForLiveClasses() : null}
                    {(get(topic, 'referenceContent') && ((!checkIfUnpublished({ sessionStatus: sessionStatusInState }) && !isCmsAdmin) || isCmsAdmin)) ? renderTeacherManual() : null}
                </div >
                {
                    showFooter()
                }
            </div >

        </div >
        {isDeleteSessionModalVisible && <DeleteSessionModal setIsDeleteSessionModalVisible={setIsDeleteSessionModalVisible} deleteSession={() => deleteScheduledSession(id)} />}

        {isEndSessionModalVisible && <EndSessionModal endSession={() => endSession(id)} setIsEndSessionModalVisible={setIsEndSessionModalVisible} isLoading={isUpdateBatchSessionStatusLoading || isUpdateAdhocSessionStatusLoading} newFlow />}
        
        {get(evaluationModalDetails, 'isOpen') && <EvaluationContextProvider>
            <EvaluationModal evaluationModalDetails={evaluationModalDetails} setEvaluationModalDetails={setEvaluationModalDetails} topicDetails={{ title: get(topic, 'title'), topicId: get(topic, 'id') }} students={getPresentStudents()} courseId={get(course, 'id')} assignmentData={evaluationData} fromSessionModal setIsStartEvaluationButtonClicked={setIsStartEvaluationButtonClicked} />
        </EvaluationContextProvider>}
        <ViewDetailsModal
            title={`Teacher Manual - Lab ${order}. ${title}`}
            body={get(topic, 'referenceContent')}
            showFooter={true}
            onClose={() => setShowTeacherManualModal(false)}
            visible={showTeacherManualModal}
        >
        </ViewDetailsModal>
    </>
}

const mapStateToProps = (state,props) => ({
    previousSessionTopicDataLoading: state.data.getIn(['previousSessionTopicData', 'fetchStatus', 'previousSessionTopicData', 'loading']),
    currentClassroomMetaLoading:state.data.getIn(['currentClassroomMeta','fetchStatus','currentClassroomMeta','loading']),
    classroomNextSessionsLoading:state.data.getIn(['classroomNextSessions','fetchStatus',`classroomNextSessions/${get(props,'sessionDetails.extendedProps.classroom.id')}`,'loading']),
    error: state.data.getIn([
        "errors",
        "deleteClassroomSession/delete",
      ]),
})
export default connect(mapStateToProps)(SessionModal)

// prevtopicdetails
// live attendance (is present is not there)
// session component meta