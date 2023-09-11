import React from 'react'
import styles from './PQStoryOverlay.module.scss'
import Modal from 'react-modal'
import { visiblePqStoryOverlay } from '../../constants'

const PQStoryOverlay = ({ visible,closeOverlay,pqStory='',})=>{
  return(
      <Modal
        isOpen={visible}
        className={styles.modalContainer}
        overlayClassName={styles.container}
        onRequestClose={() => closeOverlay(visiblePqStoryOverlay)}
        closeTimeoutMS={500}
      >
        <div className={styles.pqStory}>
            {pqStory}
            <div className={styles.continueBtn} onClick={()=> closeOverlay(visiblePqStoryOverlay)}>Continue</div>
       </div>
      </Modal>
  )
}

export default PQStoryOverlay