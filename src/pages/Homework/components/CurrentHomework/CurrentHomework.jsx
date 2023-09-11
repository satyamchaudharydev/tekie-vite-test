import React, { Component } from 'react'
import cx from 'classnames'
import { get, orderBy } from 'lodash'
import { format, formatDuration, intervalToDuration, isAfter, isBefore, isPast, subHours } from 'date-fns'
import styles from '../../../Sessions/components/BookSession/BookSession.module.scss'
import { NextButton } from '../../../../components/Buttons/NextButton'
import getPath from '../../../../utils/getPath'
import { ReactComponent as AlertIcon } from '../../../../assets/alert-circle-sharp.svg'
import getCourseId, { getCourseName } from '../../../../utils/getCourseId'
import { PYTHON_COURSE } from '../../../../config'
import BookSessionLoader from "../../../Sessions/components/BookSessionLoader";
import ContentLoader from 'react-content-loader'
import getSlotLabel from '../../../../utils/slots/slot-label'
import getMasteryLabel from '../../../../utils/getMasteryLabels'
import isMobile from '../../../../utils/isMobile.js'
import { isIPad } from "../../../../utils/is32BitArch";
import './CurrentHomework.scss';
import '../../../../components/CourseNav/CourseNav.scss'
import { filterKey } from '../../../../utils/data-utils'
import UpdatedButton from '../../../../components/Buttons/UpdatedButton/UpdatedButton'
import { QUIZ_REPORT_URL } from '../../../../constants/routes/routesPaths'

class CurrentHomework extends Component {
    handleSolve = () => {
        const { handleSolve, topicId, isSubmittedForReview, isQuizSubmitted, history } = this.props
        if (isSubmittedForReview && isQuizSubmitted && (getCourseName() !== PYTHON_COURSE)) {
            history.push(`${QUIZ_REPORT_URL}/${getCourseId(topicId)}/${topicId}`)
        } else {
            handleSolve(topicId)
        }
    }

    numberDivideAndTruncate = (number1, number2) => {
        let result = 0
        if (number2 === 0) {
            result = 0
        } else {
            result = ((number1 / number2) * 100)
            result = result % 1 === 0 ? result : Number(result.toFixed(2))
        }
        return result
    }

    getUserProficiency = (userProfile) => {
        if (userProfile && userProfile.totalTopicsMeta && userProfile.proficientTopicsMeta && userProfile.masteredTopicsMeta) {
            const {
                totalTopicsMeta: { count: topicsCompleted },
                proficientTopicsMeta: { count: proficientTopicCount },
                masteredTopicsMeta: { count: masteredTopicCount }
            } = userProfile
            const proficientTopicsPer = (proficientTopicCount / topicsCompleted) * 100
            const masterTopicsPer = (masteredTopicCount / topicsCompleted) * 100
            if (proficientTopicsPer >= 20) {
                return 'PROFICIENT'
            } else if (masterTopicsPer >= 10) {
                return 'MASTER'
            } else {
                return 'FAMILIAR'
            }
        }
        return null
    }

    getCurrentHomeWorkStatus = () => {
        const { isQuizSubmitted, isAssignmentSubmitted, isPracticeSubmitted, isSubmittedForReview } = this.props
        console.log(this.props)
        if ((isQuizSubmitted || isAssignmentSubmitted || isPracticeSubmitted) && isSubmittedForReview) {
            return {
                status: 'completed',
                description: 'Completed',
                color: '#65DA7A',
                btnTitle: 'Review Homework',
            }
        } else if (isQuizSubmitted || isAssignmentSubmitted || isPracticeSubmitted) {
            return {
                status: 'inProgress',
                description: 'In Progress',
                color: '#FAAD14',
                btnTitle: 'Resume Homework',
            }
        }
        return {
            status: 'notStarted',
            description: 'Not yet started',
            color: '#D34B57',
            btnTitle: 'Solve Homework'
        }
    }

