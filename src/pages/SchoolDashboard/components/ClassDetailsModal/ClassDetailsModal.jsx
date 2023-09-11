import React from 'react'
import cx from 'classnames'
import { capitalize, get, sortBy } from 'lodash'
import { format } from 'date-fns'
import { ImageBackground } from '../../../../image'
import ClassTypeIcon from '../../../../assets/SchoolDashboard/classTypeIcon'
import ClassDetailRecurrenceIcon from '../../../../assets/SchoolDashboard/icons/ClassDetailRecurrenceIcon'
import ClassDetailBatchIcon from '../../../../assets/SchoolDashboard/icons/ClassDetailBatchIcon'
import ClassDetailStudentsIcon from '../../../../assets/SchoolDashboard/icons/ClassDetailStudentsIcon'
import Grade from '../../../../assets/SchoolDashboard/icons/Grade'
import CloseIcon from '../../../../assets/SchoolDashboard/icons/CloseIcon'
import getPath from '../../../../utils/getPath'
import { getCourseObject } from '../../utils'

import './ClassDetailsModal.scss'

const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const ClassDetailsModal = ({
    classDetails = null,
    isModalVisible = false,
    closeClassDetailsModal,
}) => {
    const [collapsibleVisible, setCollapsibleVisible] = React.useState(false)
    const [courseTopics, setCourseTopics] = React.useState([])
    const { primary: primaryColor, secondary: secondaryColor } = get(getCourseObject(get(classDetails, 'batch.course.id', null)), 'course.color')

    React.useEffect(() => {
        const courseChapters = get(classDetails, 'batch.course.chapters') || []
        const topics = []
        courseChapters && courseChapters.forEach(chapter => {
            if (chapter.topics && chapter.topics.length) {
                topics.push(...chapter.topics)
            }
        })
        setCourseTopics(sortBy(topics, ['order']))
    }, [classDetails])
    /** Utils */

    const closeModal = () => {
        closeClassDetailsModal(false)
    }

    const getSchoolGradeAndSection = () => {
        if (get(classDetails, 'batch')
            && get(classDetails, 'batch.classes')
            && get(classDetails, 'batch.classes').length > 0) {
            return `${get(classDetails.batch.classes[0], 'grade').replace('Grade','')}${get(classDetails.batch.classes[0], 'section')}`
        }
        return '-'
    }

    const getSessionRecurrenceString = () => {
        if (get(classDetails, 'batch')
            && get(classDetails, 'batch.timeTableRule')) {
            const timeTableRule = get(classDetails, 'batch.timeTableRule')
            let repeatedWeeks = ''
            weekDays.forEach(day => {
                if (timeTableRule[day]) repeatedWeeks += `${day.charAt(0).toUpperCase() + day.slice(1)} `
            })
            const startDate = new Date(get(timeTableRule, 'startDate'))
            const endDate = new Date(get(timeTableRule, 'endDate'))
            return `Every ${repeatedWeeks} from ${format(startDate, 'd MMM, yyyy')} - ${format(endDate, 'd MMM, yyyy')}`
        }
        return '-'
    }

    const getCompletedTopicsMeta = () => {
        const currentTopic = get(classDetails, 'batch.currentComponent.currentTopic')
        let completedTopicsMeta = 0
        courseTopics.forEach(topic => {
            if (get(topic, 'order') <= get(currentTopic, 'order')) {
                completedTopicsMeta += 1
            }
        })
        return completedTopicsMeta 
    }

    const getCompletedCoursePercentage = () => Math.round((getCompletedTopicsMeta() / courseTopics.length) * 100)
    
    /** Render Methods */
    const renderCourseDetails = ({ title, description, Icon}) => (
        <div className={cx('classDM-modal-courseDetails-container')}>
            <Icon className='classDM-modal-courseDetails-icon' />
            <div className={cx('classDM-modal-courseDetails-text')}>
                {title}
            </div>
            <div className={cx('classDM-modal-courseDetails-description', title === 'Batch' ? 'classDM-modal-courseDetails-link' : '')}>
                {description}
            </div>
        </div>
    )

    return (
        <div className={cx('classDM-modalBox', isModalVisible && 'classDM-modalBox-visible')}>
            <div className={cx('classDM-modal-header-container')}>
                <div className={cx('classDM-modal-header-details')}>
                    <div className={cx('classDM-modal-header-course-tag')} style={{ backgroundColor: secondaryColor, color: primaryColor }}>
                        course: {get(classDetails, 'batch.course.title', '')}
                    </div>
                    <div className={cx('classDM-modal-header-course-progress-container')}>
                        <div className={cx('classDM-modal-header-course-progress-text')}>
                            Course Progress
                        </div>
                        <div className={cx('classDM-modal-header-course-progress')}>
                            <div
                                style={{ width: `${getCompletedCoursePercentage()}%` }}
                                className={cx('classDM-modal-header-course-progress-indicator')}
                            />
                        </div>
                        <div className={cx('classDM-modal-header-course-progress-percentage')}>
                            {getCompletedCoursePercentage()}%
                        </div>
                    </div>
                </div>
                <CloseIcon className='classDM-modal-closeIcon' onClick={() => closeModal()}/>
            </div>
            <div className={cx('classDM-modal-content-container')}>
                <div>
                    <div className={cx('classDM-modal-content-class-completed')}>
                        Class <span>{get(classDetails, 'topic') ? get(classDetails, 'topic.order') : get(classDetails, 'previousTopic.order')}/{courseTopics.length}</span>
                    </div>
                    <div className={cx('classDM-modal-content-class-title')}>
                        {get(classDetails, 'topic') ? get(classDetails, 'topic.title') : `${get(classDetails, 'previousTopic.title')} : ${capitalize(get(classDetails, 'type'))}`}
                    </div>
                    <div className={cx('classDM-modal-content-class-timeStamp')}>
                        {get(classDetails, 'startTime') && format(get(classDetails, 'startTime'), 'hh:mm a')}
                        {get(classDetails, 'endTime') && ` - ${format(get(classDetails, 'endTime'), 'hh:mm a')}`}
                        {' '} &bull; {' '}
                        {get(classDetails, 'startTime') && get(classDetails, 'startTime').toDateString()}
                    </div>
                    <div className={cx('classDM-modal-content-class-type-container')}>
                        <ClassTypeIcon className='classDM-modal-content-class-type-icon' />
                        <div className={cx('classDM-modal-content-class-type-text')}>
                            Class Type
                        </div>
                        <div className={cx('classDM-modal-content-class-type-tag')}>
                            Learning
                        </div>
                    </div>
                    {get(classDetails, 'batch.allottedMentor', null) && (
                        <div className={cx('classDM-modal-content-mentor-profile')}>
                            <ImageBackground
                                className={cx('classDM-modal-content-mentor-profilePic')}
                                src={getPath(get(classDetails, 'batch.allottedMentor.profilePic.uri'))}
                                srcLegacy={getPath(get(classDetails, 'batch.allottedMentor.profilePic.uri'))}
                            />
                            <div className={cx('classDM-modal-content-mentor-profileDetails')}>
                                <div className={cx('classDM-modal-content-mentor-profile-name')}>
                                    {get(classDetails, 'mentorSession.user') ? get(classDetails, 'mentorSession.user.name') : get(classDetails, 'batch.allottedMentor.name', '-')}
                                </div>
                                <div className={cx('classDM-modal-content-mentor-profile-role')}>Mentor</div>
                            </div>
                        </div>
                    )}
                </div>
                <div className={cx('classDM-modal-content-topic-thumbnail-container')}>
                    <ImageBackground
                        className='classDM-modal-content-topic-thumbnail'
                        src={get(classDetails, 'previousTopic')
                        ?getPath(get(classDetails, 'previousTopic.thumbnailSmall.uri'))
                            : getPath(get(classDetails, 'topic.thumbnailSmall.uri'))}
                        srcLegacy={get(classDetails, 'previousTopic')
                            ? getPath(get(classDetails, 'previousTopic.thumbnailSmall.uri'))
                            : getPath(get(classDetails, 'topic.thumbnailSmall.uri'))}
                    />
                </div>
            </div>
            <div className={cx('classDM-modal-courseDetails-collapsible')}>
                <div
                    onClick={() => setCollapsibleVisible(!collapsibleVisible)}
                    className={cx('classDM-modal-courseDetails-collapsible-header')}
                >
                    Course Details
                    <div className={cx('classDM-modal-collapsible-dropdown-icon-closed', collapsibleVisible && 'classDM-modal-collapsible-dropdown-icon-open')} />
                </div>
                <div className={cx('classDM-modal-courseDetails-collapsible-content', collapsibleVisible && 'classDM-modal-courseDetails-collapsible-content-visible')}>
                    {renderCourseDetails({
                        title: 'Recurrence',
                        description: getSessionRecurrenceString(),
                        Icon: (props) => <ClassDetailRecurrenceIcon {...props} />
                    })}
                    {renderCourseDetails({
                        title: 'Batch',
                        description: get(classDetails, 'batch.code', '-'),
                        Icon: (props) => <ClassDetailBatchIcon {...props} />
                    })}
                    {renderCourseDetails({
                        title: 'Grade',
                        description: getSchoolGradeAndSection(),
                        Icon: (props) => <Grade {...props} />
                    })}
                    {renderCourseDetails({
                        title: 'Students',
                        description: get(classDetails, 'batch.studentsMeta.count', '-'),
                        Icon: (props) => <ClassDetailStudentsIcon {...props} />
                    })}
                </div>
            </div>
            {/* {get(classDetails, 'isPast', false) && (
                <div className={cx('classDM-modal-footer-container')}>
                    <button className={cx('classDM-modal-footer-btn')}>View Class Report</button>
                </div>
            )} */}
        </div>
    )
}

export default React.memo(ClassDetailsModal)