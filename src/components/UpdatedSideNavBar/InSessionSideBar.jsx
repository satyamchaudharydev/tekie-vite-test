import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimateSharedLayout, AnimatePresence } from 'framer-motion'
import styles from  './MainSideBar.module.scss'
import cx from 'classnames'
import getMe from '../../utils/getMe'
import { debounce, get } from 'lodash'
import { gradeOptions } from '../../pages/TeacherApp/components/Dropdowns/fillerData'
import { checkIfEmbedEnabled, getEmbedData, isAccessingTeacherTraining } from '../../utils/teacherApp/checkForEmbed'
import { ProfilePicture, Dropdown } from '../NavBar/ProfileIcon'
import {
  ArrowLeft,
  SessionPageIcon,
  HomeworkPageIcon, 
  CodePlaygroundPageIcon
} from './mainSideBarIcons'
import ConditionalLink from '../ConditionalLink'
import getPath from '../../utils/getPath'
import {
  getInSessionSideBarRule,
  getFilteredTopicComponentRule,
  getFilteredLoComponentSidebarItem,
} from './utils'
import { HOMEWORK_COMPONENTS, TOPIC_COMPONENTS } from '../../constants/topicComponentConstants'
import { useHistory } from 'react-router'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { getThisSession } from '../../pages/UpdatedSessions/utils'
import fetchComponents from '../../queries/fetchComponents'
import HomeworkProgress from './HomeworkProgress'
import SubmitOverlayMenu from '../../pages/UpdatedSessions/Quiz/components/SubmitOverlayMenu'
import useOnClickOutside from '../../hooks/useOnClickOutside'
import LearningResources from './LearningResources'
import goBackToTeacherApp from '../../utils/teacherApp/goBackToTeacherApp'
import sessionComponentTracker from './sessionComponentTracker'
import UserProfile from './UserProfile'
import StudentActivityComponent from './StudentActivityComponent'
import hs, { hsFor1280 } from '../../utils/scale'
import Information from './Information'
import FETCH_SESSION_COMPONENT_TRACKER from '../../queries/componentQueries/FETCH_SESSION_COMPONENT_TRACKER'
import { getDataFromLocalStorage } from '../../utils/data-utils'
import getClassworkSummary from '../../queries/teacherApp/getClassworkSummary'
import { fireGtmEvent } from '../../utils/analytics/gtmActions'
import { gtmEvents } from '../../utils/analytics/gtmEvents'
import store from '../../store'
import { getUserParams } from '../../utils/getUserParams'
import { HOMEWORK_URL, SESSIONS_URL } from '../../constants/routes/routesPaths'

const ArrowRight = () => (
  <svg viewBox="0 0 14 8" width='100%' height='100%' fill="none" className={styles.arrowSVG}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M.293.293a1 1 0 011.414 0L7 5.586 12.293.293a1 1 0 111.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414z"
    />
  </svg>
)

const CompletedIcon = () => (
  <svg width={hs(26)} height={hs(26)} viewBox="0 0 21 20" fill="#01AA93" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M20.5 10C20.5 15.5228 16.0228 20 10.5 20C4.97715 20 0.5 15.5228 0.5 10C0.5 4.47715 4.97715 0 10.5 0C16.0228 0 20.5 4.47715 20.5 10ZM14.5303 6.96967C14.8232 7.26256 14.8232 7.73744 14.5303 8.03033L9.53033 13.0303C9.23744 13.3232 8.76256 13.3232 8.46967 13.0303L6.46967 11.0303C6.17678 10.7374 6.17678 10.2626 6.46967 9.96967C6.76256 9.67678 7.23744 9.67678 7.53033 9.96967L9 11.4393L11.2348 9.2045L13.4697 6.96967C13.7626 6.67678 14.2374 6.67678 14.5303 6.96967Z" fill="#01AA93"/>
  </svg>
)

