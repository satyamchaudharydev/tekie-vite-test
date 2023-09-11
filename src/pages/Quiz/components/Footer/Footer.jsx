import React from 'react'
import styles from './Footer.module.scss'

const visibleSubmitOverlay = 'visibleSubmitOverlay'
const Footer = ({ changeQuestion, activeQuestionIndex,
    numberOfQuestions, unansweredQuestionCount, openOverlay, onQuizSubmit, isLoading, path}) => {
    return (
        <div className={styles.footerContainer}>
            <div className={styles.buttonArea}>
                {activeQuestionIndex>0?
                    <div className={styles.leftButton} onClick={()=>changeQuestion(activeQuestionIndex-1)} />
                    :<div className={styles.leftButton} style={{backgroundImage:'unset'}} />
                }
                <div className={styles.submitButton} onClick={()=>{
                    if (unansweredQuestionCount>0){
                        openOverlay(visibleSubmitOverlay)
                    } else {
                        onQuizSubmit()
                    }
                }}>{
                    path === '/homework/:topicId/quiz' || path === '/revisit/homework/:topicId/quiz'
                        ? 'SAVE'
                        : 'SUBMIT'
                }</div>
                {(activeQuestionIndex+1<numberOfQuestions)?
                    <div className={styles.rightButton} onClick={()=>changeQuestion(activeQuestionIndex+1)} />
                    : <div className={styles.rightButton} style={{ backgroundImage: 'unset' }} />
                }
                </div>
        </div>
    )
}

export default Footer
