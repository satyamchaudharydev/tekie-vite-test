import { get } from 'lodash'
import React from 'react'
import compareDateTime from '../../../../../../../../utils/teacherApp/compareDateTime'
import ClassCard from '../../../ClassCard/ClassCard'
import styles from './ModalContent.module.scss'

export default function ModalContent({ MoreSessions,setIsSessionDetailsModalVisible,setSessionDetails,isUpcomingSession,isSessionDetailsModalOpenedRef }) {


const showSessionDetailsModal=(arg)=>{
  setSessionDetails(get(arg,'event'))
  setIsSessionDetailsModalVisible(true)
  isSessionDetailsModalOpenedRef.current=true
}
  const renderSingleSessionDetailComponent = (singleSessionData) => {
    const {id,start, end ,extendedProps: { title, sessionStatus, grades, sections,classType,documentType }} = singleSessionData.event

    return (<>
      <div onClick={()=>showSessionDetailsModal(singleSessionData)} className={styles.cardContainer}>
      <ClassCard isSessionClosestToCurrentTime={{earliest:id===isUpcomingSession,isFuture:compareDateTime(start,new Date(),'greaterThan')}}
      title={title} grades={grades} sections={sections} start={start} end={end} sessionStatus={sessionStatus} documentType={documentType} classType={classType}/></div>
    </>
    )
  }



  return (
    <div className={styles.modalContentContainer}>
      <h2 className={styles.modalContentHeading}>Sessions({MoreSessions.length})</h2>
      {MoreSessions.map((singleSessionData) =>
        renderSingleSessionDetailComponent(singleSessionData)
      )}
    </div>
  )
}