    getOverallHomeworkStats = () => {
        const { allSessions, userQuizDetails, userProfiles, getFirstOrLatestQuizReports } = this.props
        /** Calculate User Quiz Stats */
        let correctQuestionCount = 0, totalQuestionCount = 0, averagePercentage = 0
        if (userQuizDetails && userQuizDetails.length) {
            let firstQuizReports = getFirstOrLatestQuizReports('desc')
            firstQuizReports = firstQuizReports.filter(report => {
                const mentorMenteeSession = allSessions.filter(el => report.topic && (el.topicId === report.topic.id))
                if (mentorMenteeSession && mentorMenteeSession.length) {
                    if (get(mentorMenteeSession[0], 'isSubmittedForReview')) {
                        return true
                    }
                }
                return false
            })
            firstQuizReports.forEach(report => {
                correctQuestionCount += get(report, 'quizReport.correctQuestionCount', 0)
                totalQuestionCount += get(report, 'quizReport.totalQuestionCount', 0)
            })
            averagePercentage = this.numberDivideAndTruncate(correctQuestionCount, totalQuestionCount)
        }
        /** Calculate Session Status */
        let completed = 0, inProgress = 0, unAttended = 0, total = 0
        if (allSessions && allSessions.length) {
            total = allSessions.length
            allSessions.forEach(session => {
                if ((get(session, 'isQuizSubmitted') || get(session, 'isAssignmentSubmitted') || get(session, 'isPracticeSubmitted')) && get(session, 'isSubmittedForReview')) {
                    completed += 1
                } else if (get(session, 'isQuizSubmitted') || get(session, 'isAssignmentSubmitted') || get(session, 'isPracticeSubmitted')) {
                    inProgress += 1
                } else {
                    unAttended += 1
                }
            })
        }
        let userProficiency = null
        if (userProfiles && userProfiles.length && (completed > 0 || inProgress > 0)) {
            userProficiency = this.getUserProficiency(userProfiles[0])
        }
        const stats = {
            completed: {
                title: 'Completed',
                color: '#65DA7A',
                count: completed,
                percentage: Math.round((completed / total) * 100),
            },
            inProgress: {
                title: 'In progress',
                color: '#FAAD14',
                count: inProgress,
                percentage: Math.round((inProgress / total) * 100),
            },
            unAttended: {
                title: 'Unattended',
                color: '#D34B57',
                count: unAttended,
                percentage: Math.round((unAttended / total) * 100),
            }
        }
        return {
            totalCount: total,
            quizPercentage: averagePercentage,
            userProficiency,
            stats,
            chartData: {
                labels: [stats.completed.title, stats.inProgress.title, stats.unAttended.title],
                datasets: [{
                    data: [stats.completed.count, stats.inProgress.count, stats.unAttended.count],
                    backgroundColor: [
                        stats.completed.color,
                        stats.inProgress.color,
                        stats.unAttended.color,
                    ],
                    hoverOffset: 4,
                    cutout: 71,
                }]
            }
        }
    }

    getIsComponentSubmitted = (component) => {
        const { isQuizSubmitted, isPracticeSubmitted, isAssignmentAttempted } = this.props
        if (get(component, 'componentName') === 'homeworkAssignment') {
            return isAssignmentAttempted
        } else if (get(component, 'componentName') === 'quiz') {
            return isQuizSubmitted
        } else if (get(component, 'componentName') === 'homeworkPractice') {
            return isPracticeSubmitted
        }
        return false
    }

