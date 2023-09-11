import { get } from 'lodash'
import React from 'react'
import { useState } from 'react'
import { Figma } from '../../../../constants/icons'
import { hs } from '../../../../utils/size'
import getFullPath from '../../../../utils/getFullPath'
import styles from './CoursePill.module.scss'
import { useEffect } from 'react'


const CoursePill = (props) => {
  const [courseChecked, setCourseChecked] = useState('')
  const {course,selectCourse,selectedCourse, totalCourses = 0, onRadioButtonClick = () => {}}=props

  const selectCourseValue = (e) => {
    setCourseChecked(e.target.value)
    selectCourse(e)
  }
  useEffect(() => {
    if (!selectedCourse && courseChecked) setCourseChecked('')
  }, [selectedCourse])

  return (
    
 <label htmlFor={get(course, 'id')} style={{fontWeight:(!selectedCourse || courseChecked!==selectedCourse) && '600'}} className={`${styles.pillContainer} ${selectedCourse && courseChecked===selectedCourse && styles.courseChecked} ${!get(course,'thumbnailSmall') && styles.adjustRightPadding}`}>
    <input checked={selectedCourse && courseChecked===selectedCourse} value={get(course, 'id')} onClick={() => totalCourses === 1 ? onRadioButtonClick() : () => {}} onChange={(e) => selectCourseValue(e)} className={styles.checkbox} type="radio" name="course" id={get(course, 'id')} />
    {get(course,'thumbnailSmall')?<div className={`${styles.iconContainer} ${courseChecked && styles.iconChecked}`}>
      <img style={{ height: 20, objectFit: 'contain' }} src={getFullPath(get(course,'thumbnailSmall.uri'))} alt='course-logo'/>
    </div>:null}
    <span htmlFor="course">{get(course,'courseDisplayName') || get(course,'title')}</span>
  </label>
 
   
  )
}

export default CoursePill
