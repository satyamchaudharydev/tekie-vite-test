import React from 'react'
import { AbsentUserBlock, CodeOutlineIcon, HomeOutlineIcon, InformationCircle, Monitor, PuzzleIcon, TargetIcon } from '../../../../../../../constants/icons'
import styles from '../SessionModal.module.scss'
import { ClockSvg, StudentsSvg, TypeSvg, HomeworkSvg } from '../../../../../components/svg'
import { getDuration } from '../../../../../../../utils/getDuration'
import { get } from 'lodash'
import ContentLoader from 'react-content-loader'
import UpdatedToolTip from '../../../../../../../components/UpdatedToolTip/UpdatedToolTip'
import StudentListTooltip from '../../../../../components/StudentListTooltip/StudentListTooltip'
const TOTAL_STUDENTS = 'Total Students'
const PREV_HW_DONE = 'Prev. HW Done'
const ATTENDANCE = 'Attendance'
const DURATION = 'Duration'
const SESSION_TYPE = 'Session Type'
const PREVIOUS_TOPIC = 'Previous Topic'
const RECORDING = 'Recording'
const QUIZ_SUBMISSIONS = 'CW Submissions'
const PQ_SUBMISSIONS = 'CW Submissions'
const AVG_QUIZ_TRIES = 'Avg. Quiz Tries'
const CODING_SCORE = 'Coding Score'
const HW_SUBMISSIONS = 'HW Submissions'
const PREV_HW_SUBMISSIONS = 'Prev. HW Submissions'
const HW_QUIZ_SCORE = 'Homework Quiz Score'
const PREV_HW_QUIZ_SUBMISSION = 'Prev. HW Quiz Submission'
const HW_CODE_SCORE = 'HW Code Score'
const JOINED_STUDENTS = 'Joined Students'


const calculatePercentage = (num1, num2) => {
    const percentage = num1 * 100 / num2
    if (isNaN(percentage)) return '0'
    return `${Math.round(percentage)}`
}

const checkIfHomeworkExists = (topicComponentRule) => {
    return topicComponentRule && topicComponentRule.filter(item => get(item, 'componentName') === 'homeworkAssignment' || get(item, 'componentName') === 'homeworkPractice' || get(item, 'componentName') === 'quiz').length
}

const getSessionInfo = (data, otp) => {

    if (data.sessionType === 'unAttended') return [{ label: PREV_HW_DONE, icon: <Monitor /> }]
    if (data.sessionType === 'completed') {
        if (otp) {
            const dataPoints = []
            if (checkIfHomeworkExists(get(data, 'previousTopicDetails.topicComponentRule'))) {
                dataPoints.push({ label: PREV_HW_SUBMISSIONS })
            }
            return dataPoints
        }
        if (data.homeworkSubmissions.isPQComponentExists) {
            const dataPoints = [{ label: ATTENDANCE, icon: <Monitor /> }, { label: DURATION, icon: <Monitor /> }, { label: PQ_SUBMISSIONS }]
            if (checkIfHomeworkExists(get(data, 'topicComponentRule'))) {
                dataPoints.push({ label: HW_SUBMISSIONS })
            }
            if(get(data, 'classType') !== 'theory') return dataPoints
            dataPoints.splice(1, 1)
            return dataPoints

        }
        const dataPoints = [{ label: ATTENDANCE, icon: <Monitor /> }]
        if (get(data, 'classType') !== 'theory') {
            dataPoints.push({ label: DURATION, icon: <Monitor /> })
        }
        if (checkIfHomeworkExists(get(data, 'topicComponentRule'))) {
            dataPoints.push({ label: HW_SUBMISSIONS })
        }
        return dataPoints

    }
    if (data.sessionType === 'inProgress') {
        if (data.homeworkSubmissions.isPQComponentExists) {
            const dataPoints = [{ label: ATTENDANCE, icon: <Monitor /> }, { label: QUIZ_SUBMISSIONS }]
            if (checkIfHomeworkExists(get(data, 'topicComponentRule'))) {
                dataPoints.push({ label: HW_SUBMISSIONS })
            }
            if(get(data, 'classType') !== 'theory') return dataPoints
            dataPoints.splice(1, 1)
            return dataPoints
            
        }
        const dataPoints = [{ label: ATTENDANCE, icon: <Monitor /> }]
        if (checkIfHomeworkExists(get(data, 'topicComponentRule'))) {
            dataPoints.push({ label: HW_SUBMISSIONS })
        }
        return dataPoints
    }
    if (data.sessionType === 'yetToBegin') {
        if (data.isCurrentTimeBetweenSessionStartAndEndTime) {
            const dataPoints = []
            if (checkIfHomeworkExists(get(data, 'previousTopicDetails.topicComponentRule'))) {
                dataPoints.push({ label: PREV_HW_SUBMISSIONS })
            }
            return dataPoints
        } else {
            if (checkIfHomeworkExists(get(data, 'previousTopicDetails.topicComponentRule'))) {
                return [{ label: PREV_HW_SUBMISSIONS }, { label: PREV_HW_QUIZ_SUBMISSION }]
            }
        }
    }
}

