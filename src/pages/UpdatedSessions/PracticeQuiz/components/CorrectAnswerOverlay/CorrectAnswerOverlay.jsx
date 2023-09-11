import React from 'react'
import styles from './CorrectAnswerOverlay.module.scss'
import ArrowButton from '../../../../../components/Buttons/ArrowButton'
import parseMetaTags from '../../../../../utils/parseMetaTags'
import classNames from 'classnames'
import { get } from 'lodash'
import { ArrowForward, CorrectAnswerIcon } from '../../../../../constants/icons'
import UpdatedButton from '../../../../../components/Buttons/UpdatedButton/UpdatedButton'
import { checkIfEmbedEnabled, isPqReportNotAllowed } from '../../../../../utils/teacherApp/checkForEmbed'
import { NextFooterButton } from '../../../../../components/NextFooter/NextFooter'
import TekieContentEditorParser from '../../../../../components/Preview/Preview'

const CorrectAnswerOverlay = ({ visible, changeQuestion, activeQuestionIndex, numberOfQuestions,
    onReportButtonClick, answer, pqDumpLoading, isMobile, dumpPracticeQuestions, resetAnswers = () => { },
    revisitRoute, questionId, userLearningObjective, loggedInUser,
    isLearningSlide = false, isLastSlideAndPQType = false, appendPracticeQuestionId = () => { },
    setFrame = () => { }, reportButtonText = '', updateLearningSlideList = () => {}, skipSlideRange = 0,nextButtonDetails }) => {
    const onNextButtonClick = async () => {
        const isMentorLoggedIn = loggedInUser && get(loggedInUser[0], 'isMentorLoggedIn', false)
        const practiceQuestionStatus = get(userLearningObjective, 'practiceQuestionStatus', '')
        if (pqDumpLoading) return;
        if (isLearningSlide) {
            appendPracticeQuestionId(questionId)
            if (!isLastSlideAndPQType) resetAnswers()
            // here 10 is fix number of slides to be shown in one frame
            if (activeQuestionIndex % 10 === 9) {
                updateLearningSlideList('next', activeQuestionIndex + Math.abs(skipSlideRange + 1))
                setFrame(true)
            } else {
                changeQuestion(activeQuestionIndex + 1, 'next')
            }
        } else {
            if (numberOfQuestions > activeQuestionIndex + 1) {
                changeQuestion(activeQuestionIndex + 1)
            }
            else {
                if (checkIfEmbedEnabled()) {
                    onReportButtonClick()
                }
                if (!revisitRoute) {
                    await dumpPracticeQuestions()
                } else if (revisitRoute && practiceQuestionStatus !== 'complete') {
                    await dumpPracticeQuestions()
                } else if (!pqDumpLoading) {
                    onReportButtonClick()
                }
            }
        }
    }
    const getButtonTitle = () => {
        if (isLearningSlide) {
            if (isLastSlideAndPQType) {
                if (isPqReportNotAllowed() && reportButtonText) return `Next Up: ${reportButtonText}`
                return 'Next: Practice Report'
            }
            return 'Next'
        }
        if (numberOfQuestions > activeQuestionIndex + 1) {
            return 'Next'
        }
        if (isPqReportNotAllowed() && reportButtonText) return `Next Up: ${reportButtonText}`
        return 'Next: Practice Report'
    }
    if (visible) {
        return (
            <div className={classNames({
                [styles.correctAnswerContainer]: !isMobile,
                [styles.mbCorrectAnswerContainer]: isMobile,
                [styles.emptyStyles]: !answer,
                [styles.correctAnswerContainerForTeacherApp]: checkIfEmbedEnabled()
            })} >
                <div className={classNames({
                    [styles.mainArea]: !isMobile,
                    [styles.mbMainArea]: isMobile,
                    [styles.noAnswerStyle]: !answer
                })}>
                    <div className={classNames({
                        [styles.correctHeading]: !isMobile,
                        [styles.mbCorrectHeading]: isMobile,
                    })}>{!isMobile ? (
                        <>
                            <CorrectAnswerIcon />
                            <span>Correct Answer</span>
                        </>
                    ) : 'Correct'}</div>
                    {answer ? (
                        <div className={classNames({
                            [styles.explanation]: !isMobile,
                            [styles.mbExplanation]: isMobile,
                        })}>
                            <TekieContentEditorParser
                                 id={`explanation-${activeQuestionIndex}`}
                                 value={answer}
                                 init={{ selector: `explanation-${activeQuestionIndex}`}}
                            >

                            </TekieContentEditorParser>
                        </div>
                    ) : null}

                    {isMobile ? (
                        <div className={classNames({
                            [styles.nextBtn]: !isMobile,
                            [styles.mbNextBtn]: isMobile,
                            [styles.noMargin]: !answer
                        })}>
                            <ArrowButton
                                onClick={onNextButtonClick}
                                showLoader={pqDumpLoading}
                                hideIconContainer={pqDumpLoading}
                                loaderStyle={{ marginLeft: 10 }}
                                style={{ cursor: pqDumpLoading ? 'auto' : 'pointer', width: '100%' }}
                                title={getButtonTitle()}
                                noTopMargin={!answer}
                                isMobile={isMobile}
                            />
                        </div>
                    ) : (
                        <div className={classNames({
                            [styles.nextBtn]: !isMobile,
                            [styles.mbNextBtn]: isMobile,
                            // [styles.noMargin]: !answer
                        })}>
                            <NextFooterButton
                                {...nextButtonDetails}
                                nextItem={onNextButtonClick}
                            >

                            </NextFooterButton>
                            {/* <UpdatedButton
                                isLoading={pqDumpLoading}
                                isDisabled={pqDumpLoading}
                                onBtnClick={onNextButtonClick}
                                text={getButtonTitle()}
                                type={'primary'}
                                rightIcon
                                >
                                <ArrowForward 
                                    color='white' />
                            </UpdatedButton> */}
                        </div>
                    )}
                </div>
            </div>
        )
    }
    else {
        return null
    }
}

export default CorrectAnswerOverlay