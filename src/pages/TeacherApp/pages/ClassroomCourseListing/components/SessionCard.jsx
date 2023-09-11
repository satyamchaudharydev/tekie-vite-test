import React, { useEffect } from 'react'
import cx from 'classnames'
import styles from './sessionCard.module.scss'
import Button from '../../../components/Button/Button'
import { AllottedSessionIcon, CompletedClockIcon, CompletedSessionIcon, InfoIcon, PlayIconOutline, TeacherManualIcon } from '../../../../../constants/icons'
import hs from '../../../../../utils/scale'
import get from 'lodash/get'
import { ClassroomIcon, NextArrowIcon } from '../../../components/svg'
import moment from 'moment'
import { motion } from 'framer-motion'
import {ReactComponent as LabIcon} from './classroomIcon.svg';
import { monthNames } from '../../../../Signup/schoolLiveClassLogin/constants/constants'
import getPath from '../../../../../utils/getPath'
import ViewDetailsModal from './ViewDetailsModal'
import { useState } from 'react'
import Tooltip from '../../../../../library/Tooltip'
import { useRef } from 'react'
import requestToGraphql from '../../../../../utils/requestToGraphql'
import fetchMentorChild from '../../../../../queries/teacherApp/fetchMentorChild'
import { PUBLISHED_STATUS } from '../../../utils'
import getMe from '../../../../../utils/getMe'
import { fireGtmEvent } from '../../../../../utils/analytics/gtmActions'
import { gtmEvents } from '../../../../../utils/analytics/gtmEvents'
import { getDataFromLocalStorage } from '../../../../../utils/data-utils'
import { getUserParams } from '../../../../../utils/getUserParams'
import { getTooltipCount, mappedTooltipTypeWithCount, redirectInClassroomPage, sessionType } from '../utils'
import { SessionPageIcon } from '../../../../../components/UpdatedSideNavBar/mainSideBarIcons'

const SESSION_ICON_HEIGHT = 26

const sessionStatusIcons = {
  upComingSession: <PlayIconOutline width={hs(SESSION_ICON_HEIGHT)} height={hs(SESSION_ICON_HEIGHT)} fromCoursePage />,
  completed: <CompletedSessionIcon width={hs(SESSION_ICON_HEIGHT)} height={hs(SESSION_ICON_HEIGHT)} />,
  allotted: <AllottedSessionIcon width={hs(SESSION_ICON_HEIGHT)} height={hs(SESSION_ICON_HEIGHT)} />,
  liveSession: <PlayIconOutline width={hs(SESSION_ICON_HEIGHT)} height={hs(SESSION_ICON_HEIGHT)} fromCoursePage />,
  started: <PlayIconOutline width={hs(SESSION_ICON_HEIGHT)} height={hs(SESSION_ICON_HEIGHT)} fromCoursePage />,
}
const handleTooltipDismissClick = async(e,mentor,countType) => {
  e.stopPropagation()
  const tooltipCountText = mappedTooltipTypeWithCount[countType]
  const currentTooltipShowCount = get(mentor, tooltipCountText)
  const id = get(mentor, 'id')
  let input = ''
  input += `${tooltipCountText}: ${currentTooltipShowCount - 1}`
  await requestToGraphql(`mutation {
    updateMentorProfile(id: "${id}", input: {${input}} ) {
      id
      teacherManualTooltipCount
    }
  }`)
  return await fetchMentorChild()
}
export const renderTooltipContent = (text="View Teacher Manual",showDissmiss,dissmissText="View Teacher Manual per topic",mentor,countType,handleClose= () => {}) => {

  if (showDissmiss) {
    return (
      <div className={styles.teacherManualTooltipContainer}>
        <InfoIcon />
        <p>{dissmissText}</p>
        <div className={styles.tooltipDivider}></div>
        <p
          onClick={async (e) => {

            handleTooltipDismissClick(e,mentor,countType)
            handleClose()
          }
          }
          style={{
            textDecoration: 'underline',
            cursor: 'pointer',
            borderLeft: '1px solid #797979',
            paddingLeft: '8px',
          }}
        >Dismiss</p>
      </div>
    )
  }
  return text
}
export const isViewContentInTheory = (topicDetail) => {
  const topicComponentRule = get(topicDetail, 'topicComponentRule', [])
  const filterVideoComponent = topicComponentRule.filter((item) => item.componentName === 'video')
  return get(filterVideoComponent , '[0].video.id', null)
}