const InSessionSideBar = props => {
  let activityToggleData = JSON.parse(localStorage.getItem('activityToggleData')) || {}
  const batchSessionId = props.batchSessionData && get(props.batchSessionData,'id')
  const [isProfileAndSettingsDropdownVisible, setIsProfileAndSettingsDropdownVisible] = useState(false)
  const [topic, setTopic] = useState({})
  const [showModal,setShowModal] = useState(false)
  const [showStudentActivity, setShowStudentActivity] = useState((activityToggleData[batchSessionId] && activityToggleData[batchSessionId].activityToggle) || false)
  const [navBarClickQueue,setNavBarClickQueue] = useState([])
  const [isNavMount,setIsNavMount] = useState(false)
  const [isStudentActivityLoading,setIsStudentActivityLoading] = useState(true)
  const history = useHistory()
  const dispatch = useDispatch()
  const dropdownRef = React.useRef(null)
  const [previousLink,setPreviousLink] = useState(window.location.href)

  const {
    currentRoute,
    visible, 
    courseDefaultLoComponentRule,
    courseId,
    topicId,
    revisitString,
    userBlockBasedPractices,
  } = props

  const sessionDetails = getDataFromLocalStorage("classroomSessionsData")
  const componentName = get(sessionDetails, 'componentName')
  const sessionId = get(sessionDetails, 'sessionId')
  const isRevisit = get(sessionDetails, 'isRevisit', false)
  const isRevisitingSession = ['true', 'True', true].includes(isRevisit)
  const isViewingHomework = componentName && [...HOMEWORK_COMPONENTS].includes(componentName)
  const isInLiveSession = !isRevisitingSession && sessionId && !isViewingHomework
  const classType = get(topic, 'classType')
  let topicComponentRule = get(topic, 'topicComponentRule')
  
  if(classType === 'theory'){
      topicComponentRule = topicComponentRule.filter(item => item.componentName === 'video')
  }
  const sidebar = getInSessionSideBarRule(
    topicComponentRule,
    courseDefaultLoComponentRule,
    courseId,
    topicId,
    revisitString,
    !(currentRoute.indexOf('homework') !== -1 ||
    (currentRoute.indexOf('quiz-report-latest') !== -1 && currentRoute.indexOf('sessions') === -1)),
    get(
      getThisSession(topicId), 
      'previousHomeworkExists'
    ) && !revisitString
  )
  useOnClickOutside(dropdownRef, () => setIsProfileAndSettingsDropdownVisible(false))
  
  const checkIfBlockBasedProjectHasSubmitOption = () => {
    let blockBasedProjectsHasSubmitAnswer = false
    // eslint-disable-next-line array-callback-return
    sidebar && sidebar.map(item => {
      if(item.type === 'blockBasedPractice'){
        // eslint-disable-next-line array-callback-return
        item.blockBasedProjects && item.blockBasedProjects.map(blockBasedProject => {
          if(blockBasedProject.isSubmitAnswer === true){
            blockBasedProjectsHasSubmitAnswer = true
          }
        })
      }
    })
    return blockBasedProjectsHasSubmitAnswer
  }

  useEffect(()=>{
    const userParams = getGTMParams()
    fireGtmEvent(gtmEvents.inSessionPageVisit,{userParams})
  },[])
  
  useEffect(()=>{
    if(batchSessionId && activityToggleData[batchSessionId]){
      setShowStudentActivity((activityToggleData[batchSessionId] && activityToggleData[batchSessionId].activityToggle) || showStudentActivity)
    }
  },[batchSessionId])

  useEffect(()=>{
    if(window.location.href !== previousLink){
      setIsNavMount(false)
      setPreviousLink(window.location.href)
    }
    // eslint-disable-next-line array-callback-return
    sidebar.map((item, index) => {
      if(item && isActive(item) && !isNavMount) {
        // eslint-disable-next-line array-callback-return
        getFilteredLoComponentSidebarItem(get(item,'childComponents',[]).map(childComponent => {
        let itemData = []
        itemData.push(childComponent)
        sessionComponentTracker(itemData,isInLiveSession)
        itemData = []
        setIsNavMount(true)
        }))
        let itemData = []
        itemData.push(item)
        sessionComponentTracker(itemData,isInLiveSession)
        itemData = []
        setIsNavMount(true)
      }
    })
  },[sidebar])

  // useEffect(()=>{
  //   const classroomSessionsData = getDataFromLocalStorage('classroomSessionsData')
  //   const batchId = get(classroomSessionsData,'batchId')
  //   const topicId = get(classroomSessionsData,'topicId')
  //   let timer
  //     timer = setInterval(async() => showStudentActivity && await getClassworkSummary(batchId,topicId),API_CALL_TIME);
  //     return () => clearTimeout(timer)
  // },[showStudentActivity])
  
  useEffect(()=>{
    const debouncedNavbarClickedCallback = debounce(async() => {
      navBarClickQueue && navBarClickQueue.forEach((type) => {
        const itemData = sidebar.filter(item => item.type === type)
        sessionComponentTracker(itemData,isInLiveSession)
      })
      setNavBarClickQueue([])
    },5000) 
    debouncedNavbarClickedCallback()
  },[navBarClickQueue])

  useEffect(async ()=>{
    const batchConnectId = localStorage.getItem('currentSessionId')
    await FETCH_SESSION_COMPONENT_TRACKER({batchConnectId})
  },[])

  useEffect(() => {
    if (props.topicId) {
      mountInSessionFlow()
    }
  }, [props.topicId])

  const isSubmittedForReview = props.mentorMenteeSession && props.mentorMenteeSession.getIn([0, 'isSubmittedForReview'])
  let batchSessionStatus = props.batchSessionFetchStatus && props.batchSessionFetchStatus.getIn(['success'])
  if(batchSessionStatus){
    if(isStudentActivityLoading)  setIsStudentActivityLoading(false)
  }

  const onDropDownParentClick = (config) => async() => {
    // get first childComponent config
    const firstChildLink = get(config, 'childComponents.0.link', {})
    history.push(firstChildLink)
    const classroomSessionsData = getDataFromLocalStorage('classroomSessionsData')
    const batchId = get(classroomSessionsData,'batchId')
    const topicId = get(classroomSessionsData,'topicId')
    if(checkIfEmbedEnabled()){
      await getClassworkSummary(batchId,topicId)
    }
  }

  const isSidebarVisited = (navType,item) => {
    if(item && item.navType === 'parent'){
      navType = 'learningObjective'
    }
    const batchSessionData = props.batchSessionData;
    const sessionComponentTrackers = get(batchSessionData,'sessionComponentTracker')
    const visitedComponents = get(sessionComponentTrackers,'componentStatus')
    let isVisited = false
    // eslint-disable-next-line array-callback-return
    visitedComponents && visitedComponents.map((visitedComponent)=>{
      if(get(visitedComponent,'componentName','') === navType){
        isVisited = true
      }
    })
    return isVisited
  }

  const getGTMParams = () => {
    const classroomSessionsData = getDataFromLocalStorage('classroomSessionsData')
    const batchId = get(classroomSessionsData,'batchId')
    const { topicId, courseId } = props
    const userParams = {
      ...getUserParams(),
      topicId: topicId,
      courseId: courseId,
      batchId: batchId,
    }
    return userParams
  }

  const stripLastId = (url) => {
    const urlArray = url.split('/')
    urlArray.pop()
    return urlArray.join('/')
  }

  const isBlockBasedPraticeActive = (config) => {
    const { currentRoute } = props
    if (config.type === TOPIC_COMPONENTS.homeworkPractice || config.type === TOPIC_COMPONENTS.blockBasedPractice) {
      if (config.blockBasedProjects) {
        const match = !!(config.blockBasedProjects.find(project => project.link === currentRoute))
        return match
      }
    }
    return false
  }

  const isActive = (config, l) => {
    const { currentRoute } = props
    if (config.navType === 'root') {
      return (
        config.link === currentRoute || 
        config.link === stripLastId(currentRoute) || 
        isBlockBasedPraticeActive(config)
      )
    }
    
    if (config.navType === 'parent') {
      for (const childComponent of config.childComponents) {
        if (
          currentRoute === childComponent.link || 
          currentRoute === stripLastId(childComponent.link)
        ) {
          return true
        }
      }
    }
    return false
  }

  const mountInSessionFlow = async () => {
    const topicComponentRule = getFilteredTopicComponentRule(get(topic, 'topicComponentRule'))
    const firstLoId = get(topicComponentRule, 'learningObjective[0].id')

    const { topicId, courseId } = props
    if (topicId) {
      const topic = await fetchComponents(topicId).componentRule()   
      setTopic(topic)
    }
  }

  if (!visible) return <></>

  const me = getMe()
  const studentName = get(me, 'name')
  
  const handleToggle = () =>{
    const userParams = getGTMParams()
    if(showStudentActivity){
      fireGtmEvent(gtmEvents.studentActivityToggleOff,{userParams})
    }else{
      fireGtmEvent(gtmEvents.studentActivityToggleOn,{userParams})
    }
    setShowStudentActivity(!showStudentActivity)
    isActivityToggleSet()
  }

  const checkForScrollBarShouldShow = () => {
    let hasLearningObjective = false;
    if(sidebar && sidebar.length > 2){
      for (let i = 0; i < sidebar.length; i++) {
        if (sidebar[i].type === 'learningObjective') {
          hasLearningObjective = true;
        } else if (sidebar[i].type === 'learningSlide') {
          hasLearningObjective = true;
        }
      }
    }else if(sidebar && sidebar.length >3){
      hasLearningObjective = true
    }
    return hasLearningObjective
  }
  const navbarClicked = (type) =>{
    setNavBarClickQueue((prevState) => {
      let navBarClickQueue = prevState

      if (prevState && prevState.length) {
        if (!prevState.includes(type)) {
          navBarClickQueue.push(type)
        }
      } else {
        navBarClickQueue = [type]
      }
        return navBarClickQueue
    } 
    )
  }

  const isActivityToggleSet = () => {
    const batchSessionId = props.batchSessionData && get(props.batchSessionData,'id')
    let activityToggleData = JSON.parse(localStorage.getItem('activityToggleData')) || {}
    if(batchSessionId && activityToggleData[batchSessionId]){
      activityToggleData[batchSessionId] = {activityToggle:!showStudentActivity}
    }else if(batchSessionId){
      activityToggleData[batchSessionId] = {activityToggle: !showStudentActivity}
    }
    localStorage.setItem('activityToggleData',JSON.stringify(activityToggleData))
  }

  const getLearningResourcesData = () => {
    let coursePackages = window.store.getState().data.getIn(["coursePackages","data"]).toJS()
    let coursesData
    coursesData = coursePackages.map(coursePackage => {
        const coursesData = get(coursePackage,'courses') || get(coursePackage, 'coursesData')
        return coursesData && coursesData.filter(course => course.id === courseId)
    })
    coursesData = get(coursesData,'[0].[0].codingLanguages')
    let coursesUniqueValue = []
    coursesData && coursesData.map(courseData => {
        const courseValue = (get(courseData,'value', '') || '').toLowerCase()
        if (courseValue && courseValue !== 'java') {
            coursesUniqueValue.push(courseData.value)
        }
        return ''
    })
    coursesUniqueValue = [...new Set(coursesUniqueValue)]
    return coursesUniqueValue
  }

  const renderBackButton = () => {
    if (checkIfEmbedEnabled()) {
      if (isAccessingTeacherTraining()) {
        return <div className={styles.backButton} onClick={() => goBackToTeacherApp('backToTraining')}>
            <ArrowLeft />
          </div>
      }
      return null
    }
    return <div className={styles.backButton} onClick={() => {
        if (currentRoute.includes('session')) {
          history.push(SESSIONS_URL)
        } else if (currentRoute.includes('homework') || currentRoute.includes('quiz-report-latest')) {
          history.push(HOMEWORK_URL)
        }
      }}>
        <ArrowLeft />
      </div>
  }

  return (
    <motion.div
      initial={{ opacity: visible ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1}}
      class={styles.sidebar}>
      <div
       className={styles.sideBarTopPart}>
          <div className={styles.flex}>
            {renderBackButton()}
            <div
              className={styles.topicThumbnail}
              style={{ backgroundImage: `url(${getPath(get(topic, 'thumbnailSmall.uri'))})` }}
            ></div>
          </div>
          <div className={styles.topicTitle}>{get(topic, 'title')}</div>
        </div>
      <div class={styles.content}>
      <AnimateSharedLayout>
            {sidebar.map((item, index) => (
              <motion.div
                className={styles.sideBarNavWrapper}
                layout={item.navType === 'parent'  ? false  : true}
                transition={{
                  layout: { duration: 0.1}
                }}
                style={{ position: 'relative' }}
                onClick={() => navbarClicked(item.type)}
              >
                <ConditionalLink
                  className={cx(styles.sideBarNavItemParent, 
                    {
                      [styles.assignment]: showStudentActivity && (item.type === 'assignment' || (item.type === 'blockBasedPractice' && checkIfBlockBasedProjectHasSubmitOption())),
                    },
                    isActive(item) && styles.active,
                    checkIfEmbedEnabled() && styles.borderOnSidebar
                    )
                  }
                  to={item.link}
                  isLink={item.navType !== 'parent'}
                  onClickIfNotLink={onDropDownParentClick(item)}
                  style={{ textDecoration: 'none', height: `${(showStudentActivity && item.navType !== 'parent' &&  item.type !== "homeworkDiscussion" ) ? hs(81) : hs(60)}` }}
                  title={item.navType === 'parent' ? item.title : ''}
                >
                  <div style={{display:'flex',flexDirection:'row',marginTop: showStudentActivity  && item.navType !== 'parent' &&  item.type !== "homeworkDiscussion" && hs(18)}}>
                    <div className={
                      cx(styles.icon,isSidebarVisited(item.type,item) && checkIfEmbedEnabled() && styles.visitedIcon)}>
                      {(isSidebarVisited(item.type,item)) && checkIfEmbedEnabled() ? <CompletedIcon /> :  <item.icon />}
                    </div>
                    <div className={styles.textContainer}>
                      <span className={styles.sideBarNavText}>{item.title}</span>
                      {(showStudentActivity && (item.navType !== 'parent' && item.type !== "homeworkDiscussion")) && <Information type='visited' navType={item.type}/>}
                      {(item.type === 'assignment' || (item.type === 'blockBasedPractice' && checkIfBlockBasedProjectHasSubmitOption())) && showStudentActivity && <Information type='submissionWithoutScore' navType={item.type}/>}
                    </div>
                  </div>
                  
                    {item.navType === 'parent' ? (
                      <motion.div 
                        className={styles.arrow}
                        initial={{ rotate: isActive(item) ? 0 : -90 }}
                        animate={{ rotate: isActive(item) ? 0 : -90 }}
                      >
                        <ArrowRight />
                      </motion.div>
                    ) : null}
                    {(item.navType !== 'parent' && isActive(item)) &&  (
                      <motion.div 
                        className={styles.activeLineIndicator}
                        initial={{ right: 0 }}
                        layoutId="activeIndicatorInSession"
                      ></motion.div>
                    )}
                </ConditionalLink>
                  {item.navType === 'parent' ? (
                    <AnimatePresence>
                      {isActive(item) && (
                        <motion.div
                          className={styles.sideBarNavItemChildContainer}
                          initial={{ opacity: isActive(item) ? 1 : 0, y: 0 }}
                          animate={{ opacity: isActive(item) ? 1 : 0, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.1 }}
                          layout
                      >
                          {getFilteredLoComponentSidebarItem(item.childComponents).map(childComponent => (
                            <>
                            <Link
                              className={cx(
                                styles.sideBarNavItemChild,
                                {
                                [styles.dirRow]: showStudentActivity && childComponent.type === 'practiceReport',
                                },
                                isActive(childComponent) && styles.active,
                                checkIfEmbedEnabled() && styles.borderOnSidebar
                              )}
                              to={childComponent.link}
                              onClick={() => navbarClicked(childComponent.type)}
                              style={{ textDecoration: 'none', position: 'relative',height: `${showStudentActivity ? hs(81): hs(60)}` }}
                            >

                                <div style={{display:'flex',flexDirection:'row',marginTop: showStudentActivity && hs(18)}}>
                                  <div className={
                                    cx(styles.icon,isSidebarVisited(item.type) && checkIfEmbedEnabled() && styles.visitedIcon)
                                  }>
                                    {((isSidebarVisited(childComponent.type) )) && checkIfEmbedEnabled() ? <CompletedIcon /> : <childComponent.icon />}
                                  </div>
                                  <div style={{}}>
                                    <span className={styles.sideBarNavText}>{childComponent.title}</span>
                                    {(showStudentActivity && childComponent.type !== "practiceReport") && <Information type='visited' navType={item.type}/>}
                                  </div>
                                </div>
                                {isActive(childComponent) && (
                                  <motion.div 
                                    className={styles.activeLineIndicator}
                                    initial={{ right: 0 }}
                                    layoutId="activeIndicatorInSession"
                                  ></motion.div>
                                )}
                              {(showStudentActivity && childComponent.type === 'practiceReport') && <Information type='submissionWithScore'/> }
                            </Link>
                            
                            </>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                ) : null}
              </motion.div>
            ))}
          </AnimateSharedLayout>
      </div>
      <div class={styles.footer}>
      { currentRoute.includes('homework') && !currentRoute.includes('quiz-report-latest') && !isSubmittedForReview && !checkIfEmbedEnabled() && <>
              <HomeworkProgress
                topicId={topicId}
                onSubmit={() => setShowModal(true)}
                homeWorkMeta={props.homeWorkMeta}
                courseId={courseId}
                showSubmit={!isSubmittedForReview}
                topic={topic}
                {...props}
                
              />
              <SubmitOverlayMenu
                title='Submit for Review'
                visible={showModal}
                topic={topic}
                onQuizSubmit={() => {}}
                closeOverlay={() => setShowModal(false)}
                submitForReviewOverlay={false}
                closeImmediately={true}
                onSubmitForReview={() => {}}
                isHomeworkComplete={true}
                userFirstAndLatestQuizReport={props.userFirstAndLatestQuizReport}
                userBlockBasedPractices={userBlockBasedPractices}
                userId={get(me, 'id')}
                topicId={topicId}
                courseId={courseId}
                topicComponentRule={get(topic, 'topicComponentRule')}
                history={history}
                mentorMenteeSessionUpdateStatus={props.mentorMenteeSessionUpdateStatus}
                mentorMenteeSession={props.mentorMenteeSession}

              
              />
                

  </>}
      <div className={styles.profileAndResourcesContainer}>
          <LearningResources topicId={topicId} courseId={courseId} />
          {checkIfEmbedEnabled() && isInLiveSession && <StudentActivityComponent showStudentActivity={showStudentActivity} handleToggle={handleToggle} isStudentActivityLoading={isStudentActivityLoading}/>}
        {!checkIfEmbedEnabled() ? (
          <motion.div
            ref={dropdownRef}
            className={styles.profileAndSettingsContainer}
            onClick={() => setIsProfileAndSettingsDropdownVisible(!isProfileAndSettingsDropdownVisible)}
            onHoverStart={() => setIsProfileAndSettingsDropdownVisible(true)}
            onHoverEnd={() => setIsProfileAndSettingsDropdownVisible(false)}
          >
            <UserProfile
              users={props.loggedInUser.toJS()}
            ></UserProfile>
            <div className={styles.profileRightArrow}>
              <ArrowRight />
            </div>
            <Dropdown
              isVisible={isProfileAndSettingsDropdownVisible}
              containerClassName={styles.profileAndSettingsDropdown}
              history={history}
              users={props.loggedInUser.toJS()}
              logout={() => {
                store.dispatch({ type: 'LOGOUT' })
                history.push('/')
              }}
            />
          </motion.div>
        ) : null}
      </div>
      </div>
</motion.div>
  )
}

export default InSessionSideBar
