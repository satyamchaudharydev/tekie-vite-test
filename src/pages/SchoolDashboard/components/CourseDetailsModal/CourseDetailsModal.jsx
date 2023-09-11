import React from 'react'
import cx from 'classnames'
import { capitalize ,get, sortBy } from 'lodash'
import { format } from 'date-fns'
import { filterKey } from '../../../../utils/data-utils'
import { connect } from 'react-redux'
import { ImageBackground } from '../../../../image'
import fetchBatchSessions from '../../../../queries/schoolDashboard/fetchBatchSessions'
import ClassTypeIcon from '../../../../assets/SchoolDashboard/classTypeIcon'
import Clock from '../../../../assets/SchoolDashboard/icons/Clock'
import Check from '../../../../assets/SchoolDashboard/icons/Check'
import CloseIcon from '../../../../assets/SchoolDashboard/icons/CloseIcon'
import getPath from '../../../../utils/getPath'
import { getSlotTime } from '../../utils'


import './CourseDetailsModal.scss'
import '../../SchoolDashboard.common.scss'
import '../modal.scss'

const CourseDetailsModal = ({
    batchDetails = null,
    isModalVisible = false,
    closeCourseDetailsModal,
    batchSessionData,
    adhocSessionsData
}) => {
    const [isLoading, setIsLoading] = React.useState(true)
    const [courseTopics, setCourseTopics] = React.useState([])
    const batchSessions = batchSessionData && batchSessionData.toJS()
    const adhocSessions = adhocSessionsData && adhocSessionsData.toJS()
    const sessions = batchSessions.concat(adhocSessions)

    React.useEffect(() => {
        const courseChapters = get(batchDetails, 'course.chapters') || []
        const topics = []
        courseChapters && courseChapters.forEach(chapter => {
            if (chapter.topics && chapter.topics.length) {
                topics.push(...chapter.topics)
            }
        })
        setCourseTopics(sortBy(topics, ['order']))
    }, [batchDetails])

    React.useEffect(() => {
        if (isModalVisible) {
            fetchAndMapBatchSessions()
        }
    }, [isModalVisible])
    
    const fetchAndMapBatchSessions = async () => {
        setIsLoading(true)
        const batchId = get(batchDetails, 'id')
        const filter  = `{batch_some:{id:"${batchId}"}}`
        await fetchBatchSessions(filter,0, 0, 'gradeBatchSessions', 'sessionStartDate_ASC').call()
        setIsLoading(false)
    }
    
    /** Utils */
    const closeModal = () => {
        closeCourseDetailsModal(false)
    }

    const getCompletedTopicsMeta = () => {
        const currentTopic = get(batchDetails, 'currentComponent.currentTopic')
        let completedTopicsMeta = 0
        courseTopics.forEach(topic => {
            if (get(topic, 'order') <= get(currentTopic, 'order')) {
                completedTopicsMeta += 1
            }
        })
        return completedTopicsMeta 
    }

    const getCompletedCoursePercentage = () => Math.round((getCompletedTopicsMeta() / courseTopics.length) * 100)

    const getTimeRangeFromSession = (bookingDate, session) => {
        bookingDate = new Date(bookingDate).toDateString()
        const startTime = `${bookingDate}, ${get(getSlotTime(session), 'startTime')}`
        const endTime = `${bookingDate}, ${get(getSlotTime(session), 'endTime')}`
        return `${format(new Date(startTime), 'hh:mm a')} - ${format(new Date(endTime), 'hh:mm a')}`
    }

    const checkIfSessionCompleted = (session) => {
        let isCompleted = false
        const currentTopicOrder = get(session, 'batch.currentComponent.currentTopic.order', null)
        const latestSessionStatus = get(session, 'batch.currentComponent.latestSessionStatus', null)
        if (get(session, 'topic')) {
            if (get(session, 'topic.order') < currentTopicOrder) {
                isCompleted = true
            } else if (get(session, 'topic.order') === currentTopicOrder) {
                if (latestSessionStatus === 'completed') {
                    isCompleted = true
                }
            }
        } else {
            if (get(session, 'sessionStatus') === 'completed') {
                isCompleted = true
            }
        }
        return isCompleted
    }

    return (
        <div className={cx('modal-Backdrop', isModalVisible && 'modal-Backdrop-visible')}>
            <div className={cx('modalBox', isModalVisible && 'modalBox-visible')}>
                <div style={{ position: 'relative' }}>
                    {isLoading ? (
                    <>
                        <div className='loading-container show'>
                            <div className='loading-bar-container'>
                                <div />
                            </div>
                        </div>
                    </>
                    ) : (null)}
                    <div className={cx('modal-header-container')}>
                        <div className={cx('courseDM-header-details')}>
                            <div className={cx('modal-course-thumbnail-container')}>
                                <ImageBackground
                                    className='modal-course-thumbnail'
                                    src={getPath(get(batchDetails, 'course.thumbnail.uri'))}
                                    srcLegacy={getPath(get(batchDetails, 'course.thumbnail.uri'))}
                                />
                            </div>
                            <div className={cx('courseDM-details-container')}>
                                <div className={cx('courseDM-details-grade')}>
                                    {get(batchDetails, 'classes') ? get(batchDetails, 'classes', []).map(schoolClass => (
                                        `${get(schoolClass, 'grade')}-${get(schoolClass, 'section')}`
                                    )) : null}
                                </div>
                                <div className={cx('courseDM-details-courseText')}>
                                    Course: <span>{get(batchDetails, 'course.title')}</span>
                                </div>
                                <div className={cx('courseDM-details-recurrenceText')}>
                                    <Clock className={cx('courseDM-modal-session-details-timeTable-icon')} />
                                    {get(batchDetails, 'recurrenceString')}
                                </div>
                                <div className={cx('courseDM-modal-header-course-progress-container')}>
                                    <div className={cx('courseDM-modal-header-course-progress-text')}>
                                        Course Progress
                                    </div>
                                    <div className={cx('courseDM-modal-header-course-progress')}>
                                        <div
                                            style={{ width: `${getCompletedCoursePercentage()}%` }}
                                            className={cx('courseDM-modal-header-course-progress-indicator')}
                                        />
                                    </div>
                                    <div className={cx('courseDM-modal-header-course-progress-percentage')}>
                                        {getCompletedCoursePercentage()}%
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CloseIcon className='modal-closeIcon' onClick={() => closeModal()}/>
                    </div>
                    <div className={cx('courseDM-modal-content-container')}>
                        <div style={{ width: '100%' }}>
                            <div className={cx('courseDM-modal-content-class-title')}>
                                All Classes
                            </div>
                            <div className={cx('courseDM-modal-content-batchSessions-container')} id='courseDM-modal-content-batchSessions-container'>
                                {sessions && sessions.length > 0 ? sortBy(sessions, ['topic.order']).map((session, index) => (
                                    <div className={cx('courseDM-modal-content-sessions')} key={session.id}>
                                        <div className={cx('courseDM-modal-session-order-container')}>
                                            {checkIfSessionCompleted(session) ?
                                                <Check className={cx('courseDM-modal-session-order-icon')} /> :
                                                <div className={cx('courseDM-modal-session-order')}>{get(session, 'topic') ? get(session, 'topic.order') : get(session, 'previousTopic.order')}</div>
                                            }
                                        </div>
                                        <div className={cx('courseDM-modal-session-thumbnail')}>
                                            <ImageBackground
                                                className='modal-course-thumbnail'
                                                src={get(session, 'previousTopic')
                                                    ? getPath(get(session, 'previousTopic.thumbnailSmall.uri'))
                                                    : getPath(get(session, 'topic.thumbnailSmall.uri'))}
                                                srcLegacy={get(session, 'previousTopic')
                                                    ? getPath(get(session, 'previousTopic.thumbnailSmall.uri'))
                                                    : getPath(get(session, 'topic.thumbnailSmall.uri'))}
                                            />
                                        </div>
                                        <div className={cx('courseDM-modal-session-details')}>
                                            <div className={cx('courseDM-modal-session-details-heading')}>{get(session, 'topic') ? get(session, 'topic.title') : `${get(session, 'previousTopic.title')} : ${capitalize(get(session, 'type'))}`}</div>
                                            <div className={cx('courseDM-modal-session-details-timeTable')}>
                                                <Clock className={cx('courseDM-modal-session-details-timeTable-icon')} />
                                                {getTimeRangeFromSession(get(session, 'bookingDate'), session)}
                                                {' '} &bull; {' '}
                                                {get(session, 'bookingDate') && new Date(get(session, 'bookingDate')).toDateString()}
                                            </div>
                                            <div className={cx('courseDM-modal-session-details-classType')}>
                                                <ClassTypeIcon className={cx('courseDM-modal-session-details-classType-icon')} />
                                                Class Type 
                                                <span className={cx('courseDM-modal-session-details-classType-tag')}>Learning</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ width: '100%', margin: '12px auto', textAlign: 'center', fontSize: '14px' }}>
                                        {isLoading ? 'Loading...' : 'No Sessions Found!'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => ({
    batchSessionData: filterKey(state.data.getIn([
        'schoolSessions',
        'data'
    ]), 'gradeBatchSessions'),
    adhocSessionsData: filterKey(state.data.getIn([
        'adhocSessions',
        'data'
    ]), 'gradeBatchSessions'),
    loggedInUser: filterKey(state.data.getIn(['user', 'data']), 'loggedinUser').get(0) || new Map({})
})

export default connect(mapStateToProps)(CourseDetailsModal)