import React from 'react'
import ModalContent from './components/ModalContent/ModalContent'
import ModalHeader from './components/ModalHeader/ModalHeader'
import styles from './MoreSessionDetails.module.scss'

export default function MoreSessionDetails({ MoreSessions, setIsModalVisible,setSessionDetails,setIsSessionDetailsModalVisible,isUpcomingSession,isSessionDetailsModalOpenedRef }) {

  const closeModal = () => { 
    setIsModalVisible([])
  }

  return (
    <>
      <div className={styles.moreSessionDetailsPopupContainer}>
        <ModalHeader closeModal={closeModal} MoreSessions={MoreSessions}/>
        <ModalContent MoreSessions={MoreSessions} isUpcomingSession={isUpcomingSession} setSessionDetails={setSessionDetails} setIsSessionDetailsModalVisible={setIsSessionDetailsModalVisible} isSessionDetailsModalOpenedRef={isSessionDetailsModalOpenedRef} />
        <button className={styles.closeModalButton} onClick={closeModal}>Close</button>
      </div>
      <div className={styles.modalOverlay}></div>
    </>
  )
}