    getCurrentHomeworkBottomStatusBar = (currentHomeworkStatus) => {
        const { bookedSession, userQuizDetails, topicId, getFirstOrLatestQuizReports, bookSessionProps } = this.props
        const bookedSessionDate = (bookedSession && bookedSession.length && get(bookedSession[0], 'bookingDate')) ? get(bookedSession[0], 'bookingDate') || null : null
        let shouldHideWarning = false
        let mentorMenteeSession
        let batchSession
        if (bookSessionProps && (bookSessionProps.mentorMenteeSession || bookSessionProps.batchSession)) {
            mentorMenteeSession = bookSessionProps.mentorMenteeSession
            batchSession = bookSessionProps.batchSession
        }
        if (mentorMenteeSession && mentorMenteeSession.toJS() && bookedSession[0] && bookedSession[0].topicId) {
            const currentSession = (mentorMenteeSession.toJS() || []).filter(el => el.topic && (el.topic.id === bookedSession[0].topicId))
            if (currentSession && (get(currentSession[0], 'sessionStatus') === 'started')) {
                shouldHideWarning = true
            }
        }
        if (batchSession && bookedSession[0] && bookedSession[0].topicId) {
            const currentBatchSession = filterKey(batchSession, `batchSession/${bookedSession[0].topicId}`)
            if (currentBatchSession && (currentBatchSession.getIn([0, 'sessionStatus']) === 'started')) {
                shouldHideWarning = true
            }
        }
        if ((get(currentHomeworkStatus, 'status') !== 'completed') && bookedSessionDate && !isPast(new Date(bookedSessionDate)) && !shouldHideWarning) {
            const slotTime = getSlotLabel(get(bookedSession[0], 'slotTime'), { appendMinutes: true })
            const bookingDate = new Date(`${new Date(bookedSessionDate).toDateString()}, ${slotTime.startTime}`)
            /** If Warning is to be display prior to 48hours of booking date */
            // const isWithin48Hours = isAfter(new Date(), subHours(new Date(bookingDate), 48))
            if (slotTime.startTime) {
                return (
                    <>
                        <span className='ch-primaryLabel' style={{
                            display: `${isMobile() ? 'inline' : ''}`
                        }}>Your next session starts in</span> {
                            formatDuration(
                                intervalToDuration({
                                    start: new Date(),
                                    end: bookingDate
                                }),
                                {
                                    format: ['months', 'days', 'hours', 'minutes'],
                                    delimiter: ', '
                                }
                            ).replace(/,([^,]*)$/, ' and$1')
                        }
                        <span className='ch-primaryLabel'>
                            Submit your
                            {!isMobile() && (
                                <span className='cn-navbar-warning open-style inActive-style noAnimation'>
                                    <AlertIcon /> PENDING
                                </span>
                            )}
                            homework on time.
                        </span>
                    </>
                )
            }
        } else if (get(currentHomeworkStatus, 'status') === 'completed') {
            const latestQuizReports = getFirstOrLatestQuizReports('desc');
            if (latestQuizReports && Object.keys(latestQuizReports).length) {
                const filteredTopicReport = latestQuizReports.filter(el => el.topic.id === topicId)[0] || {}
                if (filteredTopicReport && filteredTopicReport.quizReport) {
                    const masterLevel = get(filteredTopicReport, 'quizReport.masteryLevel', 'none')
                    const masteryLabel = getMasteryLabel(masterLevel)
                    return (
                        <>
                            {masteryLabel.preText}
                            <span className='ch-masteryLabel' style={{
                                background: masteryLabel.tagColor,
                                boxShadow: `0px 0px 4px ${masteryLabel.tagColor}, inset 0px 0px 4px ${masteryLabel.tagColor}`,
                            }}>
                                {masteryLabel.tagName}
                            </span>
                            {masteryLabel.postText}
                        </>
                    )
                }
            }
        }
        return null
    }

