import React from 'react'
import { Link } from 'react-router-dom'
import Button from '../../../../components/Button/Button'
import styles from './batchCarousel.module.scss'
import BatchData from './BatchData'

const BatchCard = (props) => {
    const { batch: { batchId,
        classroomTitle,
        batchCount,
        batchThumbnail,
        batchNextTopic,
        batchNextTopicTimeAndDay,
        batchAttendance, sessionProgress }, isClassNextSessionsLoading, isClassroomDetailsLoading } = props

    const styleClassroomTitle = (title) => {
        const splitGrade = title.split(' ')
        if (splitGrade.length > 2) {
            return title
        }
        if (splitGrade[1]) {
            const section = splitGrade[1].split('').join('-')
            return `${splitGrade[0]} ${section}`
        }
    }
        
    return <> <div className={styles.batchCardContainer}>
        <div className={styles.thumbnailAndBatchDetailsContainer}>
            <div className={styles.batchDetailsContainer}>
                <div className={styles.batchCardHeadingContainer}>
                    <h4 className={styles.batchGradeSection}>{styleClassroomTitle(classroomTitle)}</h4>
                    <p className={styles.batchStrength}>({batchCount} {batchCount > 0 ? `Student${batchCount>1?'s':''}` : 'Students'})</p>
                </div>
                <BatchData dataPoints={{
                    batchNextTopic,
                    batchNextTopicTimeAndDay, batchAttendance, sessionProgress
                }} isClassNextSessionsLoading={isClassNextSessionsLoading} isClassroomDetailsLoading={isClassroomDetailsLoading} />
            </div>
        </div>

        <footer className={styles.batchCardFooter}>
            <Link to={`reports/classroom/${batchId}`} className={styles.removeLinkStyles}> <Button text={'View Reports'} widthFull /> </Link>
        </footer>
    </div>
    </>
}

export default BatchCard