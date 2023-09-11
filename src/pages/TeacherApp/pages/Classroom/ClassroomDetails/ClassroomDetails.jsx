import React, { useEffect, useRef, useState } from 'react'
import { List } from 'immutable'
import {useParams} from 'react-router'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import { get, over } from 'lodash'
import moment from 'moment'
import header from "../../../../../utils/header";

import ClassroomDetailsHeader from './ClassroomDetailsHeader'
import ProgressBarVertical from './ProgressBarVertical'
import UpcomingTopicsContainer from './UpcomingTopicsContainer'
import NoSessionsEmptyState from './NoSessionsEmptyState'
import AttendanceTooltip from './AttendanceTooltip'
import fetchBatchDetails from '../../../../../queries/teacherApp/fetchBatchDetails'
import LoadingSpinner from '../../../components/Loader/LoadingSpinner'
import { customStyles } from '../../../components/Dropdowns/Dropdown'
import { AbsentUserBlock, ChevronLeft, ChevronRight, InformationCircle, PendingClock } from '../../../../../constants/icons'
import hs, { hsFor1280 } from '../../../../../utils/scale'
import fetchPreviousClassromDetails from '../../TimeTable/components/SessionModal/queries/fetchPreviousClassromDetails'
import getThemeColor from '../../../../../utils/teacherApp/getThemeColor'
import getClassworkSummary from '../../../../../queries/teacherApp/getClassworkSummary'
import getHomeworkSummary from '../../../../../queries/teacherApp/getHomeworkSummary'
import requestToGraphql from '../../../../../utils/requestToGraphql'

import { getBatchStrength } from '../../DetailedReport/DetailedReport.helpers'
import { codingAssignments, getAbsentStudents, getBlockBasedPracticeComponents, getBlockBasedPracticePercentage, getClassworkReport, getDetailsOfSelectedTopic, getHomeworkPracticePercentage, getHomeworkPracticeTitle, getProjectLogo, getProjectTitle, isClassworkComponentPresent, isHomeworkAssignmentPresent, isHomeworkComponentPresent, isHomeworkPracticePresent, isHomeworkQuizPresent, isNosOfCardsGreaterThan, modifiedBatchDetails, modifiedNextSessionsDetails, getBlockBasedHomeworkPracticeComponents, filterSubmittedAssignmentData, getsortedEvaluationData, getAllBlockBasedPracticeComponents, getBlockBasedPracticeSubmissionCount } from './ClassroomDetails.helpers'

import styles from './classroomDetails.module.scss'
import Button from '../../../components/Button/Button'
import EvaluationModal from '../components/EvaluationModal/EvaluationModal'
import { EvaluationContextProvider } from '../components/EvaluationModal/contexts/EvaluationContext'
import fetchEvaluationData from '../../../../../queries/teacherApp/fetchEvaluationData'
import UpdatedToolTip from '../../../../../components/UpdatedToolTip/UpdatedToolTip'
import StudentListTooltip from '../../../components/StudentListTooltip'
import ReportStatsComponent from '../../../components/ReportStatsComponent'
import { calculateClassworkTotalSubmission, calculateHomeworkTotalSubmission } from '../../../utils'
import getColorBasedOnPercentage from '../../../../../utils/teacherApp/getColorBasedOnPercentage'
import { StatusTag } from './StatusTag'
import { sessionStartedOrCompleted } from '../../TimeTable/constants'
import fetchTeacherBatches from '../../../../../queries/teacherApp/fetchTeacherBatches'

const newStyles = {
    ...customStyles,
    option: (styles, { isFocused, isSelected }) => ({
        ...styles,
        cursor: 'pointer',
        color:  '#333333',
        fontSize: `${hs(20)} !important`,
        backgroundColor: isSelected ? '#F4F0FA' : 'white',
        '&:hover': {
            backgroundColor: isSelected ? '#F4F0FA' : '#F4F0FA',
        },
        display: 'block',
        overflowY: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    }),
    control: (styles) => ({
        ...styles,
        cursor: "pointer",
        fontFamily: "Inter",
        minHeight: hsFor1280(36),
        maxHeight: hsFor1280(36),
        border: "1px solid #AAAAAA",
        outline: 'none',
        fontSize: `${hs(20)} !important`,
        // backgroundColor: 'transparent',
        borderRadius: "8px",
        '&:hover': {
            border: `1px solid #ddd`,
            boxShadow: '0 0 0 0px black',
        },
        '&:disabled': {
            backgroundColor: '#EEEEEE!important',
            color: '#AAAAAA'
        },
    }),
    placeholder: (styles) => ({
        ...styles,
        fontSize: `${hs(20)} !important`,
        color: "#333333 !important",
        fontWeight: "400",
    }),
    dropdownIndicator: (styles) => ({
        ...styles,
        position: 'relative',
        bottom: '2px',
        color: "#AAA",
        "&:hover": {
            color: "#AAA",
        },
    }),
    indicatorSeparator: (styles) => ({
        ...styles,
        backgroundColor: 'transparent'
    }),
    singleValue: (styles) => ({
        ...styles,
        fontSize: `${hs(20)} !important`,
        fontWeight: '400 !important',
        top: '50%',
        justifyContent: 'flex-start!important'
    }),
    input: (styles) => ({
        ...styles,
        color: "transparent",
    }),
    valueContainer: (styles) => ({
        ...styles,
        width: hs(400),
    }),
};
const tooltipStyles = {
    backgroundColor: "#8C61CB",
    minWidth: hs(165),
    maxWidth: hs(400),
    maxHeight: hs(265),
    height: 'max-content'
};

export const evaluationTypes={
    CODING_ASSIGNMENT:'codingAssignment',
    HW_ASSIGNMENT:'hwAssignment',
    PRACTICE: 'practice',
    HW_PRACTICE: 'hwPractice',
}

