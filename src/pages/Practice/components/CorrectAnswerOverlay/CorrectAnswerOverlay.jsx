import React from 'react'
import styles from './CorrectAnswerOverlay.module.scss'
import ArrowButton from '../../../../components/Buttons/ArrowButton'
import parseMetaTags from '../../../../utils/parseMetaTags'

const CorrectAnswerOverlay = ({ visible, changeQuestion, activeQuestionIndex, numberOfQuestions, 
     onReportButtonClick,answer, pqDumpLoading })=>{
    if (visible){
    return(
        <div className={styles.correctAnswerContainer}>
            <div className={styles.mainArea}>
                <div className={styles.correctHeading}>Correct</div>
                <div className={styles.explanation}>
                    {answer ? parseMetaTags({ statement: answer, removeCodeTag: true, codeTagParser: true }) : null} 
                </div>
                <div className={styles.nextBtn}>
                <ArrowButton
                    onClick={() => { 
                        if(numberOfQuestions>activeQuestionIndex+1){ 
                            changeQuestion(activeQuestionIndex + 1)
                        }
                        else{
                            if (!pqDumpLoading) {
                                onReportButtonClick()
                            }
                        }
                    }}
                    showLoader={pqDumpLoading}
                    hideIconContainer={pqDumpLoading}
                    loaderStyle={{ marginLeft: 10 }}
                    style={{ cursor: pqDumpLoading ? 'auto' : 'pointer' }}
                    title={
                        (numberOfQuestions > activeQuestionIndex + 1) ? 'Next' : 'Report' 
                    } 
                />
                </div>
            </div>
        </div>
    )
    }
    else{
        return null
    }
}

export default CorrectAnswerOverlay