const Item = ({ currentClassroomMetaLoading, previousSessionTopicDataLoading, classroomNextSessionsLoading, label, icon, data, otp }) => {
    const getSessionType = (data) => {
        if (data) {
            return <span className={`${styles.sessionTypePill}`}>{data.charAt(0).toUpperCase() + data.slice(1)}</span>
        }
        return ''
    }
    
    const returnColorBasedOnPercentage = (num) => {
        if (num >= 75) {
            return '#01AA93'
        } else if (num >= 40) {
            return '#FAAD14'
        } else {
            return '#D34B57'
        }
    }
    
    const getColorBasedOnPercentage = (data) => {
        const presentStudents = get(data, 'presentStudents')
        const totalStudents = get(data, 'totalStudents')
        const result = (presentStudents / totalStudents) * 100
        return returnColorBasedOnPercentage(result)
    }

    const presentStudents = (attendance) => attendance.filter(item => get(item, 'isPresent'))
    const absentStudents = (attendance) => attendance.filter(item => !get(item, 'isPresent'))

    const getHomeworkFilterList = (list, key) => {
        const filteredData = list && list.filter(item => item[key] === false)
        return filteredData
    }

    const attendanceTooltip = ({ data, joined=false, key }) => {
        let studentsList = []
        if (key) {
            studentsList = getHomeworkFilterList(get(data, 'completedUserAssignmentData'), key)
        } else {
            if (joined) {
                studentsList = absentStudents(get(data, 'liveAttendance', []))
            } else {
                if (data.sessionType === 'completed') {
                    studentsList = absentStudents(get(data, 'attendance', []))
                } else {
                    studentsList = absentStudents(get(data, 'liveAttendance', []))
                }
            }
        }
        return (
            <StudentListTooltip
                heading={key ? 'Not Submitted' : joined ? 'Students Yet to Join' : 'Absent Students'}
                list={studentsList}
                assignmentKey={key}
            />
        )
    }

    const getAttendenceCount = (data) => {
        const { attendance=[] } = data
        const totalStudents = attendance.length
        const presentStudents = attendance.filter(item => get(item, 'isPresent')).length
        return {
            totalStudents,
            presentStudents
        }
    }

    const getItemData = (label, data, otp) => {
        switch (label) {
            case TOTAL_STUDENTS: {
                return get(data, 'totalStudents') || 0
            }
            case PREV_HW_DONE: {
                if (classroomNextSessionsLoading) {
                    return <ContentLoader
                        className={styles.progressSkeleton}
                        speed={1}
                        backgroundColor={'#f5f5f5'}
                        foregroundColor={'#dbdbdb'}
                        viewBox="0 0 30 8"
                    >
                        <rect x="0" y="0" width="30px" height="8px" />
                    </ContentLoader>
                }
                return (
                    <span style={{ color: '#9E9E9E' }}>
                        <span style={{ color: returnColorBasedOnPercentage(( get(data, 'homeworkSubmissions.hwSubmissions')/get(data, 'totalStudents')) * 100 ) }}>
                            {data.homeworkSubmissions.hwSubmissions}
                        </span> / {get(data, 'totalStudents') || 0}
                    </span>
                )
            }
            case ATTENDANCE: {
                let presentStudentCount
                let totalStudentsCount
                if (data.sessionType === 'completed') {
                    const { totalStudents, presentStudents: presentStudentsCountValue } = getAttendenceCount(data)
                    presentStudentCount = presentStudentsCountValue
                    totalStudentsCount = totalStudents
                } else {
                    presentStudentCount = get(data, 'presentStudents')
                    totalStudentsCount = get(data, 'totalStudents')
                }
                if (data.sessionType === 'completed' || data.sessionType === 'inProgress') {
                    return data.sessionType === 'yetToBegin' || (data.sessionType === 'completed' && otp) ? '-' : (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span
                                style={{ color: '#9E9E9E', marginRight: '8px' }}
                                className={styles.moreDetailsItemData}
                            >
                                <span
                                    style={{ color: returnColorBasedOnPercentage((presentStudentCount/totalStudentsCount)*100) }}
                                >
                                    {presentStudentCount}
                                </span> / {totalStudentsCount || 0}
                            </span>
                            {(totalStudentsCount - presentStudentCount) ? (
                                <UpdatedToolTip
                                    tipColor={"#4A336C"}
                                    delay={'200'}
                                    hideDelay={'800'}
                                    content={attendanceTooltip({ data })}
                                >
                                    <InformationCircle />
                                </UpdatedToolTip>
                            ) : null}
                        </div>
                    )
                }
                return data.sessionType === 'yetToBegin' || (data.sessionType === 'completed' && otp) ? '-' : <span style={{ color: '#9E9E9E' }}><span style={{ color: returnColorBasedOnPercentage(( presentStudentCount/totalStudentsCount) * 100 ) }}>{presentStudentCount}</span> / {totalStudentsCount || 0}</span>
            }
            case DURATION: {
                return data.sessionType === 'yetToBegin' || (data.sessionType === 'completed' && otp) ? '-' : <span style={{ color: '#212121' }}>{getDuration(data.sessionStartTime, data.sessionEndTime, 'showSec')}</span>
            }
            case SESSION_TYPE: {
                return getSessionType(data.sessionMode)
            }
            case RECORDING: {
                return data.recording ? <a href={data.recording} target='_blank' rel="noopener noreferrer" className={`${styles.link}`}>View Link</a> : '-'
            }
            case PREVIOUS_TOPIC: {
                return data.topic ? data.topic : '-'
            }
            case PQ_SUBMISSIONS:
            case QUIZ_SUBMISSIONS: {
                if (previousSessionTopicDataLoading) {
                    return <ContentLoader
                        className={styles.progressSkeleton}
                        speed={1}
                        backgroundColor={'#f5f5f5'}
                        foregroundColor={'#dbdbdb'}
                        viewBox="0 0 30 8"
                    >
                        <rect x="0" y="0" width="30px" height="8px" />
                    </ContentLoader>
                }
                if (!data.homeworkSubmissions.completedPQMeta) {
                    if (!get(data, 'presentStudents')) {
                        return (
                            <span style={{ color: '#000000' }}>
                                <span
                                    style={{ color: returnColorBasedOnPercentage(get(data, 'homeworkSubmissions.completedPQMeta')) }}
                                >
                                    {data.homeworkSubmissions.completedPQMeta}%
                                </span>
                            </span>
                        )
                    }
                    return <span style={{ color: '#000000' }}><span style={{ color: returnColorBasedOnPercentage(0) }}>0%</span></span>
                }
                return !get(data, 'totalStudents') ? <span style={{ color: '#9E9E9E' }}><span style={{ color: '#000000' }}>-</span></span> : (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span
                            style={{ color: '#9E9E9E', marginRight: '8px' }}
                            className={styles.moreDetailsItemData}
                        >
                            <span
                                style={{ color: returnColorBasedOnPercentage(calculatePercentage(data.homeworkSubmissions.completedPQMeta, get(data, 'totalStudents'))) }}
                            >
                                {calculatePercentage(data.homeworkSubmissions.completedPQMeta, get(data, 'totalStudents'))}%
                            </span>
                        </span>
                        {getHomeworkFilterList(get(data, 'completedUserAssignmentData'), 'isAssignmentSubmitted').length ? (
                            <UpdatedToolTip
                                tipColor={"#4A336C"}
                                delay={'200'}
                                hideDelay={'800'}
                                content={attendanceTooltip({ data, key: 'isAssignmentSubmitted' })}
                            >
                                <InformationCircle />
                            </UpdatedToolTip>
                        ) : null}
                    </div>
                )
            }
            case AVG_QUIZ_TRIES: {
                return <span style={{ color: '#000000' }}>{data.avgQuizTries || 0}</span>
            }
            case PREV_HW_SUBMISSIONS:
            case HW_SUBMISSIONS: {
                if (currentClassroomMetaLoading) {
                    return <ContentLoader
                        className={styles.progressSkeleton}
                        speed={1}
                        backgroundColor={'#f5f5f5'}
                        foregroundColor={'#dbdbdb'}
                        viewBox="0 0 30 8"
                    >
                        <rect x="0" y="0" width="30px" height="8px" />

                    </ContentLoader>
                }
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span
                            style={{ color: '#9E9E9E', marginRight: '8px' }}
                            className={styles.moreDetailsItemData}
                        >
                            <span
                                style={{ color: returnColorBasedOnPercentage(( get(data, 'homeworkSubmissions.hwSubmissions') / get(data, 'totalStudents') ) *100 ) }}
                            >
                                {get(data, 'homeworkSubmissions.hwSubmissions') || 0}</span> / {get(data, 'totalStudents') || 0}
                            </span>
                            {getHomeworkFilterList(get(data, 'completedUserAssignmentData'), 'isHomeworkSubmitted').length ? (
                                <UpdatedToolTip
                                    tipColor={"#4A336C"}
                                    delay={'200'}
                                    hideDelay={'800'}
                                    content={attendanceTooltip({ data, key: 'isHomeworkSubmitted' })}
                                >
                                    <InformationCircle />
                                </UpdatedToolTip>
                            ) : null}
                    </div>
                )
            }
            case PREV_HW_QUIZ_SUBMISSION:
            case HW_QUIZ_SCORE: {
                if (currentClassroomMetaLoading) {
                    return <ContentLoader
                        className={styles.progressSkeleton}
                        speed={1}
                        backgroundColor={'#f5f5f5'}
                        foregroundColor={'#dbdbdb'}
                        viewBox="0 0 30 8"
                    >
                        <rect x="0" y="0" width="30px" height="8px" />

                    </ContentLoader>
                }
                return !get(data, 'homeworkSubmissions.quizSubmissions') ? <span style={{ color: '#9E9E9E' }}>-</span> : <span style={{ color: '#9E9E9E' }}><span style={{ color: returnColorBasedOnPercentage(( get(data, 'homeworkSubmissions.quizSubmissions') / get(data, 'totalStudents')) * 100) }}>{get(data, 'homeworkSubmissions.quizSubmissions')}</span> / {get(data, 'totalStudents') || 0}</span>
            }
            case CODING_SCORE: {
                return !data.codingScore ? <span style={{ color: '#9E9E9E', fontSize: '10px' }}>(not yet evaluated)</span> : <span style={{ color: '#9E9E9E' }}><span style={{ color: '#000000' }}>{data.codingScore}</span></span>
            }
            case HW_CODE_SCORE: {
                return !data.hwCodeScore ? <span style={{ color: '#9E9E9E' }}>-</span> : <span style={{ color: '#9E9E9E' }}><span style={{ color: '#000000' }}>{data.hwCodeScore}</span></span>
            }
            default: {
                throw new Error('Unhandled type of detail')
            }
        }
    }


    return <div className={styles.itemContainer}>
        <div className={styles.itemIcon}>{icon}</div>
        <div className={styles.itemLabelAndTextContainer}>
            <span className={styles.itemLabel}>{label}</span>
            <span className={styles.itemValue}>{getItemData(label, data, otp)}</span>
        </div>
    </div>
}