const doesSubmissionAlreadyExist = (arr, userId) => {
    return arr.find(a => get(a, 'userId') === userId)
}

const getTryList = (arr, tries) => {
    const firstTryList = []
    arr && arr.forEach(item => {
        const submissions = get(item , 'submissions', [])
        submissions.forEach(submission => {
            if (submission[tries]) {
                if (!doesSubmissionAlreadyExist(firstTryList, get(submission, 'userId'))) {
                    const obj = {
                        rollNo: get(submission, 'rollNo'),
                        username: get(submission, 'userName'),
                        userId: get(submission, 'userId'),
                    }
                    firstTryList.push(obj)
                }
            }
        })
    })
    return firstTryList
}

const BarCard = ({ data, forQuiz, classSummaryDropdownValue }) => {
    const { topic,
        loId,
        submittedPercentage = 0,
        unAttempted,
        correct,
        inCorrect,
        firstTryPercentage = 0,
        secondTryPercentage = 0,
        thirdTryPercentage = 0,
        avgTriesPerQuestion = '-',
        avgTimePerQuestion = '-',
        averageScore = '-',
        avgCorrect = 0,
        avgIncorrect = 0,
        totalQuestions,
        type,
        submissionCount,
        questionCount,
        pqIndividualQuestionReport
    } = data

    const firstTryList = getTryList(pqIndividualQuestionReport, 'firstTry')
    const secondTryList = getTryList(pqIndividualQuestionReport, 'secondTry')
    const thirdTryList = getTryList(pqIndividualQuestionReport, 'thirdTry')

    const getPercentage = (num1, num2) => {
        if (num1 && num2) {
            return Number((num1 / num2).toFixed(2)) * 100
        }
        return 0
    }

    let submittedFirstTryPercentage = Math.round(Number((firstTryPercentage*submittedPercentage/100)))
    let submittedSecondTryPercentage = Math.round(Number((secondTryPercentage*submittedPercentage/100)))
    let submittedThirdTryPercentage = Math.round(Number((thirdTryPercentage*submittedPercentage/100)))

    if((submittedFirstTryPercentage+submittedSecondTryPercentage+submittedThirdTryPercentage)>submittedPercentage){
        const val = Math.max(submittedFirstTryPercentage,submittedSecondTryPercentage,submittedThirdTryPercentage)
        if(val===submittedFirstTryPercentage){
          submittedFirstTryPercentage=submittedFirstTryPercentage-1
        } 
        if(val===submittedSecondTryPercentage){
          submittedSecondTryPercentage=submittedSecondTryPercentage-1
        } 
        if(val===submittedThirdTryPercentage){
          submittedThirdTryPercentage=submittedThirdTryPercentage-1
        } 
      }

    return <div className={styles.classSummaryCard}>
        <div className={styles.classSummaryCardBody}>
            <p className={`${styles.boldHeading} ${styles.mb16}`}>Quiz Report <span className={styles.evaluationCount}>({questionCount} Questions)</span></p>
            {(submittedPercentage !== 0 && !forQuiz) ? <div className={styles.graphAndStatisticsContainer}>
                <div className={styles.graphContainer}>
                    <div className={styles.graph}>
                        <ProgressBarVertical doneText={forQuiz?Math.round(Number((getPercentage(avgCorrect, totalQuestions)*submittedPercentage/100))): submittedFirstTryPercentage} done={forQuiz ? getPercentage(avgCorrect, totalQuestions) :firstTryPercentage} text={type !== 'homework' ? '1st Try' : 'Correct'} tryNos={'one'} list={firstTryList} showTooltip />
                    </div>
                    <div className={styles.graph}>
                        <ProgressBarVertical doneText={forQuiz?Math.round(Number((getPercentage()*submittedPercentage/100))) :submittedSecondTryPercentage} done={forQuiz ? getPercentage() : secondTryPercentage} text={type !== 'homework' ? '2nd Try' : 'Un-attempted'} tryNos={'two'} list={secondTryList} showTooltip />
                    </div>
                    <div className={styles.graph}>
                        <ProgressBarVertical doneText={forQuiz?Math.round(Number((getPercentage(avgIncorrect, totalQuestions)*submittedPercentage/100))) :submittedThirdTryPercentage} done={forQuiz ? getPercentage(avgIncorrect, totalQuestions) : thirdTryPercentage} text={type !== 'homework' ? '3rd Try' : 'Incorrect'} tryNos={'three'} list={thirdTryList} showTooltip />
                    </div>
                </div>
                <div className={styles.statisticsContainer}>
                    <div className={styles.statistic}>
                        <div className={styles.totalSubStatsContainer}>
                            <div className={styles.noOfSubText}>{submissionCount}<p>/{get(classSummaryDropdownValue, 'totalStudents')}</p></div>
                            <span className={styles.submissionPercentage} style={{ color: getColorBasedOnPercentage(submittedPercentage) }}>({submittedPercentage}%)</span>
                        </div>
                        <span>Total Submissions</span>
                    </div>
                    {type !== 'homework' ? <div className={styles.statistic}>
                        <p>{Math.round(avgTriesPerQuestion)}</p>
                        <span className={styles.underlinedLabel}>Avg. tries / question</span>
                    </div> : <div className={styles.statistic}>
                        <p>{averageScore}</p>
                        <span className={styles.underlinedLabel}>Avg. Score</span>
                    </div>}
                </div>
            </div> : (
                <div className={styles.graphAndStatisticsContainer}>
                    <div className={styles.graphContainer}>
                        <div className={styles.graph}>
                            <ProgressBarVertical
                                done={avgCorrect}
                                doneText={avgCorrect}
                                text="Correct"
                                tryNos="correct"
                            />
                        </div>
                        <div className={styles.graph}>
                            <ProgressBarVertical
                                done={avgIncorrect}
                                doneText={avgIncorrect}
                                text="Incorrect"
                                tryNos="incorrect"
                            />
                        </div>
                        <div className={styles.graph}>
                            <ProgressBarVertical
                                done={unAttempted}
                                doneText={unAttempted}
                                text="Un-attempted"
                                tryNos="unAttempted"
                            />
                        </div>
                    </div>
                    <div className={styles.statisticsContainer}>
                        <div className={styles.statistic}>
                            <div className={styles.totalSubStatsContainer}>
                                <div className={styles.noOfSubText}>{submissionCount}<p>/{get(classSummaryDropdownValue, 'totalStudents')}</p></div>
                                <span className={styles.submissionPercentage} style={{ color: getColorBasedOnPercentage(submittedPercentage) }}>({submittedPercentage}%)</span>
                            </div>
                            <span>Total Submissions</span>
                        </div>
                        {type !== 'homework' ? <div className={styles.statistic}>
                            <p>{Math.round(avgTriesPerQuestion)}</p>
                            <span className={styles.underlinedLabel}>Avg. tries / question</span>
                        </div> : <div className={styles.statistic}>
                            <p>{averageScore}</p>
                            <span className={styles.underlinedLabel}>Avg. Score</span>
                        </div>}
                    </div>
                </div>
            )}
        </div>
    </div>
}

