import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import styles from './reportQuestionStudentTabs.module.scss'

const PresentAbsentTabs = ({ tabsData = [], activeTabKey, onTabSwitch = () => {}, fromStudentReport = false, fromDetailedReport = false }) => {
  const [activeTab, setActiveTab] = useState(activeTabKey)
  const onTabClick = (loId) => {
    onTabSwitch(loId)
  }
    useEffect(() => {
        setActiveTab(activeTabKey)
    }, [activeTabKey])
  let loTitle = ''
  if (fromStudentReport) {
    let loTitleLen = 0
    for (const tabValue of tabsData) {
      if (loTitleLen < tabValue.label.length) {
        loTitleLen = tabValue.label.length
        loTitle = tabValue.label
      }
    }
  }
  if (fromStudentReport) {
    return (
      <div className={styles.tabsWrapperOther}>
        {tabsData.map(tab => (
          <div
            onClick={() => onTabClick(tab.value)}
            className={cx(styles.attendanceTab, activeTab === tab.value
              && styles.activeTab, tabsData.length === 1
              && styles.singletab, styles.reportLoTabs, fromDetailedReport && styles.noMargin)}
          >
            {loTitle === tab.label ? tab.label : (<><span className={styles.hiddenLoTitle}>{loTitle}</span><span className={styles.actualLoTitle}>{tab.label}</span></>)}
          </div>
        ))}
    </div>
    )
  }
  return (
    <div className={styles.tabsWrapperOther}>
        {tabsData.map(tab => (
          <div onClick={() => onTabClick(tab.value)}
            className={cx(styles.attendanceTab, activeTab === tab.value && styles.activeTab, tabsData.length === 1 && styles.singletab, fromDetailedReport && styles.noMargin)}>
              <span>{tab.label}</span>
            </div>
        ))}
    </div>
  )
}

export default PresentAbsentTabs