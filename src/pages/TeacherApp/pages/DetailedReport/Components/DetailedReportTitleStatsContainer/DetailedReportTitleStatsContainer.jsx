import React from "react";
import getColorBasedOnPercentage from "../../../../../../utils/teacherApp/getColorBasedOnPercentage";
import styles from './detailedReportTitleStatsContainer.module.scss'

const DetailedReportTitleStatsContainer = ({ headingTitle, questionCount, submittedPercentage=null, avgTries=null, showPercentage=true
 }) => {
    return (
        <div className={styles.reportStatsContainer}>
            <div
                className={styles.reportStatsContainerHeading}
                style={{ borderRight: !showPercentage ? 'none' : 'auto' }}
            >
                <p>{headingTitle}</p>
                <span className={styles.reportStatsContainerHeadingQuestionCount}>({questionCount} questions)</span>
            </div>
            <div className={styles.reportStatsContainerBody}>
                {showPercentage && submittedPercentage >= 0  ? (
                    <div className={styles.reportStatsContainerBodyData}>
                        <p style={{ color: getColorBasedOnPercentage(submittedPercentage) }}>{submittedPercentage}%</p>
                        <span>Avg. Submissions</span>
                    </div>
                ) : null}
                {avgTries > 0 ? (
                    <div className={styles.reportStatsContainerBodyData}>
                        <p>{avgTries}</p>
                        <span>Avg. TRIES</span>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

export default DetailedReportTitleStatsContainer