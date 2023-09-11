import React from 'react'
import { AlertCircleSharp} from '../../../../constants/icons'
import styles from "./DetailedReport.module.scss";

const DetailedReportEmptyState = ({ text }) => {
    return <div className={styles.emptyStateContainer}>
        <div className={styles.emptyStateIcon}>
            <AlertCircleSharp height='16' width='16'/>
        </div>
        <p>{text}</p>
    </div>
}
export default DetailedReportEmptyState