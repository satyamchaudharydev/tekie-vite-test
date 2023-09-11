import React from 'react'
import styles from './PQStoryOverlay.module.scss'
import Modal from 'react-modal'
import { visiblePqStoryOverlay } from '../../constants'

const PQStoryOverlay = ({ visible,closeOverlay,pqStory='',isMobile})=>{
  return(
      <Modal
        isOpen={visible}
        className={isMobile ? styles.mbModalContainer : styles.modalContainer}
        overlayClassName={styles.container}
        onRequestClose={() => closeOverlay(visiblePqStoryOverlay)}
        closeTimeoutMS={500}
        
      >
        <div className={isMobile ? styles.mbPqStory : styles.pqStory}>
            {pqStory}
            <div className={isMobile ? styles.mbContinueBtn : styles.continueBtn} onClick={()=> closeOverlay(visiblePqStoryOverlay)}>Continue</div>
       </div>
      </Modal>
  )
}

export default PQStoryOverlay