const getAvgScore = (evaluationType, assignmentData, questionId) => {
    let evaluationData = null
    let gainedScore = 0
    let totalScore = 0
    if (evaluationTypes.CODING_ASSIGNMENT === evaluationType) {
      evaluationData = get(assignmentData, 'userAssignment.classWorkQuestions', [])
    } else if (evaluationTypes.HW_ASSIGNMENT === evaluationType) {
      evaluationData = get(assignmentData, 'userAssignment.homeWorkQuestions', [])
    } else if (evaluationTypes.PRACTICE === evaluationType) {
      evaluationData = get(assignmentData, 'blockBasedPracitce.classWorkPractices', [])
    } else if (evaluationTypes.HW_PRACTICE === evaluationType) {
      evaluationData = get(assignmentData, 'blockBasedPracitce.homeWorkPractices', [])
    }
    if (evaluationTypes.CODING_ASSIGNMENT === evaluationType || evaluationTypes.HW_ASSIGNMENT === evaluationType) {
        evaluationData.forEach(item => {
            const assignments = get(item, 'assignment', [])
            assignments.forEach(assignment => {
                if (get(assignment, 'evaluation')) {
                    totalScore += assignments.length * 5
                    gainedScore += get(assignment, 'evaluation.star', 0)
                }
            })
        })
    } else {
        evaluationData = evaluationData.filter(item => get(item, 'blockBasedPractice.id') === questionId)
        evaluationData.forEach(item => {
            if (get(item, 'evaluation')) {
                gainedScore += get(item, 'evaluation.star', 0)
                totalScore += 5
            }
        })
    }
    const result = Math.trunc((gainedScore / totalScore) * 100)
    return (evaluationData.length > 0 && result) ? result : 0
}

const PlainCard = ({ type, submittedPercentage, title = 'Assignment Report', logo,setEvaluationModalDetails,evaluationType, component, assignmentData, isFetchingEvaluationData, noOfSubmissions, classSummaryDropdownValue,componentTitle,assignment }) => {
    return <div className={styles.classSummaryCard}>
        <h4 className={`${styles.boldHeading} ${styles.mb16}`}>{componentTitle} <span className={styles.evaluationCount}>({renderEvaluationCount(evaluationType, assignmentData, component)})</span></h4>
        <div className={styles.title}> {title}</div>
        <div className={styles.plainCardStatsContainer}>
            <div className={styles.statistic}>
                <div className={styles.totalSubStatsContainer}>
                    <div className={styles.noOfSubText}>{noOfSubmissions}<p>/{get(classSummaryDropdownValue, 'totalStudents')}</p></div>
                    <span className={styles.submissionPercentage} style={{ color: getColorBasedOnPercentage(submittedPercentage) }}>({submittedPercentage}%)</span>
                </div>
                <span>Total Submissions</span>
            </div>
            {!isFetchingEvaluationData ? (
                <div className={styles.statistic}>
                    <p>{getAvgScore(evaluationType, assignmentData, get(component, 'blockBasedProject.id'))}%</p>
                    <span>Avg.Score</span>
                </div>
            ) : null}
        </div>
        <div>
            <Button
                onBtnClick={()=>setEvaluationModalDetails({ isOpen: true, evaluationType, currentPracticeQuestion: get(component, 'blockBasedProject.id') })}
                btnPadding={`${hsFor1280(12.5)}`}
                type='secondary'
                text={renderText(isFetchingEvaluationData)}
                widthFull
                isDisabled={isEvaluationButtonDisabled(evaluationType, assignmentData, component)}
            />
        </div>
    </div>
}

const renderText = (isFetchingEvaluationData) => {
    return isFetchingEvaluationData ? (
        <LoadingSpinner
            height='18px'
            width='18px'
            position='relative'
        >
        </LoadingSpinner>
    ) : 'Evalute Submissions'
}

