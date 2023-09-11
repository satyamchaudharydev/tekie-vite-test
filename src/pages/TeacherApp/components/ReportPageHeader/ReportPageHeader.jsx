import get from 'lodash/get'
import React from 'react'
import cx from 'classnames'
import { ClassroomIcon, NextArrowIcon } from '../svg'
import styles from './reportPageHeader.module.scss'
import { useHistory } from 'react-router'

const ReportPageHeader = ({
    batchDetail = {},
    topicDetail = {},
  activeTabName = 'Student Performance',
    fromQuestionPage = false
}) => {
  const history = useHistory()
  if (fromQuestionPage) {
    return (
      <div className={styles.reportPageHeader}>
        <div className={styles.classroomIconDiv}>
          <ClassroomIcon className={styles.classroomIcon} />
        </div>
        <NextArrowIcon className={styles.nextArrowIcon} />
        <span
        className={cx(styles.headerText, styles.active, styles.paginationStyles)}
        >Question Paper</span>
      </div>
    )
  }
  return (
    <div className={styles.reportPageHeader}>
        <div className={styles.classroomIconDiv} onClick={() => history.push(`/teacher/reports`)}>
          <ClassroomIcon className={styles.classroomIcon} />
        </div>
        <NextArrowIcon className={styles.nextArrowIcon} /> 
        <span 
        onClick={()=> history.push(`/teacher/reports/classroom/${get(batchDetail, 'id')}`)}
        className={cx(styles.headerText, activeTabName === 'classroom' && styles.active, styles.paginationStyles)}
        >{get(batchDetail, 'classroomTitle')}</span>
        <NextArrowIcon className={styles.nextArrowIcon} />
        <span className={cx(styles.headerText, activeTabName === 'classroom' && styles.active, styles.topicName)}>{get(topicDetail, 'title')}</span>
        {/* <NextArrowIcon className={styles.nextArrowIcon} />
        <span className={cx(styles.headerText, styles.active)}>Detailed Report</span> */}
      </div>
  )
}

export default ReportPageHeader