import React, { useEffect, useState } from 'react'
import styles from "./reportQuestionStudentTabs.module.scss"
import { useHistory, useParams, useLocation } from 'react-router-dom'
import cx from 'classnames'
import get from 'lodash/get'

const ReportQuestionStudentTabs = () => {
  const [activeSlide, setActiveSlide] = useState(0)
  const params = useParams()
  const history = useHistory()
  const location = useLocation()
  useEffect(() => {
    let slideIndex = 0
    if (get(location, 'pathname').includes('student-level')) slideIndex = 1
    setActiveSlide(slideIndex)
  }, [get(location, 'pathname')])
  const onTabClick = (tabIndex) => {
    let tabName = 'question-level'
    if (tabIndex === 1) tabName = 'student-level'
    history.push(`/teacher/reports/classroom/${get(params, 'sessionId')}/${tabName}?fromStudentLevelReport=true`)
    setActiveSlide(tabIndex)
  }
  return (
    <div className={styles.tabsWrapper}>
      <nav className={styles.tabs}>
          <span onClick={() => onTabClick(0)} className={cx(styles.tab, styles.afterSlide, activeSlide === 0 && styles.isActive)} data-target="1">Class Performance</span>
          <span onClick={() => onTabClick(1)} className={cx(styles.tab, styles.beforeSlide, activeSlide === 1 && styles.isActive)} data-target="2">Student Performance</span>
      </nav>
      <div className={styles.tabsHrLine}></div>
    </div>
  )
}

export default ReportQuestionStudentTabs