const MoreDetails = ({ currentClassroomMetaLoading, previousSessionTopicDataLoading, classroomNextSessionsLoading, otp, data }) => {
    const getItemIcon = (label) => {
        switch (label) {

            case TOTAL_STUDENTS:
            case ATTENDANCE:
            case JOINED_STUDENTS: {
                return <StudentsSvg />
            }
            case HW_SUBMISSIONS:
            case PREV_HW_SUBMISSIONS: {
                return <HomeOutlineIcon />
            }
            case HW_QUIZ_SCORE:
            case PREV_HW_QUIZ_SUBMISSION: {
                return <TargetIcon />
            }
            case CODING_SCORE:
            case HW_CODE_SCORE: {
                return <CodeOutlineIcon />
            }
            case PREV_HW_DONE: {
                return <HomeworkSvg />
            }
            case DURATION: {
                return <ClockSvg />
            }
            case SESSION_TYPE: {
                return <TypeSvg />
            }
            case RECORDING: {
                return <TypeSvg />
            }
            case PREVIOUS_TOPIC: {
                return <StudentsSvg />
            }
            case AVG_QUIZ_TRIES: {
                return <TargetIcon />
            }
            case PQ_SUBMISSIONS:
            case QUIZ_SUBMISSIONS: {
                return <PuzzleIcon />
            }
            default: {
                return <StudentsSvg />
            }
        }
    }
    if (data.sessionType === 'completed') {
        if (otp) {
            if (data.isCurrentTimeBetweenSessionStartAndEndTime) {
            return <div className={styles.moreDetailsContainer}>
                <div className={styles.moreDetailsContainerChild}>
                    {
                        getSessionInfo(data, otp).map(topic => <Item
                            currentClassroomMetaLoading={currentClassroomMetaLoading} previousSessionTopicDataLoading={previousSessionTopicDataLoading}
                            classroomNextSessionsLoading={classroomNextSessionsLoading}
                            label={topic.label} icon={getItemIcon(topic.label)} data={data} otp={otp} />)
                    }
                </div>
            </div>
            }
            return <div className={styles.moreDetailsContainer}>
                <div className={styles.moreDetailsContainerChild}>
                    {
                        getSessionInfo(data, otp).map(topic => <Item
                            currentClassroomMetaLoading={currentClassroomMetaLoading} previousSessionTopicDataLoading={previousSessionTopicDataLoading}
                            classroomNextSessionsLoading={classroomNextSessionsLoading}
                            label={topic.label} icon={getItemIcon(topic.label)} data={data} otp={otp} />)
                    }
                </div>
            </div>
        }
        return <div className={styles.moreDetailsContainer}>
            <div className={styles.moreDetailsContainerChild}>
                {
                    getSessionInfo(data, otp).map(topic => <Item currentClassroomMetaLoading={currentClassroomMetaLoading} label={topic.label} icon={getItemIcon(topic.label)} data={data} otp={otp} />)
                }
            </div>
        </div>
    }
    if (data.sessionType === 'unAttended') {
        return <div className={styles.moreDetailsContainerUnAttended}>
            {
                getSessionInfo(data, otp).slice(0, 2).map(topic => <Item classroomNextSessionsLoading={classroomNextSessionsLoading} label={topic.label} icon={getItemIcon(topic.label)} data={data} otp={otp} />)
            }
        </div>
    }
    if (data.sessionType === 'yetToBegin') {
        if (data.isCurrentTimeBetweenSessionStartAndEndTime) {
            return <div className={styles.moreDetailsContainer}>
                <div className={styles.moreDetailsContainerChild}>
                    {
                        getSessionInfo(data, otp).map(topic => <Item
                            currentClassroomMetaLoading={currentClassroomMetaLoading} previousSessionTopicDataLoading={previousSessionTopicDataLoading}
                            classroomNextSessionsLoading={classroomNextSessionsLoading}
                            label={topic.label} icon={getItemIcon(topic.label)} data={data} otp={otp} />)
                    }
                </div>
            </div>
        }
        return <div className={styles.flexContainer}>
            <div className={styles.moreDetailsContainerChild}>
                {
                    getSessionInfo(data, otp).map(topic => <Item
                        currentClassroomMetaLoading={currentClassroomMetaLoading} previousSessionTopicDataLoading={previousSessionTopicDataLoading}
                        classroomNextSessionsLoading={classroomNextSessionsLoading}
                        label={topic.label} icon={getItemIcon(topic.label)} data={data} otp={otp} />)
                }
            </div>
        </div>
    }
    if (data.sessionType === 'inProgress') {
        return <div className={styles.moreDetailsContainer}>
            <div className={styles.moreDetailsContainerChild}>
                {
                    getSessionInfo(data, otp).map(topic => <Item
                        currentClassroomMetaLoading={currentClassroomMetaLoading} previousSessionTopicDataLoading={previousSessionTopicDataLoading}
                        classroomNextSessionsLoading={classroomNextSessionsLoading}
                        label={topic.label} icon={getItemIcon(topic.label)} data={data} otp={otp} />)
                }
            </div>


        </div>
    }
    return null
}

export default MoreDetails