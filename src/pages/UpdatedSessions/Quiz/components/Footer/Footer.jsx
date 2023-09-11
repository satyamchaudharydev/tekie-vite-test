import React from 'react'
import classNames from 'classnames'
import videoStyles from '../../../Video/Video.module.scss'
import styles from './Footer.module.scss'
import { debounce } from 'lodash'
import UpdatedButton from '../../../../../components/Buttons/UpdatedButton/UpdatedButton'
import { ArrowForward } from '../../../../../constants/icons'
import { checkIfEmbedEnabled } from '../../../../../utils/teacherApp/checkForEmbed'

const visibleSubmitOverlay = 'visibleSubmitOverlay'
const Footer = ({ redirectToNextSession, unansweredQuestionCount, openOverlay,
    onQuizSubmit, isLoading, path, isSubmittedForReview, btnTitle, activeQuestionIndex,  changeQuestion, isMobile, numberOfQuestions, nextComponent, submitForReview, submitQuiz }) => {
    return (
        <div className={classNames(styles.footerContainer, checkIfEmbedEnabled() && styles.footerContainerForTeacherApp)}>
            <div className={styles.submitButton} onClick={debounce(async () => {
                if (!isSubmittedForReview && !checkIfEmbedEnabled()) {
                    if (isMobile && (activeQuestionIndex < numberOfQuestions - 1)) {
                        submitQuiz()
                        changeQuestion(activeQuestionIndex+1)
                    } else {
                        if (!isMobile && (unansweredQuestionCount > 0)) {
                            openOverlay(visibleSubmitOverlay)
                        } else {
                            if (isMobile && !nextComponent) {
                                submitForReview()
                            } else {
                                if (isMobile) {
                                    if (isLoading) return
                                    await submitQuiz()
                                    redirectToNextSession()
                                } else {
                                    onQuizSubmit()
                                }
                            }
                        }
                    }
                } else {
                    redirectToNextSession()
                }
            }, 500)}>
                {isMobile ? (
                    <button className={videoStyles.nextButton}
                        style={{ margin: 0 }}
                    >
                        <div className={videoStyles.nextTitle}>
                            {(!isSubmittedForReview  && (activeQuestionIndex < numberOfQuestions-1)) ? 'Next' : (btnTitle || 'Save')}
                        </div>
                        {(isLoading && (activeQuestionIndex === numberOfQuestions -1) )? (
                            <span className={videoStyles.loader} />
                        ) : (
                            <img alt='loading' style={{ marginLeft: "10px" }} width="25px" src="https://img.icons8.com/material-sharp/50/ffffff/circled-chevron-right.png" />
                        )}
                    </button>
                ) : (
                    // <NextButton
                    //     loading={isLoading}
                    //     showSave={btnTitle === 'Save Quiz' ? true : false}
                    //     title={btnTitle || 'Save'}
                    // />  
                        <UpdatedButton onBtnClick={() => { }} text={btnTitle || 'Save'}  isLoading={isLoading} rightIcon><ArrowForward color='white'/></UpdatedButton>
                )}
            </div>
        </div>
    )
}

export default Footer