    getStreakLabels = () => {
        const fireEmoji = (isMobile() || isIPad()) ? '🔥' : <span className='ch-fire-emoji' />        
        let isStreakBrookenRecently = false;
        let userHomeworkStreaks = get(this.props, 'userHomeworkStreaks[0].homeworkStreaks', [])
        let userHomeworkStreaksLog = get(this.props, 'userHomeworkStreaks[0].homeworkStreaksLog', [])
        userHomeworkStreaks = userHomeworkStreaks.filter(el => el.course && (el.course.id === getCourseId()))
        userHomeworkStreaksLog = userHomeworkStreaksLog.filter(el => el.course && (el.course.id === getCourseId())) || []
        const isLogContainsStreakHistory = userHomeworkStreaksLog.some(el => get(el, 'mentorMenteeSession.isReviewSubmittedOnTime', false))
        /** Getting Latesh Streak Break Sequence */
        const latestStreakLogs = orderBy(userHomeworkStreaksLog, (a) => new Date(a.createdAt), ['desc']) || []
        userHomeworkStreaksLog = latestStreakLogs.slice(0, latestStreakLogs.findIndex(el => el.mentorMenteeSession && (get(el, 'mentorMenteeSession.isReviewSubmittedOnTime', false))))

        if (userHomeworkStreaksLog && userHomeworkStreaksLog.length) {
            /** Checking if Streak is Brooken recently */
            const log = userHomeworkStreaksLog[userHomeworkStreaksLog.length - 1]
            if (log.createdAt) {
                if (isBefore(new Date(log.createdAt), new Date()) && isAfter(new Date(log.createdAt), subHours(new Date(), 24)) && isLogContainsStreakHistory) {
                    isStreakBrookenRecently = true
                }
            }
        }
        if (userHomeworkStreaks && userHomeworkStreaks.length > 0) {
            userHomeworkStreaks = userHomeworkStreaks.filter(el => get(el, 'mentorMenteeSession'))
            const userStreaksCount = userHomeworkStreaks.length
            if (userStreaksCount === 1) {
                return {
                    count: 1,
                    label: (<>Build your streak {fireEmoji} by submitting your assignments on time.</>)
                }
            } else if (userStreaksCount <= 5) {
                return {
                    count: userStreaksCount,
                    label: (<>You are on a {userStreaksCount} {fireEmoji} streak!</>)
                }
            } else if (userStreaksCount <= 10) {
                return {
                    count: userStreaksCount,
                    label: (<>Keep up the good work to maintain {userStreaksCount} {fireEmoji} Streak!</>)
                }
            } else if (userStreaksCount > 10) {
                return {
                    count: userStreaksCount,
                    label: (<>Way to go! You are at {userStreaksCount} {fireEmoji} Streak!</>)
                }
            }
        } else {
            if (isStreakBrookenRecently) {
                return {
                    count: 0,
                    brookenStreakStyles: {
                        background: '#FDE9E6',
                        backdropFilter: 'blur(150px)',
                        color: '#FF5744'
                    },
                    label: 'Oh no! Let’s build️ a new streak. Submit the next assignment on time.'
                }
            }
            return {
                count: 1,
                label: (<>Build your streak {fireEmoji} by submitting your assignments on time.</>)
            }
        }
    }

    getComponentRender = (component) => {
        const { questionsLength, assignmentsLength, practiceLength } = this.props.getTopicQuestionsMeta(this.props.topicId)
        if (get(component, 'componentName') === 'quiz') {
            return (
                <>
                    Quiz {questionsLength ? (`(${questionsLength} MCQs)`) : ''}
                </>
            )
        } else if (get(component, 'componentName') === 'homeworkPractice') {
            return (
                <>
                    Practice {practiceLength ? (`(${practiceLength} questions)`) : ''}
                </>
            )
        }
        return (
            <>
                Coding Assignment {assignmentsLength ? (`(${assignmentsLength} questions)`) : ''}
            </>
        )
    }

