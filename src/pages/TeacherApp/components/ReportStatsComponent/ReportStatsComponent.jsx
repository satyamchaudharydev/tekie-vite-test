import { get } from "lodash";
import React from "react";
import ProgressCircle from "../../../../components/ProgressCircle";
import styles from './reportStatsComponent.module.scss'

const ReportStatsComponent = ({ title, percentage, fromIndividualStudentReport }) => {
    return (
        <div className={styles.classWorkSectionHeading}>
            {!fromIndividualStudentReport ? (
                <ProgressCircle
                    percentage={percentage}
                    sqSize={32}
                    strokeWidth={6}
                />
            ) : null}
            <div className={styles.classWorkSectionHeadingTitleContainer}>
                <h2>{title}</h2>
                {!fromIndividualStudentReport ? <p>{percentage}% Overall Submissions</p> : null}
                
            </div>
        </div>
    )
}

export default ReportStatsComponent