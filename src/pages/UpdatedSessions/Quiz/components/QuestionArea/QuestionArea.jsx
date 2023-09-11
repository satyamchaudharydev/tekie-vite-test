import React from 'react'
import classNames from 'classnames'
import styles from './QuestionArea.module.scss'
import Mcq from '../../../../../components/QuestionTypes/Mcq'
import Arrange from '../../../../../components/QuestionTypes/Arrange'
import FibInput from '../../../../../components/QuestionTypes/FibInput'
import FibBlock from '../../../../../components/QuestionTypes/FibBlock'
import ArrowSVG from '../../../../../assets/arrowIcon'
import { motion } from 'framer-motion'
import PQStyles from "../../../PracticeQuiz/components/QuestionArea/QuestionArea.module.scss";
import { checkIfEmbedEnabled } from '../../../../../utils/teacherApp/checkForEmbed'
import { get } from 'lodash'

const MCQ = 'mcq'
const FIBBLOCK = 'fibBlock'
const FIBINPUT = 'fibInput'
const ARRANGE  = 'arrange'

const QuestionArea = ({ userQuizs:questions,
      changeQuestion,
      activeQuestionIndex,
      updateAnswers,
      answers,
      isAnswered,
      isSubmittedForReview,
      isMobile,
      submitQuiz,
      onCheckButtonClick,
      isSeeAnswers,
      isHomeWork,
      match,
      homeWorkMeta,
      answerType,
      componentType,
      renderComponent = () => {}
    })=>{
        
   
    const getActiveProgressPercentage = () => {
        const totalQuestions = (questions && questions.length) || 0
        return `${((activeQuestionIndex)*100)/(totalQuestions-1)}%`
    }
    const checkIfQuestionIsAttempted = (id) => {
        return get(homeWorkMeta.toJS(), `${componentType}.attemptedIds`, []).includes(id)
    }

    const isElectron = typeof window !== 'undefined' && window.native
    return(
        <div className={classNames({
            [styles.questionAreaContainer]: !isMobile,
            [PQStyles.mbQuestionAreaContainer]: isMobile
        })}>
            <div className={classNames({
                [styles.questionNumberContainer]: !isMobile,
                [styles.questionNumberContainerElectron]: !isMobile && isElectron,
                [PQStyles.mbQuestionNumberContainer]: isMobile,
            })} style={{ marginTop: checkIfEmbedEnabled() ? '0' : '' }}>
                {!isMobile && (
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
                )}
                <div className={styles.indicatorContainer}>
                    {questions &&
                        questions.map((question, index) => {
                            return (
                                <motion.div
                                    whileTap={{
                                        scale: activeQuestionIndex === index ? 1 : 0.8
                                    }}
                                    className={classNames({
                                        [styles.activeCircle]: (activeQuestionIndex === index),
                                        [styles.circle]: true, [styles.unAttemptedCircle]: componentType === 'quiz' ? !checkIfQuestionIsAttempted(get(question,'question.id')) : !isAnswered[index]
                                    })}
                                    key={question.id}
                                    onClick={() => {
                                        if (isMobile) {
                                            submitQuiz()
                                        }
                                        changeQuestion(index)
                                    }}
                                >
                                <div className={classNames({
                                    [styles.activeBorder]: (activeQuestionIndex === index),
                                })}/>
                                    {index + 1}
                                </motion.div>
                            )
                        })
                    }
                    {!isMobile ? (
                        <div className={styles.inActiveProgressBar}>
                            <div
                                className={styles.activeProgressBar}
                                style={{
                                    width: getActiveProgressPercentage()
                                }}
                            />
                        </div>
                    ) : <span />}
                </div>
                {!isMobile && (
                    <div
                        style={{ marginLeft: 22, transform: 'scaleX(-1)' }}
                        onClick={() => {
                            if ((activeQuestionIndex < questions.length-1)) {
                                changeQuestion(activeQuestionIndex+1)
                            }
                        }}
                        className={styles.arrowSVGContainer}
                    >
                        <ArrowSVG className={classNames({
                            [styles.arrowSVG]: activeQuestionIndex < questions.length-1,
                            [styles.disabled]: activeQuestionIndex >= questions.length-1
                        })} />
                    </div>
                )}
            </div>
            {checkIfEmbedEnabled() ? renderComponent() : null}
             <div className={classNames(styles.question, checkIfEmbedEnabled() && styles.embedQuestionStyle)}>
                {(()=>{
                    if (questions[activeQuestionIndex]){
                        const quiz = questions[activeQuestionIndex].question
                  if(quiz){
                      const questionProps = {
                        activeQuestionIndex,
                        question:quiz,
                        updateAnswers,
                        answers,
                        onCheckButtonClick,
                        isSeeAnswers,
                        isHomeWork,
                        answerType
                      }
                      if(quiz.questionType===FIBBLOCK){
                          return <FibBlock key={quiz.id} {...questionProps} isSubmittedForReview={isSubmittedForReview} withUpdatedDesign isMobile={isMobile} />
                      }
                      else if(quiz.questionType===ARRANGE){
                          return <Arrange key={quiz.id} {...questionProps} isSubmittedForReview={isSubmittedForReview}
                            withUpdatedDesign isMobile={isMobile} />
                      }
                      else if(quiz.questionType===FIBINPUT){
                          return <FibInput key={quiz.id} {...questionProps} isSubmittedForReview={isSubmittedForReview} withUpdatedDesign isMobile={isMobile} />
                      }
                      else if(quiz.questionType===MCQ){
                          return <Mcq key={quiz.id} {...questionProps} isSubmittedForReview={isSubmittedForReview} withUpdatedDesign isMobile={isMobile} />
                      }
                      else{
                          return null
                      }
                    }

                }})()}
            </div>
        </div>
    )
}

export default QuestionArea
