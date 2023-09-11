import React from 'react'
import classNames from 'classnames'
import styles from './QuestionArea.module.scss'
import Mcq from '../../../../../components/QuestionTypes/Mcq'
import Arrange from '../../../../../components/QuestionTypes/Arrange'
import FibInput from '../../../../../components/QuestionTypes/FibInput'
import FibBlock from '../../../../../components/QuestionTypes/FibBlock'
import ArrowSVG from '../../../../../assets/arrowIcon'
import { visiblePqStoryOverlay } from '../../constants'
import { motion } from 'framer-motion'
import { checkIfEmbedEnabled, getEmbedData } from '../../../../../utils/teacherApp/checkForEmbed'
import { backToPageConst } from '../../../../TeacherApp/constants'

const MCQ = 'mcq'
const FIBBLOCK = 'fibBlock'
const FIBINPUT = 'fibInput'
const ARRANGE = 'arrange'

const QuestionArea = ({ userPracticeQuestions,
    changeQuestion,
    activeQuestionIndex,
    updateAnswers,
    answers,
    openOverlay,
    answersAdditionalInfo,
    answerType,
    isPqStoryPresent,
    revisitRoute,
    isMobile,
    isOverlayOpen,
    isSeeAnswers,
    onCheckButtonClick,
    renderComponent = () => {}
}) => {
    const renderAdditionalComponent = () => {
        if (checkIfEmbedEnabled()) {
            const backToPage = getEmbedData('backToPage')
            if (backToPage !== backToPageConst.trainingResourcesClasswork) return true;
            return false
        }
        return false;
    }
    const practiceQuestions = (userPracticeQuestions.get('practiceQuestions'))
        ? userPracticeQuestions.get('practiceQuestions').toJS() : []
    
    const getActiveProgressPercentage = () => {
        const totalQuestions = (practiceQuestions && practiceQuestions.length) || 0
        return `${((activeQuestionIndex)*100)/(totalQuestions-1)}%`
    }

    const isElectron = typeof window !== 'undefined' && window.native
    
    return (
        <div className={isMobile ? styles.mbQuestionAreaContainer : styles.questionAreaContainer}>
            {(isPqStoryPresent && !checkIfEmbedEnabled()) ? (
                <div className={isMobile ? styles.mbStoryIcon : styles.storyIcon} onClick={() => openOverlay(visiblePqStoryOverlay)}></div>
            ) : null}
            {!isMobile ?
            (
               <>
                 <div className={
                        classNames(isElectron ? styles.questionNumberContainerElectron : styles.questionNumberContainer,
                            checkIfEmbedEnabled() && styles.questionNumberContainerForTeacherApp)
                } style={{ marginTop: checkIfEmbedEnabled() ? '0' : '' }}>
                    <div
                        onClick={() => {
                            if (activeQuestionIndex > 0) {
                                changeQuestion(activeQuestionIndex-1)
                            }
                        }}
                        className={styles.arrowSVGContainer}
                    >
                        <ArrowSVG className={classNames({
                            [styles.arrowSVG]: activeQuestionIndex > 0,
                            [styles.disabled]: activeQuestionIndex <= 0
                        })} />
                    </div>
                    <div className={styles.indicatorContainer}>
                        {practiceQuestions &&
                            practiceQuestions.map((question, index) => {
                                let questionStatus = answersAdditionalInfo &&
                                    answersAdditionalInfo[index] &&
                                    answersAdditionalInfo[index - 1] &&
                                    answersAdditionalInfo[index - 1].status !== 'complete'
                                if (revisitRoute) questionStatus = false
                                return (
                                    <motion.div
                                        whileTap={{
                                            scale: questionStatus ? 1 : 0.8
                                        }}
                                        className={classNames({
                                            [styles.activeCircle]: (activeQuestionIndex === index),
                                            [styles.circle]: true, [styles.unAttemptedCircle]: (questionStatus)
                                        })}
                                        key={question.id}
                                        onClick={() => { if (!questionStatus) { changeQuestion(index) } }}
                                    >
                                    <div className={classNames({
                                        [styles.activeBorder]: (activeQuestionIndex === index),
                                    })}/>
                                        {index + 1}
                                    </motion.div>
                                )
                            })
                        }
                        <div className={styles.inActiveProgressBar}>
                            <div
                                className={styles.activeProgressBar}
                                style={{
                                    width: getActiveProgressPercentage()
                                }}
                            />
                        </div>
                    </div>
                    <div
                        style={{ marginLeft: 22, transform: 'scaleX(-1)' }}
                        onClick={() => {
                            const nextActiveIndexStatus = answersAdditionalInfo &&
                                    answersAdditionalInfo[activeQuestionIndex+1] &&
                                    answersAdditionalInfo[activeQuestionIndex] &&
                                answersAdditionalInfo[activeQuestionIndex].status !== 'complete'
                            if ((activeQuestionIndex < practiceQuestions.length-1) && (!nextActiveIndexStatus || revisitRoute)) {
                                changeQuestion(activeQuestionIndex+1)
                            }
                        }}
                        className={styles.arrowSVGContainer}
                    >
                        <ArrowSVG className={classNames({
                            [styles.arrowSVG]: activeQuestionIndex < practiceQuestions.length-1,
                            [styles.disabled]: activeQuestionIndex >= practiceQuestions.length-1
                        })} />
                    </div>
                </div>
                {renderAdditionalComponent() ? renderComponent() : null}
               </>
            ):
            (
                <div className={styles.mbQuestionNumberContainer}>
                    {practiceQuestions ?
                        practiceQuestions.map((question, index) => {
                            let questionStatus = answersAdditionalInfo &&
                                answersAdditionalInfo[index] &&
                                answersAdditionalInfo[index - 1] &&
                                answersAdditionalInfo[index - 1].status !== 'complete'
                            if (revisitRoute) questionStatus = false
                            return (
                                <div
                                    whileTap={{
                                        scale: questionStatus ? 1 : 0.8
                                    }}
                                    className={classNames({
                                        [styles.isActiveQuestion]: (activeQuestionIndex === index),
                                        [styles.isNotActiveQuestion]: true,
                                        [styles.unAttemptedCircle]: (questionStatus),
                                        
                                    })}
                                    key={question.id}
                                    onClick={() => { if (!questionStatus) { changeQuestion(index) } }}
                                >
                                    {index + 1}
                                </div>
                            )
                        }) : null
                    }
            </div>
            )}
            <div className={classNames(styles.question, checkIfEmbedEnabled() && styles.questionForTeacherApp)}>
                {(() => {
                    if (practiceQuestions[activeQuestionIndex]) {
                        const pq = practiceQuestions[activeQuestionIndex].question
                        if (pq) {
                            const questionProps = {
                                activeQuestionIndex,
                                question: pq,
                                updateAnswers,
                                answers,
                                onCheckButtonClick,
                                isSeeAnswers,
                                answerType
                            }
                            if (pq.questionType === FIBBLOCK) {
                                return <FibBlock key={pq.id} {...questionProps} isMobile={isMobile} withUpdatedDesign />
                            }
                            else if (pq.questionType === ARRANGE) {
                                return <Arrange key={pq.id} {...questionProps} isMobile={isMobile} withUpdatedDesign />
                            }
                            else if (pq.questionType === FIBINPUT) {
                                return <FibInput key={pq.id} {...questionProps} isMobile={isMobile} withUpdatedDesign />
                            }
                            else if (pq.questionType === MCQ) {
                                return <Mcq key={pq.id} {...questionProps} isMobile={isMobile} withUpdatedDesign />
                            }
                            else {
                                return null
                            }
                        }

                    }
                })()}
            </div>
        </div>
    )
}

export default QuestionArea