const isEvaluationButtonDisabled = (evaluationType, assignmentData, component) => {
    if (evaluationType === evaluationTypes.CODING_ASSIGNMENT) {
        return !get(assignmentData, 'userAssignment.classWorkQuestions', []).length
    } else if (evaluationType === evaluationTypes.HW_ASSIGNMENT) {
        return !get(assignmentData, 'userAssignment.homeWorkQuestions', []).length
    } else if (evaluationType === evaluationTypes.PRACTICE) {
        const classWorkQuestions = get(assignmentData, 'blockBasedPracitce.classWorkPractices', [])
        const filteredClassworkPractice = classWorkQuestions && classWorkQuestions.filter(item => get(item, 'blockBasedPractice.id') === get(component, 'blockBasedProject.id'))
        return !filteredClassworkPractice.length
    } else if (evaluationType === evaluationTypes.HW_PRACTICE) {
        const homeWorkQuestions = get(assignmentData, 'blockBasedPracitce.homeWorkPractices', [])
        const filteredHomeworkPractice = homeWorkQuestions && homeWorkQuestions.filter(item => get(item, 'blockBasedPractice.id') === get(component, 'blockBasedProject.id'))
        return !filteredHomeworkPractice.length
    }
}

const renderEvaluationCount = (evaluationType, assignmentData, component) => {
    let evaluated = 0
    let numberOfAssignments = 0
    if (evaluationType === evaluationTypes.CODING_ASSIGNMENT) {
        const classWorkQuestions = get(assignmentData, 'userAssignment.classWorkQuestions', [])
        classWorkQuestions && classWorkQuestions.forEach(question => {
            const assignmentQuestion = get(question, 'assignment', [])
            numberOfAssignments += assignmentQuestion.length
            assignmentQuestion.forEach(item => {
                if (get(item, 'evaluation', null)) {
                    evaluated += 1
                }
            })
        })
    } else if (evaluationType === evaluationTypes.HW_ASSIGNMENT) {
        const homeWorkQuestions = get(assignmentData, 'userAssignment.homeWorkQuestions', [])
        homeWorkQuestions && homeWorkQuestions.forEach(question => {
            const assignmentQuestion = get(question, 'assignment', [])
            numberOfAssignments += assignmentQuestion.length
            assignmentQuestion.forEach(item => {
                if (get(item, 'evaluation', null)) {
                    evaluated += 1
                }
            })
        })
    } else if (evaluationType === evaluationTypes.PRACTICE) {
        const classWorkQuestions = get(assignmentData, 'blockBasedPracitce.classWorkPractices', [])
        classWorkQuestions && classWorkQuestions.forEach(question => {
            if (get(question, 'blockBasedPractice.id') === get(component, 'blockBasedProject.id')) {
                numberOfAssignments += 1
                if (get(question, 'evaluation', null)) {
                    evaluated += 1
                }
            }
        })
    } else if (evaluationType === evaluationTypes.HW_PRACTICE) {
        const homeWorkQuestions = get(assignmentData, 'blockBasedPracitce.homeWorkPractices', [])
        homeWorkQuestions && homeWorkQuestions.forEach(question => {
            if (get(question, 'blockBasedPractice.id') === get(component, 'blockBasedProject.id')) {
                numberOfAssignments += 1
                if (get(question, 'evaluation', null)) {
                    evaluated += 1
                }
            }
        })
    }
    return `${evaluated}/${numberOfAssignments} answers evaluated`
}

const getFirstNextSession = nextSessions => {
    if (nextSessions && nextSessions.length) {
        return nextSessions.find(session => get(session, 'classType') === 'lab')
    }
    return {}
}

