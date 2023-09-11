import React from 'react'
import classNames from 'classnames'
import styles from './QuestionArea.module.scss'
import Mcq from '../../../../components/QuestionTypes/Mcq'
import Arrange from '../../../../components/QuestionTypes/Arrange'
import FibInput from '../../../../components/QuestionTypes/FibInput'
import FibBlock from '../../../../components/QuestionTypes/FibBlock'

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
      isSubmittedForReview
    })=>{
    return(
        <div className={styles.questionAreaContainer}>
            <div className={styles.questionNumberContainer}>
                {questions &&
                    questions.map((question,index)=>{
                        return (
                            <div className={classNames({ [styles.activeCircle]:(activeQuestionIndex===index),
                                [styles.circle]: true, [styles.unAttemptedCircle]:!isAnswered[index] })}
                                 key={question.id}
                                 onClick={()=> changeQuestion(index)}
                             >
                                        {index+1}
                            </div>
                        )
                    })
                }
            </div>
             <div className={styles.question}>
                {(()=>{
                    if (questions[activeQuestionIndex]){
                        const quiz = questions[activeQuestionIndex].question
                  if(quiz){
                      const questionProps = {
                        activeQuestionIndex,
                        question:quiz,
                        updateAnswers,
                        answers
                      }
                      if(quiz.questionType===FIBBLOCK){
                          return <FibBlock key={quiz.id} {...questionProps} isSubmittedForReview={isSubmittedForReview} />
                      }
                      else if(quiz.questionType===ARRANGE){
                          return <Arrange key={quiz.id} {...questionProps} isSubmittedForReview={isSubmittedForReview} />
                      }
                      else if(quiz.questionType===FIBINPUT){
                          return <FibInput key={quiz.id} {...questionProps} isSubmittedForReview={isSubmittedForReview} />
                      }
                      else if(quiz.questionType===MCQ){
                          return <Mcq key={quiz.id} {...questionProps} isSubmittedForReview={isSubmittedForReview} />
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