export const checkIfUnpublished = (sessionStatus,contentStatus) => {
  if((sessionStatus === 'allotted' || sessionStatus === 'upComingSession')){
    if(contentStatus === PUBLISHED_STATUS) return false
    return true
  }
}

const SessionCard = ({
  loggedInUser,
  withUpComingCard = false,
  sessionStatus = 'upComingSession',
  topicDetail,
  sessionOrder,
  sessionTitle,
  sessionDetails,
  isViewModalLoading,
  onSessionClick = () => { },
  isCreatingSession = false,
  isFirstSession = false,
  mentorChildData = {},
  firstTopicWithContent,
  updateFirstTopicWithContent=() => {},
  updateFirstTopicTheory=() => {},
  sessionStatusTemp='',
  firstTopicTheory,
  topicRule,
}) => {
  const [showTeacherManualModal, setShowTeacherManualModal] = useState(false)
	const [teacherManualTooltip, setTeacherManualTooltip] = useState(null);
	const [theoryToolip, setTheoryToolip] = useState(true);

	const [openingFirstTeacherManualTooltip, setOpeningFirstTeacherManualTooltip] = useState(false);
  const teacherManualTooltipRef = useRef(null)
  const firstTheoryRef = useRef(null)
  const firstManualRef = useRef(null)
  const roles = get(loggedInUser && loggedInUser.toJS(), 'roles', [])
  const isCmsAdmin = roles.includes('cmsAdmin')
  const contentStatus = get(topicDetail, 'contentStatus')
  const classType = get(topicDetail, 'classType')
  const isRetakeSession = (sessionStatus === 'completed' && get(sessionDetails, 'isRetakeSession'))
  const isSessionUpComingOrLive = sessionStatus === 'upComingSession' || sessionStatus === 'liveSession' || sessionStatus === 'started' || isRetakeSession
  const isSessionLiveOrStarted = (sessionStatus === 'liveSession' || sessionStatus === 'started' || isRetakeSession ) && classType === 'lab'
  const isFirstTopicTheory = firstTopicTheory === get(topicDetail,'id')
  const [teacherManualTooltipConfig, setTeacherManualTooltipConfig] = useState({
    orientation: classType === 'theory' ?  'bottomRight' : 'bottom',
    fullCenter: classType !== 'theory',
    fullRight: classType === 'theory'
  })
  if (isRetakeSession && sessionStatus === 'completed'){
    sessionStatus = 'started'
  }
  if(sessionStatusTemp && !firstTopicWithContent && sessionStatus !== 'completed' && get(topicDetail, 'referenceContent')){
    setTimeout(() => {
      updateFirstTopicWithContent(get(topicDetail,'title'))
    } )
  }
  if(!firstTopicTheory){
    setTimeout(() => {
      updateFirstTopicTheory(get(topicDetail,'id'))
    } )
  }
   
  useEffect(() => {
    renderTooltipAtFirst()
  }, []);
  
  useEffect(() => {
    renderTooltipAtFirst()
  }, [sessionStatus, firstTopicWithContent]);


  const showContent = () => {
    if(classType === 'theory'){
      return contentStatus === PUBLISHED_STATUS
    }
    else{
      return checkIfUnpublished(sessionStatus,contentStatus)
    }
  }

  const isClassTheoryActive = classType === 'theory' && get(topicDetail, 'referenceContent') && showContent()
  const renderTooltipAtFirst = () => {
    if (sessionStatus && sessionStatus !== 'completed') {
      const { mentor } = mentorChildData
      const currentTooltipShowCount = get(mentor, 'teacherManualTooltipCount')
      const windowHeigth = window.innerHeight
      const currentScrollHeight = get(firstManualRef.current.getBoundingClientRect(), 'y')
      if (currentTooltipShowCount && sessionStatusTemp && firstTopicWithContent === get(topicDetail,'title')) {
        setOpeningFirstTeacherManualTooltip(true)
      }
      if (firstManualRef.current && sessionStatusTemp && firstTopicWithContent === get(topicDetail,'title')) {
        if (windowHeigth < currentScrollHeight) {
          const viewportHeight = window.innerHeight;
          const offset = currentScrollHeight - (viewportHeight / 2);
          const container = document.querySelector('#splitScreen-main-container')
          setTimeout(() => {
            container.scrollTo({ top: offset, behavior: 'smooth' });
          }, 1000)
        }
      }
    }
  }

  const getSessionEndDate = () => {
    const month = moment(get(sessionDetails, 'sessionEndDate')).month()
    const date = moment(get(sessionDetails, 'sessionEndDate')).date()
    return `${monthNames[month]} ${date}`
  }

  const isContentEmpty = () => {
    const topicComponentRule = get(topicDetail, 'topicComponentRule', [])
    if(topicComponentRule && topicComponentRule.length) return false
    return true
  }
  
  let timeout;
  const handleMouseOver = (event) => {
    clearTimeout(timeout)
    setTeacherManualTooltip(true);
	};

	const handleMouseOut = () => {
    timeout = setTimeout(() => {
      setTeacherManualTooltip(null);
      setOpeningFirstTeacherManualTooltip(false)
    }, 400)
	};
 


  const getUserParamsData = () => {
    const me = getMe()
    const classroomSessionsData = getDataFromLocalStorage("classroomSessionsData")
    const batchId = get(classroomSessionsData,'batchId')
    const userParams =  {...getUserParams(),
      topicId: get(topicDetail, 'id'),
      batchId: batchId,
      courseId: get(sessionDetails, 'courseData.id')
    }
    return userParams
  }
 
  const SessionButton = () => {
    if(isSessionUpComingOrLive && classType === 'lab' ){
      return <Button
            text={`${sessionStatus === 'upComingSession' ? `Start${isCreatingSession ? 'ing' : ''}` : `Resum${isCreatingSession ? 'ing' : 'e'}`} Session`}
            type='primary'
            isLoading={isCreatingSession}
            onBtnClick={(e) => {
              e.stopPropagation()
              const userParams = getUserParamsData()
              if(sessionStatus === 'upComingSession'){
              fireGtmEvent(gtmEvents.startSessionClicked,{userParams})
              }else if(sessionStatus ==='completed'){
                fireGtmEvent(gtmEvents.completedSessionClicked,{userParams})
              }else if(sessionStatus === 'started'){
                fireGtmEvent(gtmEvents.resumeSessionClicked,{userParams})
              }else if(sessionStatus ==='liveSession'){
                fireGtmEvent(gtmEvents.resumeSessionClicked,{userParams})
              }else {
                fireGtmEvent(gtmEvents.futureSessionCardClicked,{userParams})
              }
              isSessionUpComingOrLive && onSessionClick()
            }}
          />
    }
    else if(classType === 'theory' ){
      return (
        <>
          {
            (isViewContentInTheory(topicDetail) && !checkIfUnpublished(sessionStatus,contentStatus)) ? (
              <>
                <Button
                    text={`View Content`}
                    type='default'
                    
                    isLoading={isCreatingSession || isViewModalLoading}
                    onBtnClick={(e) => {
                      e.stopPropagation()
                      
                      const userParams = getUserParamsData()
                      if(sessionStatus === 'upComingSession'){
                      fireGtmEvent(gtmEvents.startSessionClicked,{userParams})
                      }else if(sessionStatus ==='completed'){
                        fireGtmEvent(gtmEvents.completedSessionClicked,{userParams})
                      }else if(sessionStatus === 'started'){
                        fireGtmEvent(gtmEvents.resumeSessionClicked,{userParams})
                      }else if(sessionStatus ==='liveSession'){
                        fireGtmEvent(gtmEvents.resumeSessionClicked,{userParams})
                      }else {
                        fireGtmEvent(gtmEvents.futureSessionCardClicked,{userParams})
                      }
                      if(isSessionUpComingOrLive || classType === 'theory'){
                        onSessionClick()
                      }

                    
                    }}
                />
              </>
            ) : null
          }
        </>
      )
    }
    else{
     return <div className={styles.allottedOrCompletedSession}>
              {sessionStatus === 'completed' ?
                <p>
                  <CompletedClockIcon height={hs(22)} width={hs(22)} />
                Completed on<span className={styles.sessionEndTime}>{getSessionEndDate()}</span>
              </p> : null}
              <NextArrowIcon className={styles.nextArrowIcon} />
            </div>
    }  
  }

  const openTeacherManualModal = (e) => {
    e.stopPropagation()
    setShowTeacherManualModal(true)
    const userParams = getUserParamsData()
    fireGtmEvent(gtmEvents.teacherManualOnSessionsPageClicked,{userParams})
  }

  const checkForCmsAdmin = () => {
    if (sessionStatus === 'upComingSession') {
      if ((contentStatus === PUBLISHED_STATUS && !isCmsAdmin) || isCmsAdmin) {
        return true
      }
      return false
    }
    return true
  }

  const renderManualAndSessionButton = () => {
    let showTeacherManual = false
    if(classType === 'theory' && get(topicDetail, 'referenceContent') && showContent()){
      showTeacherManual = true

    }
    else if( classType === 'lab' && sessionStatus !== 'completed' && checkForCmsAdmin() && get(topicDetail, 'referenceContent')){
      showTeacherManual = true
    }
    return (
      <div className={styles.sessionManualButtonsContainer}>
        {showTeacherManual ? (
          <div
            onClick={(e) => openTeacherManualModal(e)}
            className={styles.manualContainer}
						onMouseOver={handleMouseOver}
						onMouseOut={handleMouseOut}
            ref={teacherManualTooltipRef}
          >
            <TeacherManualIcon />
          </div>
        ) : null}
        <SessionButton />
      </div>
    )
  }
  const renderIndicator = () => {
    if(classType === 'theory'){
        return <SessionPageIcon className={cx(styles.theoryIndicator, theoryClassName())} width={18} stroke={'currentColor'} stroke-width={"6px"}/>
    }
    else{
      if(isContentEmpty() || (checkIfUnpublished(sessionStatus,contentStatus) && !isCmsAdmin)){
        return  sessionStatusIcons['allotted']
      }
      else {
        if(isSessionLiveOrStarted){
          return (
            <>
              <div className={styles.liveSessionIndicatorContainer}>
                  <div className={styles.liveSessionIndicator}></div>
                  <span className={styles.liveSessionText}>LIVE</span>
              </div>
            </>
          )
        }
        return sessionStatusIcons[sessionStatus]
      }
    }
  }

  const theoryClassName = () => {
    if(classType === "theory"){
      if(isClassTheoryActive){
        return styles[`sessionCardLiveOrUpComingSession`]
      }
      else{
        return styles[`allotted-sessionCard`]
        
      }
    }
  }
  const cardClassName = () => {
    if(classType === "theory"){
      if((isViewContentInTheory(topicDetail) || get(topicDetail, 'referenceContent')) && showContent()){
        return cx(styles.sessionCard, styles[`sessionCardLiveOrUpComingSession`])
      }
      else{
        return cx(styles.sessionCard, styles[`allotted-sessionCard`])
      }
    }
    else{
      return (cx(styles.sessionCard, ((checkIfUnpublished(sessionStatus, contentStatus) && !isCmsAdmin) || classType === 'theory') ? styles[`allotted-sessionCard`] : styles[`${sessionStatus}-sessionCard`],
      !withUpComingCard && (!(checkIfUnpublished(sessionStatus , contentStatus) && !isCmsAdmin) || classType === 'theory') && styles.sessionCardLiveOrUpComingSession, isFirstSession && styles.noMargin))
    }
  }
  const renderSessionCard = () => {
    
    return (
      <div className={cardClassName()}
        onClick={(e) => {
          const userParams = getUserParamsData()
          if(sessionStatus === 'upComingSession'){
          fireGtmEvent(gtmEvents.startSessionClicked,{userParams})
          }else if(sessionStatus ==='completed'){
            fireGtmEvent(gtmEvents.completedSessionClicked,{userParams})
          }else if(sessionStatus === 'started'){
            fireGtmEvent(gtmEvents.resumeSessionClicked,{userParams})
          }else if(sessionStatus ==='liveSession'){
            fireGtmEvent(gtmEvents.resumeSessionClicked,{userParams})
          }else {
            fireGtmEvent(gtmEvents.futureSessionCardClicked,{userParams})
          }
          if(classType === "theory" && showContent() && isViewContentInTheory(topicDetail)){
             onSessionClick()
          }
          else{
            onSessionClick()
          }


        }}
        ref={firstManualRef}
      >
          <div className={styles.sessionCardDetailsArea}>
              {renderIndicator()}
              {(get(topicDetail,'classType') === 'lab' ) ? (
                <div className={cx(styles.topicThumbnail, ((checkIfUnpublished(sessionStatus,contentStatus) && !isCmsAdmin)) ? styles[`topicThumbnail-allotted`] : styles[`topicThumbnail-${sessionStatus}`])}>
                  <ClassroomIcon className={styles.classroomIcon} />
                </div>
              ) : get(topicDetail,'classType') !== 'theory' && <div className={styles.topicThumbnailEmptyArea} />}
              {get(topicDetail,'classType') === 'theory' && (
                <div ref={firstTheoryRef} className={cx(styles.topicThumbnail, theoryClassName())}>
                  <LabIcon className={styles.classroomIcon } />
                </div>
              )}

              <p className={cx(styles.sessionCardTopic)}>
                <span className={styles.topicOrder}>{classType === 'lab' ? 'Lab' : 'Classroom'} {sessionOrder > 9 ? sessionOrder : `0${sessionOrder}`}: </span>
                <span className={styles.topicTitle}>{sessionTitle || get(topicDetail, 'title')}</span>
              </p>
          </div>
          {classType === "lab" && (isContentEmpty() || (checkIfUnpublished(sessionStatus,contentStatus) && !isCmsAdmin)) ? (
            null
          ) : renderManualAndSessionButton()}
          <Tooltip
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            className={styles.theoryToolipContainer}
            fullRight={teacherManualTooltipConfig.fullRight}
            fullCenter={teacherManualTooltipConfig.fullCenter}
            open={teacherManualTooltip || openingFirstTeacherManualTooltip}
            anchorEl={teacherManualTooltipRef.current}
            type='secondary'
            handleMouseEnter={() => {
              handleMouseOver()
            }}
            handleMouseLeave={() => {
              handleMouseOut()
            }}
            orientation={teacherManualTooltipConfig.orientation}
          >
            {
              renderTooltipContent('View Teacher Manual per topic',true,'View Teacher Manual per topic',get(mentorChildData ,'mentor'), 'teacherManualType', () => setTeacherManualTooltip(null))
            }
          </Tooltip>
          {
            get(mentorChildData,'mentor') && (
              <>
                 <Tooltip
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                    // tooltipClass={styles.theoryToolipContainer}
                    fullCenter
                    open={firstTopicTheory === get(topicDetail,'id') && theoryToolip && getTooltipCount(get(mentorChildData,'mentor'), 'theory') > 0}
                    anchorEl={firstTheoryRef.current}
                    type='secondary'
                    theoryClassName={styles.theoryToolipContainer}
                    // handleMouseEnter={() => {
                    //   handleMouseOver()
                    // }}
                    // handleMouseLeave={() => {
                    //   handleMouseOut()
                    // }}
                    orientation='bottom'
                  >
                    {renderTooltipContent("View details around theory sessions",true,"View details around theory sessions", get(mentorChildData ,'mentor'), 'sessionTab', () => setTheoryToolip(null))}
                  </Tooltip>
              </>
            )
          }
         
          <ViewDetailsModal
            title={`Teacher Manual - ${classType === 'lab' ? "Lab" : "Theory"} ${sessionOrder}. ${get(topicDetail, 'title')}`}
            body={get(topicDetail, 'referenceContent')}
            showFooter={true}
            onClose={() => setShowTeacherManualModal(false)}
            visible={showTeacherManualModal}
          >
          </ViewDetailsModal>
      </div>
    )
  }
  if (withUpComingCard) {
    return (
      <div className={styles.sessionCardUpComingContainer}>
          <h2 className={styles.sessionCardUpComingHeader}>{isSessionLiveOrStarted ? 'Ongoing' : 'Upcoming'} Lab Session</h2>
          {renderSessionCard()}
      </div>
    )
  }
  return (
    <>

    <motion.div
      initial={{opacity:0}}
      animate={{ opacity:1 }}
      transition={{ delay: 0.15}}
    >
      {renderSessionCard()}
    </motion.div>
    </>
  )
}

export default SessionCard