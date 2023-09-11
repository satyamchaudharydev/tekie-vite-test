import React from 'react'
import classNames from 'classnames'
import styles from './QuestionAreaReview.module.scss'
import Mcq from '../../../../../components/QuestionTypes/Mcq'
import Arrange from '../../../../../components/QuestionTypes/Arrange'
import FibInput from '../../../../../components/QuestionTypes/FibInput'
import FibBlock from '../../../../../components/QuestionTypes/FibBlock'
import { getMcqOptionsWithStatus } from '../../../../../utils/getQuizOptions'
import ArrowSVG from '../../../../../assets/arrowIcon'
import { motion } from 'framer-motion'
import { get, sortBy } from 'lodash'
import parseMetaTags from '../../../../../utils/parseMetaTags'
import PQStyles from '../../../PracticeQuiz/components/QuestionArea/QuestionArea.module.scss'
import { checkIfEmbedEnabled } from '../../../../../utils/teacherApp/checkForEmbed'

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
      match,
      noTopMargin = false,
      renderComponent = () => {}
    })=>{
    const path = get(match, 'path', '')
    
    const [isExplanationVisible, setIsExplanationVisible] = React.useState(isMobile ? false : true)

    const getActiveProgressPercentage = () => {
        const totalQuestions = (questions && questions.length) || 0
        return `${((activeQuestionIndex)*100)/(totalQuestions-1)}%`
    }

    const getQuestionObj = (quizAnswers, selectedQuestionIndex,) => {
        let questionProps = { question: {}, actualQuestionAnswer: {}, mcqOptionsOg: {} }
        if (quizAnswers && quizAnswers.length > 0) {
            const mcqOptionsOgDoc = get(quizAnswers[selectedQuestionIndex - 1], 'question.mcqOptions', [])
            const question = quizAnswers[selectedQuestionIndex - 1].question
            const actualQuestionAnswer = {
                mcqOptions: quizAnswers[selectedQuestionIndex - 1].mcqOptions,
                fibBlocksOptions: quizAnswers[selectedQuestionIndex - 1].fibBlocksOptions,
                arrangeOptions: quizAnswers[selectedQuestionIndex - 1].arrangeOptions,
                fibInputOptions: quizAnswers[selectedQuestionIndex - 1].fibInputOptions,
            }
            question.mcqOptions = getMcqOptionsWithStatus(
                quizAnswers[selectedQuestionIndex - 1].mcqOptions,
                quizAnswers[selectedQuestionIndex - 1].userMcqAnswer,
                quizAnswers[selectedQuestionIndex - 1].isAttempted
                )
            
            if (quizAnswers[selectedQuestionIndex - 1].isAttempted) {
                const finalFibBlockOptions = []
                const sortedUserFibBlockAnswers = sortBy(quizAnswers[selectedQuestionIndex - 1].userFibBlockAnswer, 'position')
                const selectedFibBlockOptions = []
                let alreadyIncludedPositions = []
                sortedUserFibBlockAnswers.forEach(option => {
                    if (!alreadyIncludedPositions.includes(get(option, 'position'))) {
                        selectedFibBlockOptions.push(option)
                        alreadyIncludedPositions.push(get(option, 'position'))
                    }
                })
                const selectedBlocksStatement = []
                alreadyIncludedPositions = []
                selectedFibBlockOptions.forEach(option => {
                    if (!alreadyIncludedPositions.includes(get(option, 'position'))) {
                        selectedBlocksStatement.push(get(option, 'statement'))
                        alreadyIncludedPositions.push(get(option, 'position'))
                    }
                })
                quizAnswers[selectedQuestionIndex - 1].fibBlocksOptions.forEach((option) => {
                    let i
                    let isPresent = false
                    for (i = 0; i < selectedBlocksStatement.length; i += 1) {
                        if (selectedBlocksStatement[i] === get(option, 'statement')) {
                            isPresent = true
                            break
                        }
                    }
                    if (isPresent) {
                        let j
                        for(j = 0; j < selectedFibBlockOptions.length; j += 1) {
                            if(get(selectedFibBlockOptions[j], 'statement') === get(option, 'statement')) {
                                option.position = get(selectedFibBlockOptions[j], 'position')
                                break
                            }
                        }
                        finalFibBlockOptions.push(option)
                        selectedBlocksStatement.splice(i, 1)
                        selectedFibBlockOptions.splice(j, 1)
                    } else {
                        finalFibBlockOptions.push(option)
                    }
                })
                question.fibBlocksOptions = finalFibBlockOptions
            } else {
                question.fibBlocksOptions = quizAnswers[selectedQuestionIndex - 1].fibBlocksOptions
            }
            question.arrangeOptions = quizAnswers[selectedQuestionIndex - 1].isAttempted
                ? sortBy(quizAnswers[selectedQuestionIndex - 1].userArrangeAnswer, 'position')
                : quizAnswers[selectedQuestionIndex - 1].question.arrangeOptions
            question.fibInputOptions = quizAnswers[selectedQuestionIndex - 1].userFibInputAnswer
            questionProps = {
                question,
                actualQuestionAnswer,
                mcqOptionsOg: mcqOptionsOgDoc,
                isAttempted: quizAnswers[selectedQuestionIndex - 1].isAttempted
            }
        }
        return questionProps
    }

    const getQuestionStatus = (question) => {
        let status = 'unAttempted'
        let renderSection = (
            <div className={styles.answerContainer}>
                The question is
                <span className={styles.unansweredContainer}>
                    {' '} Unanswered
                    <span />
                </span>
            </div>
        )
        if (question) {
            if (question.isAttempted) {
                if (question.isCorrect) {
                    status = 'correct'
                    renderSection = (
                        <div className={styles.answerContainer}>
                            Your Answer :
                            <span className={styles.correctAnswerContainer}>
                                {' '}Is Correct
                                <span />
                            </span>
                        </div>
                    )
                } else {
                    status = 'incorrect'
                    renderSection = (
                        <div className={styles.answerContainer}>
                            Your Answer :
                            <span className={styles.inCorrectAnswerContainer}>
                                {' '}Is Incorrect
                                <span />
                            </span>
                        </div>
                    )
                }
            }
        }
        return {status, renderSection}
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
                [styles.noMarginTop]: noTopMargin || checkIfEmbedEnabled()
            })}>
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
                                        // [styles.activeCircle]: (activeQuestionIndex === index),
                                        [styles.circle]: true,
                                        [styles.mActiveCircle]: ((activeQuestionIndex === index) && isMobile) ,
                                        [styles.unAttemptedCircle]: !question.isAttempted,
                                        [styles.correctCircle]: question.isCorrect,
                                        [styles.incorrectCircle]: question.isAttempted && !question.isCorrect,
                                    })}
                                    key={question.id}
                                    onClick={() => {
                                        if (isMobile) {
                                            setIsExplanationVisible(false)
                                        }
                                        changeQuestion(index)
                                    }}
                                >
                                <div 
                                    className={classNames({
                                        [styles.unAttemptedQuestionIcon]: !question.isAttempted,
                                        [styles.wrongQuestionIcon]: question.isAttempted && !question.isCorrect,
                                    })}
                                />
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
             <div className={styles.question}>
                {(()=>{
                    console.warn({
                        answers: answers[activeQuestionIndex],
                        question: questions[activeQuestionIndex]
                    })
                    if (questions[activeQuestionIndex]) {
                        const { question: quiz, actualQuestionAnswer, mcqOptionsOg } = getQuestionObj(questions, activeQuestionIndex+1)
                        const questionStatus = getQuestionStatus(questions[activeQuestionIndex])
                  if(quiz){
                      const questionProps = {
                        activeQuestionIndex,
                        question: quiz,
                        actualQuestionAnswer,
                        updateAnswers,
                        answers,
                        questionStatus,
                        mcqOptionsOg,
                      }
                      if(quiz.questionType===FIBBLOCK){
                          return <FibBlock key={quiz.id} {...questionProps} isSubmittedForReview={isSubmittedForReview} withUpdatedDesign isMobile={isMobile} />
                      }
                      else if(quiz.questionType===ARRANGE){
                          return <Arrange key={quiz.id} {...questionProps} isSubmittedForReview={isSubmittedForReview} withUpdatedDesign isMobile={isMobile} />
                      }
                      else if(quiz.questionType===FIBINPUT){
                          return <FibInput key={quiz.id} {...questionProps} isSubmittedForReview={isSubmittedForReview} withUpdatedDesign isMobile={isMobile} />
                      }
                      else if(quiz.questionType===MCQ){
                          return <Mcq key={quiz.id} {...questionProps} fromReview isSubmittedForReview={isSubmittedForReview} withUpdatedDesign isMobile={isMobile} />
                      }
                      else{
                          return null
                      }
                    }

                }})()}
                {(isMobile && !isExplanationVisible && isSubmittedForReview && get(questions[activeQuestionIndex], 'question.explanation')) && (
                    <p className={styles.expandExplanationText}>
                        FOR EXPLANATION
                        <span onClick={() => {
                            setIsExplanationVisible(true)
                        }}>
                            CLICK HERE
                        </span>
                    </p>
                )}
                {isExplanationVisible && (isSubmittedForReview && get(questions[activeQuestionIndex], 'question.explanation')) && (
                    <div className={styles.explanationContainer}>
                        <div className={styles.explanationIcon} />
                        <div className={styles.explanationTextContainer}>
                            Explanation:
                            <div className={styles.explanationText}>
                                {parseMetaTags({ statement: get(questions[activeQuestionIndex], 'question.explanation') })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default QuestionArea
