import React from 'react'
import { AlertCircleSharp } from '../../../../../constants/icons'
import styles from './classroomDetails.module.scss'
const NoSessionsEmptyState = ({text,hasClassworkSummaryReportLoaded}) => {
    if(!hasClassworkSummaryReportLoaded) return null
    return <>
        <div className={styles.noSessionsEmptyStateContainer}>
            <div>
                <div className={styles.alertCircleContainer}>
                    <AlertCircleSharp />
                </div>
                <p>{text}</p>
            </div>
        </div>
    </>
}

export default NoSessionsEmptyState