import React from 'react'
import { CalendarOutline, PieChartIcon, PerformanceIcon } from '../../../../../../constants/icons'
import { hs } from '../../../../../../utils/size'
import styles from './batchCarousel.module.scss'
import ProgressBar from './ProgressBar'
import ContentLoader from 'react-content-loader'
const OVERALL_ATTENDANCE = 'Overall Attendance'
const COURSE_PROGRESS = 'Course Progress'
// const CLASS_PERFORMANCE='Class Performance'
const DATA_POINTS = [
    // { label: NEXT_SESSION, icon: <Monitor color='#A8A7A7' height={hs(20)} width={hs(20)} /> },
    { label: OVERALL_ATTENDANCE, icon: <CalendarOutline color='#A8A7A7' height={hs(20)} width={hs(20)} /> },
    { label: COURSE_PROGRESS, icon: <PieChartIcon height={hs(20)} width={hs(20)} /> }
]


const returnColorBasedOnPercentage = (num) => {
    if (num >= 75) {
        return '#01AA93'
    } else if (num >= 40) {
        return '#FAAD14'
    } else {
        return '#D34B57'
    }
}

const DataPoint = (props) => {
    const { iconAndLabel: { label, icon }, dataPoints: { batchNextTopic,
        batchNextTopicTimeAndDay, batchAttendance, sessionProgress }, isClassNextSessionsLoading, isClassroomDetailsLoading } = props
    const getItemData = (label) => {
        switch (label) {
            case OVERALL_ATTENDANCE: {
                return (isClassNextSessionsLoading || isClassroomDetailsLoading) ? <ContentLoader
                    className={styles.progressSkeleton}
                    speed={1}
                    backgroundColor={'#f5f5f5'}
                    foregroundColor={'#dbdbdb'}
                    viewBox="0 0 100 4"
                >
                    <rect x="0" y="0" width="100px" height="4px" />

                </ContentLoader> : <p className={styles.percentage} style={{ color: returnColorBasedOnPercentage(batchAttendance) }}>{batchAttendance}%</p>
            }
            case COURSE_PROGRESS: {
                return <div style={{ display: 'flex', alignItems: 'center' }}>
                    <p className={styles.percentage} style={{ margin: '0', marginRight: '8px' }}>{sessionProgress}%</p>
                    {(isClassNextSessionsLoading || isClassroomDetailsLoading) ? <ContentLoader
                        className={styles.progressSkeleton}
                        speed={1}
                        backgroundColor={'#f5f5f5'}
                        foregroundColor={'#dbdbdb'}
                        viewBox="0 0 100 4"
                    >
                        <rect x="0" y="0" width="100px" height="4px" />

                    </ContentLoader> : <ProgressBar done={sessionProgress} fromReportCard/>}
                </div>
            }
            default: {
                throw new Error('Unhandled type of batch data point')
            }
        }
    }

    return <div className={styles.individualDataPointContainer}>
        <div className={styles.dataPointIcon}>{icon}</div>
        <div className={styles.dataPointLabelAndTextContainer}>
            <span className={styles.dataPointLabel}>{label}</span>
            <span className={styles.dataPointValue}>{getItemData(label)}</span>
        </div>
    </div>
}

const BatchData = (props) => {
    return <div className={styles.batchDataPointsContainer}>
        {DATA_POINTS.map(iconAndLabel => <DataPoint key={iconAndLabel.label} iconAndLabel={iconAndLabel} dataPoints={props.dataPoints} isClassNextSessionsLoading={props.isClassNextSessionsLoading} isClassroomDetailsLoading={props.isClassroomDetailsLoading} />)}
    </div>
}

export default BatchData