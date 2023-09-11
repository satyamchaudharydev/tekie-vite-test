import React from 'react'
import ReactDOM from "react-dom"; 

import styles from './showSubmitModal.module.scss'
function ShowSubmitModal() {
  const renderModal = () => {
    return <>
              <div className={styles.showSubmitModalContainer}>
                <div 
                  className={styles.showSubmitModal}>
                  <div 
                    className={styles.header}>
                      <h2 className={styles.headerTitle}>
                        Confirm Submission
                      </h2>
                      <p className={styles.headerDesc}>
                        Make sure to attempt all the questions before submitting your homework!
                      </p>
                      <div 
                        className={styles.progressContainer}
                      >

                      </div>
                  </div>
                  <div
                    className={styles.homeWorkDetails}
                  >

                  </div>
                  <div 
                    className={styles.footer}>
                  </div>
                </div>
            </div>
          </>
    
  }
  return ReactDOM.createPortal(
        <>
            {renderModal()}        
        </>,
        document.getElementById('root')
    )
}

export default ShowSubmitModal