import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { motion } from 'framer-motion'
import styles from  './MainSideBar.module.scss'
import { checkIfEmbedEnabled, getEmbedData, isAccessingTeacherTraining } from '../../utils/teacherApp/checkForEmbed'
import InSessionSideBar from './InSessionSideBar'
import AppSideBar from './AppSideBar'
import { backToPageConst } from '../../pages/TeacherApp/constants'

const MainSideBar = props => {
  const [isOutSideNav, setIsOutSideNav] = useState(
    props.outSideNav
  )
  const [isAppSideBarVisible, setIsAppSideBarVisible] = useState(props.outSideNav)
  const [isInSessionSideBarVisible, setIsInSessionSideBarVisible] = useState(
    !props.outSideNav
  )
    console.log(props)
  useEffect(() => {
    let appSideBarVisibleTimeouts = []
    let inSessionSideBarVisibleTimeouts = []
    if (props.outSideNav) {
      for (let timeout of appSideBarVisibleTimeouts) {
        clearTimeout(timeout)
      }
      for (let timeout of inSessionSideBarVisibleTimeouts) {
        clearTimeout(timeout)
      }
      // we want to delay to render the child component to avoid the flicker
      // Hence cluster-mess of multiple useStates for the same purpose
      // Should be refactored to avoid this mess and setTimeout if possible
      setIsInSessionSideBarVisible(false)
      setIsOutSideNav(true)
      appSideBarVisibleTimeouts.push(setTimeout(() => {
        if (props.outSideNav) {
          setIsAppSideBarVisible(true)
        }
      }, 300))
    } else {
      for (let timeout of appSideBarVisibleTimeouts) {
        clearTimeout(timeout)
      }
      for (let timeout of inSessionSideBarVisibleTimeouts) {
        clearTimeout(timeout)
      }
      setIsAppSideBarVisible(false)
      setIsOutSideNav(false)
      inSessionSideBarVisibleTimeouts.push(setTimeout(() => {
        if (!props.outSideNav) {
          setIsInSessionSideBarVisible(true)
        }
      }, 400))
    }
  }, [props.outSideNav])
  return (
    <motion.div className={cx(
      styles.container,
      isOutSideNav && styles.outSideNav,
      checkIfEmbedEnabled() && styles.outSideNavForTeacherApp,
      isAccessingTeacherTraining() && styles.outSideNavForTrainingApp
    )} layout transition={{
      type: 'tween',
      // duration: isOutSideNav ? 0.3 : 0.5,
    }}>
        <AppSideBar
          currentRoute={props.currentRoute}
          coursePackages={props.coursePackages.toJS()}
          visible={isAppSideBarVisible}
          menteeCourseSyllabus={props.menteeCourseSyllabus}
        />
        <InSessionSideBar
          {...props}
          visible={isInSessionSideBarVisible}
        
        />
    </motion.div>
  )
}

export default MainSideBar