    render() {
        const {
            isQuizSubmitted,
            isAssignmentSubmitted,
            isPracticeSubmitted,
            topicTitle,
            topicThumbnailSmall,
            assignmentSubmitDate,
            quizSubmitDate,
            practiceSubmitDate,
            newFlow,
            topicId,
        } = this.props
        const chartConfig = { plugins: { legend: { display: false }, }, elements: { arc: { borderWidth: 0 } } }
        const overallStats = this.getOverallHomeworkStats()
        const streakMeta = this.getStreakLabels()
        let homeworkComponents = this.props.getHomeworkComponents(topicId)
        if (homeworkComponents && homeworkComponents.filter(el => el.componentName === 'homeworkPractice').length >= 2) {
            homeworkComponents = homeworkComponents.slice(0, homeworkComponents.findIndex(el => get(el, 'componentName') === 'homeworkPractice') + 1)
        }
        const currentHomeworkStatus = this.getCurrentHomeWorkStatus(isQuizSubmitted, isAssignmentSubmitted, isPracticeSubmitted)
        const bottomStatusBar = this.getCurrentHomeworkBottomStatusBar(currentHomeworkStatus)
        let date
        if (quizSubmitDate && assignmentSubmitDate && practiceSubmitDate) {
            date = new Date(quizSubmitDate).setHours(0, 0, 0, 0) > new Date(assignmentSubmitDate).setHours(0, 0, 0, 0)
                ? new Date(quizSubmitDate)
                : new Date(assignmentSubmitDate)
            date = new Date(date).setHours(0, 0, 0, 0) > new Date(practiceSubmitDate).setHours(0, 0, 0, 0)
                ? new Date(date)
                : new Date(practiceSubmitDate)
        } else if (quizSubmitDate && assignmentSubmitDate) {
            date = new Date(quizSubmitDate).setHours(0, 0, 0, 0) > new Date(assignmentSubmitDate).setHours(0, 0, 0, 0)
                ? new Date(quizSubmitDate)
                : new Date(assignmentSubmitDate)
        } else if (quizSubmitDate) {
            date = new Date(quizSubmitDate)
        } else if (assignmentSubmitDate) {
            date = new Date(assignmentSubmitDate)
        } else if (practiceSubmitDate) {
            date = new Date(practiceSubmitDate)
        }
        const loggedInUser = this.props.loggedInUser && this.props.loggedInUser.toJS();
        const isMentorLoggedIn = get(loggedInUser, 'isMentorLoggedIn', false)
        if (newFlow) {
            if (isMobile()) {
                return (
                    <div className='ch-mainContainer'>
                        <div className='ch-homeworkMainContainer-padding '>
                            <div className='ch-homeworkMainContainer' >
                                <div className='ch-flex-row-container'>
                                    {
                                        this.props.isLoading
                                            ? (
                                                <div className='infoContainer'>
                                                    <ContentLoader
                                                        className='ch-loader-card'
                                                        speed={5}
                                                        interval={0.1}
                                                        backgroundColor={'#ffffff'}
                                                        foregroundColor={'#cce7e9'}
                                                    >
                                                        <rect className='ch-loader-1' />
                                                        <rect className='ch-loader-2' />
                                                        <rect className='ch-loader-3' />
                                                        <rect className='ch-loader-4' />
                                                        <rect className='ch-loader-5' />
                                                        <rect className='ch-loader-6' />
                                                        <rect className='ch-loader-7' />
                                                        <rect className='ch-loader-8' />
                                                        <rect className='ch-loader-9' />
                                                        <rect className='ch-loader-10' />
                                                        <rect className='ch-loader-11' />
                                                        <rect className='ch-loader-12' />
                                                        <rect className='ch-loader-13' />
                                                        <rect className='ch-loader-14' />
                                                    </ContentLoader>
                                                </div>
                                            )
                                            : (
                                                <div>
                                                    <div
                                                        className='ch-homeworkStatus'
                                                        style={{
                                                            background: `${currentHomeworkStatus.color}`
                                                        }}
                                                    >
                                                        {currentHomeworkStatus.description}
                                                    </div>
                                                    <div className='infoContainer' style={{ display: "flex" }} >
                                                        <div >
                                                            <div className='ch-preText'>PREVIOUS SESSION</div>
                                                            <div className='ch-titleText'>
                                                                {topicTitle}
                                                            </div>
                                                            <div
                                                                className='ch-thumbnailContainer'
                                                                style={{
                                                                    backgroundImage: `url("${topicThumbnailSmall && getPath(topicThumbnailSmall.uri)}")`
                                                                }}
                                                            >
                                                            </div>
                                                            <div className='homeworkFooterWrapperPadding'>
                                                                {date ? (
                                                                    <div className='homeworkCalendarDateContainer'>
                                                                        <div className='ch-calendarContainer' />
                                                                        <div>
                                                                            <div className='ch-dateTime'>
                                                                                {get(currentHomeworkStatus, 'status') === 'completed' ? 'Submitted on' : 'Last Attempted On'}
                                                                            </div>
                                                                            <div className='homeworkDateContainer'
                                                                                style={{ paddingBottom: '2px' }}
                                                                            >
                                                                                {
                                                                                    assignmentSubmitDate || quizSubmitDate || practiceSubmitDate
                                                                                        ? format(date, 'EEEE, do MMMM')
                                                                                        : ''
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : null}
                                                                <div className='ch-preText'>REMAINING TASKS</div>
                                                                {(homeworkComponents || []).map(component => (
                                                                    <div className='quizStatusContainer'>
                                                                        <div className={
                                                                            this.getIsComponentSubmitted(component)
                                                                                ? 'ch-completedIcon'
                                                                                : 'ch-pendingIcon'
                                                                        } />
                                                                        <div className='ch-remainingTask'>
                                                                            {this.getComponentRender(component)}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className='ch-rightContainer'>
                                                            <UpdatedButton
                                                                text={currentHomeworkStatus.btnTitle}
                                                                onBtnClick={() => this.handleSolve()}
                                                            >

                                                            </UpdatedButton>
                                                            
                                                        </div>
                                                    </div>

                                                </div>
                                            )
                                    }
                                    {/* {(bottomStatusBar && !this.props.isLoading) && (
                                        <div className='ch-flex-row-container ch-nextSessionContainer ' >
                                            {bottomStatusBar}
                                        </div>
                                    )} */}
                                </div>
                            </div>

                        </div>
                        <div className="ribbon-parent" >
                            <div className='ribbon' >
                                Check your Homework Stats below <img width="20px" src="https://img.icons8.com/material-outlined/24/ffffff/down--v1.png" alt="arrow down" />
                            </div>
                        </div>
                       
                    </div>
                )
            }
            else {
                return (
                    <div className='ch-mainContainer'>
                        <div className='ch-homeworkMainContainer'>
                            <div className='ch-flex-row-container'>
                                {
                                    this.props.isLoading
                                        ? (
                                            <div className='infoContainer'>
                                                <ContentLoader
                                                    className='ch-loader-card'
                                                    speed={5}
                                                    interval={0.1}
                                                    backgroundColor={'#ffffff'}
                                                    foregroundColor={'#cce7e9'}
                                                >
                                                    <rect className='ch-loader-1' />
                                                    <rect className='ch-loader-2' />
                                                    <rect className='ch-loader-3' />
                                                    <rect className='ch-loader-4' />
                                                    <rect className='ch-loader-5' />
                                                    <rect className='ch-loader-6' />
                                                    <rect className='ch-loader-7' />
                                                    <rect className='ch-loader-8' />
                                                    <rect className='ch-loader-9' />
                                                    <rect className='ch-loader-10' />
                                                    <rect className='ch-loader-11' />
                                                    <rect className='ch-loader-12' />
                                                    <rect className='ch-loader-13' />
                                                    <rect className='ch-loader-14' />
                                                </ContentLoader>
                                            </div>
                                        )
                                        : (
                                            <div>
                                                <div
                                                    className='ch-homeworkStatus'
                                                    style={{
                                                        background: `${currentHomeworkStatus.color}`
                                                    }}
                                                >
                                                    {currentHomeworkStatus.description}
                                                </div>
                                                <div className='infoContainer' style={{ display: "flex" }} >
                                                    <div >
                                                        <div className='ch-preText'>PREVIOUS SESSION</div>
                                                        <div className='ch-titleText'>
                                                            {topicTitle}
                                                        </div>
                                                        <div className='homeworkFooterWrapperPadding'>
                                                            {date ? (
                                                                <div className='homeworkCalendarDateContainer'>
                                                                    <div className='ch-calendarContainer' />
                                                                    <div className='ch-dateTime'>
                                                                        {get(currentHomeworkStatus, 'status') === 'completed' ? 'Submitted on' : 'Last Attempted On'}
                                                                    </div>
                                                                    <div className='homeworkDateContainer'
                                                                        style={{ paddingBottom: '2px' }}
                                                                    >
                                                                        {
                                                                            assignmentSubmitDate || quizSubmitDate || practiceSubmitDate
                                                                                ? format(date, 'EEEE, do MMMM')
                                                                                : ''
                                                                        }
                                                                    </div>
                                                                </div>
                                                            ) : null}
                                                            <div className='ch-preText'>REMAINING TASKS</div>
                                                            {(homeworkComponents || []).map(component => (
                                                                <div className='quizStatusContainer'>
                                                                    <div className={
                                                                        this.getIsComponentSubmitted(component)
                                                                            ? 'ch-completedIcon'
                                                                            : 'ch-pendingIcon'
                                                                    } />
                                                                    <div className='ch-remainingTask'>
                                                                        {this.getComponentRender(component)}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className='ch-rightContainer'>
                                                        <div
                                                            className='ch-thumbnailContainer'
                                                            style={{
                                                                backgroundImage: `url("${topicThumbnailSmall && getPath(topicThumbnailSmall.uri)}")`
                                                            }}
                                                        >
                                                        </div>
                                                        <UpdatedButton
                                                            text={currentHomeworkStatus.btnTitle}
                                                            onBtnClick={() => this.handleSolve()}
                                                        >

                                                        </UpdatedButton>
                                                    </div>
                                                </div>

                                            </div>
                                        )
                                }
                            </div>
                            {/* {(bottomStatusBar && !this.props.isLoading) && (
                                <div className='ch-flex-row-container ch-nextSessionContainer'>
                                    {bottomStatusBar}
                                </div>
                            )} */}
                        </div>
                      
                    </div>
                )
            }
        }
        return (
            <div className={styles.homeworkMainContainer}>
                <div
                    className={styles.thumbnailContainer}
                    style={{
                        backgroundImage: `url("${topicThumbnailSmall && getPath(topicThumbnailSmall.uri)}")`
                    }}
                >
                </div>
                <div className={styles.separator} />
                {
                    this.props.isLoading
                        ? (
                            <div className={styles.infoContainer}>
                                <BookSessionLoader />
                            </div>
                        )
                        : (
                            <div className={styles.infoContainer}>
                                <div className={styles.title}>
                                    <div className={styles.titleText}>
                                        {topicTitle}
                                    </div>
                                </div>
                                <div className={cx(styles.footerWrapper, styles.homeworkFooterWrapperPadding)}>
                                    {date ? (
                                        <div className={styles.homeworkCalendarDateContainer}>
                                            <div className={styles.calendarContainer} />
                                            <div className={styles.textWrapper}>
                                                <div className={styles.dateTime}>
                                                    Last Attempted On
                                                </div>
                                                <div className={styles.homeworkDateContainer}>
                                                    {
                                                        assignmentSubmitDate || quizSubmitDate
                                                            ? date
                                                            : ''
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                    <div className={styles.quizStatusContainer}>
                                        <div className={
                                            isQuizSubmitted
                                                ? styles.completedIcon
                                                : styles.pendingIcon
                                        } />
                                        <div className={styles.textWrapper}>
                                            <div className={styles.dateTime}>
                                                {
                                                    isQuizSubmitted
                                                        ? 'Quiz Completed'
                                                        : 'Quiz Pending'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cx(styles.footerContainer, styles.homeworkFooterMargin)}>
                                        <div className={styles.codingAssignmentContainer}>
                                            <div className={
                                                isAssignmentSubmitted
                                                    ? styles.completedIcon
                                                    : styles.pendingIcon
                                            } />
                                            <div className={styles.textWrapper}>
                                                <div className={styles.dateTime}>
                                                    {
                                                        isAssignmentSubmitted
                                                            ? 'Assignment Completed'
                                                            : 'Assignment Pending'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        <div onClick={this.handleSolve}>
                                            <NextButton
                                                title={
                                                    isAssignmentSubmitted && isQuizSubmitted
                                                        ? 'Review'
                                                        : 'Solve'
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                }
            </div>
        )
    }
}

export default CurrentHomework
