import React from 'react'
import classNames from 'classnames'
import styles from './QuestionArea.module.scss'
import Mcq from '../../../../components/QuestionTypes/Mcq'
import Arrange from '../../../../components/QuestionTypes/Arrange'
import FibInput from '../../../../components/QuestionTypes/FibInput'
import FibBlock from '../../../../components/QuestionTypes/FibBlock'
import { visiblePqStoryOverlay } from '../../constants'

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
    answerType
}) => {
    const practiceQuestions = (userPracticeQuestions.get('practiceQuestions'))
        ? userPracticeQuestions.get('practiceQuestions').toJS() : []
    return (
        <div className={styles.questionAreaContainer}>
            <div className={styles.storyIcon} onClick={() => openOverlay(visiblePqStoryOverlay)}></div>
            <div className={styles.questionNumberContainer}>
                {practiceQuestions &&
                    practiceQuestions.map((question, index) => {
                        const questionStatus = answersAdditionalInfo &&
                            answersAdditionalInfo[index] &&
                            answersAdditionalInfo[index - 1] &&
                            answersAdditionalInfo[index - 1].status !== 'complete'
                        return (
                            <div className={classNames({
                                [styles.activeCircle]: (activeQuestionIndex === index),
                                [styles.circle]: true, [styles.unAttemptedCircle]: (questionStatus)
                            })}
                                key={question.id}
                                onClick={() => { if (!questionStatus) { changeQuestion(index) } }}
                            >
                                {index + 1}
                            </div>
                        )
                    })
                }
            </div>
            <div className={styles.question}>
                {(() => {
                    if (practiceQuestions[activeQuestionIndex]) {
                        const pq = practiceQuestions[activeQuestionIndex].question
                        if (pq) {
                            const questionProps = {
                                activeQuestionIndex,
                                question: pq,
                                updateAnswers,
                                answers
                            }
                            if (pq.questionType === FIBBLOCK) {
                                return <FibBlock key={pq.id} {...questionProps} />
                            }
                            else if (pq.questionType === ARRANGE) {
                                return <Arrange key={pq.id} {...questionProps} />
                            }
                            else if (pq.questionType === FIBINPUT) {
                                return <FibInput key={pq.id} {...questionProps} />
                            }
                            else if (pq.questionType === MCQ) {
                                return <Mcq key={pq.id} {...questionProps} answerType={answerType} />
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