const ClassroomDetails = (props) => {
    const [classSummaryDropdownValue, setClassSummaryDropdownValue] = useState({})
    const [mostRecentCompletedTopic, setMostRecentCompletedTopic] = useState({})
    const [detailsOfSelectedTopic, setDetailsOfSelectedTopic] = useState({})
    const [nextSessionsCounter, setNextSessionsCounter] = useState(1)
    const [shouldAutoScroll,setShouldAutoScroll]=useState(true)
    const [batchDataCoursePackage,setBatchDataCoursePackage]=useState(null)
    const [evaluationModalDetails,setEvaluationModalDetails]=useState({isOpen:false,evaluationType:evaluationTypes.CODING_ASSIGNMENT})
    const [assignmentData, setAssignmentData]=useState({})
    const [isFetchingEvaluationData, setIsFetchingEvaluationData]=useState(false)

    // const [isFetchingEvaluationData, setIsFetchingEvaluationData]=useState(false)
    

    const scrollableContainerRef = useRef()
    const nextSessionsScrollableContainerRef = useRef()
    const params = useParams()
    const { batchId } = params
    const isBatchDetailsFetchStatusLoading = props.batchDetailsFetchStatus && get(props.batchDetailsFetchStatus.toJS(), 'loading')
    const isBatchDetailsFetchStatusSuccess = props.batchDetailsFetchStatus && get(props.batchDetailsFetchStatus, 'success')
    const isClassworkSummaryReportLoading = props.classworkSummaryReportFetchStatus && get(props.classworkSummaryReportFetchStatus.toJS(), 'loading')
    const isClassworkSummaryReportSuccess = props.classworkSummaryReportFetchStatus && get(props.classworkSummaryReportFetchStatus.toJS(), 'success')
    const isClassworkSummaryReportFailure = props.classworkSummaryReportFetchStatus && get(props.classworkSummaryReportFetchStatus.toJS(), 'failure')
    const isHomeworkSummaryReportLoading = props.homeworkSummaryReportFetchStatus && get(props.homeworkSummaryReportFetchStatus.toJS(), 'loading')
    const isBlockBasedSummaryReportLoading = props.blockBasedSummaryReportFetchStatus && get(props.blockBasedSummaryReportFetchStatus.toJS(), 'loading')
    const isclassNextSessionLoading = props.classNextSessionFetchStatus && get(props.classNextSessionFetchStatus.toJS(), 'loading')
    let classNextSessionData = props.classNextSession ? props.classNextSession : List([])
    let modifiedBatchDetailsData = modifiedBatchDetails(props.batchDetails && props.batchDetails.toJS(),batchDataCoursePackage)
    const modifiedNextSessionsData = modifiedNextSessionsDetails(get(classNextSessionData.toJS()[0], 'sessions', []))
    const batchDetailsData = props.batchDetails && props.batchDetails.toJS()
    const classNextSessionsData = props.classNextSession && props.classNextSession.toJS()
    const homeworkSummaryReportData = props.homeworkSummaryReport && props.homeworkSummaryReport.toJS()
    const classworkSummaryReportData = props.classworkSummaryReport && props.classworkSummaryReport.toJS()
    const blockBasedSummaryReportData = props.blockBasedSummaryReport && props.blockBasedSummaryReport.toJS()
    const totalSessions = batchDetailsData.length + get(classNextSessionsData[0], 'sessions', []).length
    const firstNextSession = getFirstNextSession(get(classNextSessionsData[0], 'sessions', []))

    const navButton = (action) => {
        const sliderHolder = nextSessionsScrollableContainerRef.current
        const eventCards = totalSessions
        let direction = 0
        if (action === 'left') {
            direction = -1
            if (nextSessionsCounter > 1) {
                setNextSessionsCounter(prev => prev - 1)
            }
            if (nextSessionsCounter === 1) {
                sliderHolder.scrollTo({ left: 0, behavior: 'smooth' })
                return
            }
        } else {
            direction = 1
            if (nextSessionsCounter < eventCards) {
                setNextSessionsCounter(prev => prev + 1)
            }
        }

        if (eventCards) {
            let far = sliderHolder.clientWidth / 3 * direction;
            let pos = sliderHolder.scrollLeft + far;
            if(shouldAutoScroll){
                const firstNextSessionElementId = document.querySelector(`#${get(firstNextSession,'id')}`)
                if(firstNextSessionElementId){
                    let distanceFromLeft= firstNextSessionElementId.offsetLeft
                    sliderHolder.scrollTo({ left: distanceFromLeft, behavior: 'smooth' })
                }
            }
            if(shouldAutoScroll===false){
                sliderHolder.scrollTo({ left: pos, behavior: 'smooth' })
            }
        }
    }

    useEffect(() => {
         let { loggedInUser } = props
         loggedInUser = loggedInUser && loggedInUser.toJS();
        (async function () {
            try {
                fetchBatchDetails(batchId)
                fetchTeacherBatches({}, loggedInUser)           
                // fetchPreviousClassromDetails(batchId, moment().subtract(1, 'days').format(), 'next', 10)
                if (batchId) {
                    const divId = get(loggedInUser, 'divid');
                    const academicYearId = get(loggedInUser, 'academicyear.id')
                    const headers = header(loggedInUser)
                    const res = await requestToGraphql(`https://api-stage.uolo.co/core/tekie/get-batch-course-mappings?divId=${divId}&academicYearId=${academicYearId}&groupId=${batchId}`, {
			        tokenType: "appTokenOnly",
			        rest: true,
                    method: "get",
                    headers,
			        apiType: 'batch',
                    })
                    if (res.data) {
                     setBatchDataCoursePackage(res.data.batch)
                   }
                }
            } catch (err) {
                console.log(err)
            }
        })()
    }, [batchId])
    
    useEffect(() => {
        if (modifiedBatchDetailsData.length) {
            setClassSummaryDropdownValue(modifiedBatchDetailsData[0])
            setMostRecentCompletedTopic(modifiedBatchDetailsData[0])
            if (get(modifiedBatchDetailsData[0], 'value') === get(classSummaryDropdownValue, 'value')) {
                fetchClassRoomDetailsAndEvaluation()
            }
        }
    }, [modifiedBatchDetailsData.length, batchDataCoursePackage])

    useEffect(() => {
        fetchClassRoomDetailsAndEvaluation()
    }, [classSummaryDropdownValue.value])

    const fetchClassRoomDetailsAndEvaluation = async() => {
        const detailsOfSelectedTopicData = getDetailsOfSelectedTopic(classSummaryDropdownValue.value, batchDetailsData)
        setDetailsOfSelectedTopic(detailsOfSelectedTopicData);
        (async function () {
            if (batchId && get(classSummaryDropdownValue, 'value')) {
                const res = await Promise.allSettled([getClassworkSummary(batchId, get(classSummaryDropdownValue, 'value'), true), getHomeworkSummary({ batchId, topicId: get(classSummaryDropdownValue, 'value'), isHomework: false, fromClassroomDetail: true }), getHomeworkSummary({ batchId, topicId: get(classSummaryDropdownValue, 'value'), isHomework: true, fromClassroomDetail: true })])
                const students = get(detailsOfSelectedTopicData, 'attendance', [])
                const userIds = students && students.map(item => get(item, 'student.user.id'))
                setIsFetchingEvaluationData(true)
                fetchEvaluationData(userIds, get(classSummaryDropdownValue, 'value'), get(classSummaryDropdownValue, 'courseId'))
                setIsFetchingEvaluationData(false)
            }
        })()
    }

    useEffect(() => {
        if (props.evaluationDataFetchStatus && get(props.evaluationDataFetchStatus.toJS(), 'loading')) {
            setIsFetchingEvaluationData(true)
        } else {
            if (props.evaluationDataFetchStatus && get(props.evaluationDataFetchStatus.toJS(), 'success')) {
                setEvaluationDataFromProps()
            }
            setIsFetchingEvaluationData(false)
        }
    }, [props.evaluationDataFetchStatus, props.evaluationData])

    const setEvaluationDataFromProps = () => {
        const evaluationDataFromProps = props.evaluationData && props.evaluationData.toJS()
        const evaluationDataFromPropsTemp = {...evaluationDataFromProps}
        const blockBasedPracticeComponent = getAllBlockBasedPracticeComponents(detailsOfSelectedTopic)
        const getsortedEvaluationDataTemp = getsortedEvaluationData(evaluationDataFromProps, blockBasedPracticeComponent)
        evaluationDataFromPropsTemp.blockBasedPracitce = getsortedEvaluationDataTemp
        setAssignmentData(evaluationDataFromPropsTemp)
    }

    const isPageLoading = () => {
        return isBatchDetailsFetchStatusLoading
    }
    useEffect(() => {
        if (isPageLoading()) {
            const mybdy = document.querySelector('.splitScreen-main-component')
            mybdy.onscroll = () => { window.scroll(0, 0); };
        }
    }, [])

    useEffect(()=>{
        if(nextSessionsScrollableContainerRef.current && shouldAutoScroll){
            setShouldAutoScroll(false)
            navButton('right')
            setNextSessionsCounter(prev => prev +1)
        }
    },[totalSessions])
console.log(modifiedBatchDetailsData, 'modified')
    const absentStudents = (attendance) => attendance.filter(item => !get(item, 'isPresent'))

    const attendanceTooltip = (data) => (
        <StudentListTooltip
            heading='Absent Students'
            list={absentStudents(get(data, 'attendance', []))}
        />
    )
    
    const getTime = (dateObj) => {
        return moment(dateObj).format('LT')
    }

    const getDate = (dateObj) => {
        return moment(dateObj).format('llll').split(',').slice(0, 2).join(',')
    }

    const getSessionDate = (dateObj) => {
        const dateObjArr = moment(dateObj).format('llll').split(',')
        return dateObjArr && dateObjArr.length > 1 ? dateObjArr[1] : null
    }

    const getTimeAtHeading = () => {
        const sessionStartDate = get(classSummaryDropdownValue, 'sessionStartDate')
        const sessionEndDate = get(classSummaryDropdownValue, 'sessionEndDate')
        const sessionStartDay = getDate(sessionStartDate)
        const sessionEndDay = getDate(sessionEndDate)
        const sessionStartTime= getTime(sessionStartDate, '', '')
        const sessionEndTime = getTime(sessionEndDate, '', '')
        const sessionStartDayDate = getSessionDate(sessionStartDate)
        const sessionEndDayDate = getSessionDate(sessionEndDate)
        if (get(classSummaryDropdownValue, 'sessionStatus') === 'started') {
            return <span>{sessionStartDay}<span className={styles.timeDaySeparator}></span>{sessionStartTime}</span>
        }
        return sessionStartDay === sessionEndDay ? <span>{sessionStartDay}<span className={styles.timeDaySeparator}></span>{sessionStartTime} - {sessionEndTime}</span> : <span>{sessionStartDayDate} - {sessionEndDayDate}</span>
    }

    return isPageLoading() ? <div className={styles.timetableCalendarLoaderBackdrop}>
        <LoadingSpinner
            height='40vh'
            position='absolute'
            left='50%'
            top='50%'
            transform='translate(-50%,-50%)'
            borderWidth='6px'
            showLottie
            flexDirection={'column'}
        >
            <span className='timetable-loading-text'>Loading Details</span>
        </LoadingSpinner>
        {(!isclassNextSessionLoading && !isHomeworkSummaryReportLoading && !isClassworkSummaryReportLoading) ? <span className='classroom-reports-page-mixpanel-identifier' /> : null}
    </div> : <div className={styles.pageContainer} id='classroomDetails-container'>
        <ClassroomDetailsHeader loggedInUser={props.loggedInUser && props.loggedInUser.toJS()} fetchedClassrooms={props.teacherBatchesData && get(props.teacherBatchesData.toJS(), '[0].groups', [])} batchId={batchId} fromReportsPage />

        {<div className={styles.classSummaryContainer}>
            <div className={styles.summaryTitleContainer}>
                <h3 className={styles.classSummaryHeading}>Class Summary</h3>
            </div>
            <div className={styles.summaryHeader}>
                <div className={styles.summarySelectAttendenceContainer}>
                    {modifiedBatchDetailsData && modifiedBatchDetailsData.length !== 0 && <div className={styles.completedTopicsDropdown}>
                        <Select
                            components={{ IndicatorSeparator: () => null }}
                            value={classSummaryDropdownValue}
                            controlShouldRenderValue={true}
                            isDisabled={props.batchDetails && !props.batchDetails.toJS().length}
                            placeholder='Select Sessions'
                            className='classHome-select'
                            classNamePrefix='classHome-select'
                            isSearchable={false}
                            styles={newStyles}
                            options={modifiedBatchDetailsData.length ? modifiedBatchDetailsData : []}
                            onChange={(topic, action) => {
                                setClassSummaryDropdownValue(topic)
                            }}
                            formatOptionLabel={(option) => {
                                return (
                                        <div className={styles.selectOption}>
                                            <div className={styles.selectOptionLabel}>
                                            <StatusTag
                                                    type={get(option, 'sessionStatus')}>
                                                 </StatusTag>
                                                <span className={styles.selectOptionLabelName}>{get(option, 'label')}</span>
                                            </div>
                                            </div>
                                )
                            }}
                                                
                        />
                    </div>}
                    {(props.batchDetails && props.batchDetails.toJS().length !== 0) && <div className={styles.attendanceContainer}>
                        <p className={styles.attendance}>attendance</p>
                        <div className={styles.attendanceTooltipContainer}>
                            <span className={styles.attendanceCount}>{get(classSummaryDropdownValue, 'attendance', '-')}<span style={{ color: '#A8A7A7' }}>/{get(classSummaryDropdownValue, 'totalStudents', '-')}</span></span>
                            {get(classSummaryDropdownValue, 'totalStudents', 0) - get(classSummaryDropdownValue, 'attendance', 0) ? (
                                <UpdatedToolTip
                                    tipColor={"#4A336C"}
                                    delay={'200'}
                                    hideDelay={'800'}
                                    direction="bottomLeft"
                                    content={attendanceTooltip(detailsOfSelectedTopic)}
                                >
                                    <InformationCircle />
                                </UpdatedToolTip>
                            ) : null}
                        </div>
                    </div>}
                    <div className={styles.attendanceContainer} style={{ alignItems: 'flex-start' }}>
                        <p className={styles.attendance}>{get(classSummaryDropdownValue, 'sessionStatus') === 'started' ? 'STARTED ' : 'COMPLETED '}ON</p>
                        <p className={styles.summarySelectAttendenceContainerDate}>{getTimeAtHeading()}</p>
                    </div>
                </div>
                {(props.batchDetails && props.batchDetails.toJS().length !== 0) && (sessionStartedOrCompleted.includes(get(detailsOfSelectedTopic, 'sessionStatus')) && getBatchStrength(get(detailsOfSelectedTopic, 'attendance')) > 0) ? <Link className={styles.linkReset} to={`/teacher/reports/classroom/${get(detailsOfSelectedTopic, 'id')}/question-level?fromClassroomDetails=true`}> <button className={`${styles.primaryBtn}`}>View Detailed Report</button></Link> : <button className={`${getBatchStrength(get(detailsOfSelectedTopic, 'attendance')) === 0 || get(detailsOfSelectedTopic, 'sessionStatus') !== 'completed' ? styles.isDisabled : ''} ${styles.primaryBtn}`}>View Detailed Report</button>}
            </div>
            {(modifiedBatchDetailsData && modifiedBatchDetailsData.length !== 0 && isClassworkComponentPresent(detailsOfSelectedTopic)) ?
             <div>
                {
                    <ReportStatsComponent
                        title='Classwork Report'
                        percentage={calculateClassworkTotalSubmission(classworkSummaryReportData, blockBasedSummaryReportData)}
                    />
                }
                {
                    (isClassworkSummaryReportLoading) && <div style={{position: 'relative', height: '150px' }}>
                        <LoadingSpinner
                            height='40vh'
                            position='absolute'
                            left='50%'
                            top='57%'
                            transform='translate(-50%,-50%)'
                            borderWidth='6px'
                            showLottie
                            flexDirection={'column'}
                        >
                            <span className='timetable-loading-text'></span>
                        </LoadingSpinner>
                    </div>
                }
                {(isClassworkComponentPresent(detailsOfSelectedTopic) && !isClassworkSummaryReportLoading) ?
                 <div ref={scrollableContainerRef} className={styles.classworkCardsContainer}>
                    {get(classworkSummaryReportData, 'practiceQuestionOverallReport') && classworkSummaryReportData.practiceQuestionOverallReport.length !== 0 && classworkSummaryReportData.practiceQuestionOverallReport.map(LoComponent => <BarCard key={LoComponent.loId} data={getClassworkReport(LoComponent)} classSummaryDropdownValue={classSummaryDropdownValue} />)}

                    {codingAssignments(get(detailsOfSelectedTopic, 'topicData.topicComponentRule')).length !== 0 && codingAssignments(get(detailsOfSelectedTopic, 'topicData.topicComponentRule')).map(assignment => {
                        return (
                            <>
                                <PlainCard assignmentData={assignmentData} isFetchingEvaluationData={isFetchingEvaluationData} setEvaluationModalDetails={setEvaluationModalDetails} type='homework' evaluationType={evaluationTypes.CODING_ASSIGNMENT} submittedPercentage={get(blockBasedSummaryReportData, 'coding.submittedPercentage')} noOfSubmissions={get(blockBasedSummaryReportData, 'coding.submissions', []).length} assignment={assignment} componentTitle={"Assignment Report"}  classSummaryDropdownValue={classSummaryDropdownValue}/>
                            </>
                        )
                    })}

                    {getBlockBasedPracticeComponents(detailsOfSelectedTopic).map(component => <PlainCard assignmentData={assignmentData} isFetchingEvaluationData={isFetchingEvaluationData} evaluateBlockBasedPracticeComponent setEvaluationModalDetails={setEvaluationModalDetails} type='homework' submittedPercentage={getBlockBasedPracticePercentage(get(detailsOfSelectedTopic, 'topicData.topicComponentRule'), blockBasedSummaryReportData,get(component,'blockBasedProject.id'))} noOfSubmissions={getBlockBasedPracticeSubmissionCount(get(detailsOfSelectedTopic, 'topicData.topicComponentRule'), blockBasedSummaryReportData,get(component,'blockBasedProject.id'))} componentTitle={"Practice Report"} title={getProjectTitle(component)} logo={getProjectLogo(component)} evaluationType={evaluationTypes.PRACTICE} component={component} classSummaryDropdownValue={classSummaryDropdownValue} />)}

                </div>:(!isClassworkSummaryReportLoading?<NoSessionsEmptyState text={'No classwork present.'} />:null)}
                {/* {isNosOfCardsGreaterThan(3, scrollableContainerRef) && <div className={styles.scrollBtnsContainer}><button className={styles.customCarouselBtn} onClick={() => scrollCarousel('left')}><ChevronLeft color='white' height={'35'} width={'35'} /></button><button className={styles.customCarouselBtn} onClick={() => scrollCarousel('right')}><ChevronRight color='white' height={'35'} width={'35'} /></button></div>} */}
                {isHomeworkComponentPresent(detailsOfSelectedTopic) && <div>
                    {(isHomeworkQuizPresent(detailsOfSelectedTopic) || isHomeworkAssignmentPresent(detailsOfSelectedTopic) || isHomeworkPracticePresent(detailsOfSelectedTopic)) && (
                        <ReportStatsComponent
                            title='Homework Report'
                            percentage={calculateHomeworkTotalSubmission(homeworkSummaryReportData)}
                        />
                    )}
                    {
                        (isHomeworkSummaryReportLoading) && <div style={{ position: 'relative', height: '150px' }}>
                            <LoadingSpinner
                                height='40vh'
                                position='absolute'
                                left='50%'
                                top='57%'
                                transform='translate(-50%,-50%)'
                                borderWidth='6px'
                                showLottie
                                flexDirection={'column'}
                            >
                                <span className='timetable-loading-text'></span>
                            </LoadingSpinner>
                        </div>
                    }

                    {!isHomeworkSummaryReportLoading && <div className={styles.homeworkCardsContainer}>
                        {isHomeworkQuizPresent(detailsOfSelectedTopic) && <BarCard forQuiz data={{ avgCorrect: get(homeworkSummaryReportData, 'quiz.averageCorrect'), avgIncorrect: get(homeworkSummaryReportData, 'quiz.averageIncorrect'), totalQuestions: get(homeworkSummaryReportData, 'quiz.totalQuestions'), submittedPercentage: get(homeworkSummaryReportData, 'quiz.submittedPercentage'), averageScore: get(homeworkSummaryReportData, 'quiz.averageScore'), unAttempted: get(homeworkSummaryReportData, 'quiz.unattemptedPercentage'), type: 'homework', submissionCount: get(homeworkSummaryReportData, 'quiz.submissions', []).length, questionCount: get(homeworkSummaryReportData, 'quiz.questions', []).length }} classSummaryDropdownValue={classSummaryDropdownValue} />}

                        {isHomeworkAssignmentPresent(detailsOfSelectedTopic) && <PlainCard componentName={"Homework Report"} assignmentData={assignmentData} isFetchingEvaluationData={isFetchingEvaluationData} evaluationType={evaluationTypes.HW_ASSIGNMENT} setEvaluationModalDetails={setEvaluationModalDetails} type='homeworkCard' submittedPercentage={get(homeworkSummaryReportData, 'coding.submittedPercentage')} noOfSubmissions={get(homeworkSummaryReportData, 'coding.submissions', []).length} classSummaryDropdownValue={classSummaryDropdownValue} />}

                        {isHomeworkPracticePresent(detailsOfSelectedTopic) && getBlockBasedHomeworkPracticeComponents(detailsOfSelectedTopic).map(component => <PlainCard assignmentData={assignmentData} isFetchingEvaluationData={isFetchingEvaluationData} evaluationType={evaluationTypes.HW_PRACTICE} evaluateHomeworkPractice setEvaluationModalDetails={setEvaluationModalDetails} type='homeworkCard' title={getProjectTitle(component)} submittedPercentage={getHomeworkPracticePercentage(get(detailsOfSelectedTopic, 'topicData.topicComponentRule'), homeworkSummaryReportData, get(isHomeworkPracticePresent(detailsOfSelectedTopic),'blockBasedProject.id'))} noOfSubmissions={getBlockBasedPracticeSubmissionCount(get(detailsOfSelectedTopic, 'topicData.topicComponentRule'), blockBasedSummaryReportData,get(component,'blockBasedProject.id'))} component={component} classSummaryDropdownValue={classSummaryDropdownValue} />)}
                        {/* {isHomeworkPracticePresent(detailsOfSelectedTopic) && <PlainCard type='homeworkCard' submittedPercentage={get(homeworkSummaryReportData, 'blockBasedPractice.submittedPercentage')} />} */}
                    </div>}
                </div>}
            </div> :
                <NoSessionsEmptyState hasClassworkSummaryReportLoaded={(isClassworkSummaryReportSuccess ||isClassworkSummaryReportFailure|| !modifiedBatchDetailsData.length) && !isClassworkComponentPresent(detailsOfSelectedTopic)} text={'Uh-oh. Looks like you haven’t taken any classes yet.'} />
            }
        </div>}
        {( get(classNextSessionsData[0], 'sessions', []).length !== 0) 
            ?
            <div className={styles.upcomingTopicsContainer}>
                <UpcomingTopicsContainer
                    completedSessions={batchDetailsData}
                    scrollRef={nextSessionsScrollableContainerRef}
                    upcomingSessions={get(classNextSessionsData[0], 'sessions', [])}
                    redirectionIds={{ batchId }}
                />
                {/* {totalSessions > 3 && <div className={styles.scrollBtnsContainer}><button className={styles.customCarouselBtn} onClick={() =>navButton('left')}><ChevronLeft color='white' height={'35'} width={'35'} /></button><button className={styles.customCarouselBtn} onClick={() => navButton('right')}><ChevronRight color='white' height={'35'} width={'35'} /></button></div>} */}
            </div> : isclassNextSessionLoading ?
            <div style={{ position: 'relative', height: '150px' }}>
            <LoadingSpinner
                height='40vh'
                position='absolute'
                left='50%'
                top='57%'
                transform='translate(-50%,-50%)'
                borderWidth='6px'
                showLottie
                flexDirection={'column'}
            >
                <span className='timetable-loading-text'></span>
            </LoadingSpinner>
        </div>:null}
            {get(evaluationModalDetails, 'isOpen') && <EvaluationContextProvider>
                <EvaluationModal evaluationModalDetails={evaluationModalDetails} setEvaluationModalDetails={setEvaluationModalDetails} topicDetails={{ title: get(classSummaryDropdownValue, 'label'), topicId: get(classSummaryDropdownValue, 'value') }} students={get(detailsOfSelectedTopic, 'attendance', [])} courseId={get(classSummaryDropdownValue, 'courseId')} assignmentData={assignmentData} />
            </EvaluationContextProvider>}
    </div>
}

export default ClassroomDetails