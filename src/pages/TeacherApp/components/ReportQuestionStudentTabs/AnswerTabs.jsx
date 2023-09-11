import React, { useEffect, useState } from 'react'
import styles from "./AnswerTabs.module.scss"
import cx from 'classnames'

const AnswerTabs = ({ selectedAnswerType, onTabClick = () =>{} }) => {
  const [activeSlide, setActiveSlide] = useState(0)
  useEffect(() => {
    let slideIndex = 0
    if (selectedAnswerType === 'correct') slideIndex = 1
    setActiveSlide(slideIndex)
  }, [selectedAnswerType])
  const onTabClickHandler = (e, tabIndex) => {
      let tabName = 'student'
    if (tabIndex === 1) tabName = 'correct'
      onTabClick(e, tabName)
      setActiveSlide(tabIndex)
  }
  return (
    <div className={styles.tabsWrapper}>
      <nav className={styles.tabs}>
        <span onClick={(e) => onTabClickHandler(e, 0)} className={cx(styles.tab, styles.afterSlide, activeSlide === 0 && (styles.isActive, styles.tab1))} data-target="1">Student Answer</span>
        <span onClick={(e) => onTabClickHandler(e, 1)} className={cx(styles.tab, styles.beforeSlide, activeSlide === 1 && (styles.isActive, styles.tab2))} data-target="2">Correct Answer</span>
      </nav>
    </div>
  )
}

export default AnswerTabs