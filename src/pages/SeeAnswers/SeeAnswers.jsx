import React, { Component } from 'react'
import { sortBy, get } from 'lodash'
import classNames from 'classnames'
import styles from '../Quiz/components/QuestionArea/QuestionArea.module.scss'
import fetchQuizAnswers from '../../queries/fetchQuizAnswers'
import Mcq from '../../components/QuestionTypes/Mcq'
import Arrange from '../../components/QuestionTypes/Arrange'
import FibInput from '../../components/QuestionTypes/FibInput'
import FibBlock from '../../components/QuestionTypes/FibBlock'
import getSortedQuizAnswers from '../../utils/getSortedQuizAnswers'
import {getMcqOptionsWithStatus, getFibBlockAnswersWithStatus} from '../../utils/getQuizOptions'
import { NextButton } from '../../components/Buttons/NextButton'
import Skeleton from '../../components/QuestionTypes/Skeleton'

const MCQ = 'mcq'
const FIB_BLOCK = 'fibBlock'
const FIB_INPUT = 'fibInput'
const ARRANGE  = 'arrange'

class SeeAnswers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedQuestionIndex: 1,
            answerTypeSelected: 'YS'
        }
    }

    async componentDidMount() {
        const { quizReportId } = this.props
        fetchQuizAnswers(quizReportId).call()
    }

    renderQuestion = (quizAnswers, selectedQuestionIndex) => {
        if (quizAnswers && quizAnswers.length > 0) {
            const question = quizAnswers[selectedQuestionIndex - 1].question
            if (this.state.answerTypeSelected === 'RS') {
                question.mcqOptions = quizAnswers[selectedQuestionIndex - 1].mcqOptions
                question.fibBlocksOptions = quizAnswers[selectedQuestionIndex - 1].fibBlocksOptions
                question.arrangeOptions = quizAnswers[selectedQuestionIndex - 1].arrangeOptions
                question.fibInputOptions = quizAnswers[selectedQuestionIndex - 1].fibInputOptions
            } else if (this.state.answerTypeSelected === 'YS') {
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
            }
            const questionProps = {
                activeQuestionIndex: selectedQuestionIndex + 1,
                question,
                answers: [],
                isAttempted: quizAnswers[selectedQuestionIndex - 1].isAttempted
            }
            if (question) {
                if (question.questionType === FIB_BLOCK) {
                    return <FibBlock
                        key={question.id}
                        {...questionProps}
                        isSeeAnswers
                        answerType={this.state.answerTypeSelected}
                    />
                } else if (question.questionType === ARRANGE) {
                    return <Arrange
                        key={question.id}
                        {...questionProps}
                        isSeeAnswers
                        answerType={this.state.answerTypeSelected}
                    />
                } else if (question.questionType === FIB_INPUT) {
                    return <FibInput
                        key={question.id}
                        {...questionProps}
                        isSeeAnswers
                        answerType={this.state.answerTypeSelected}
                    />
                } else if (question.questionType === MCQ) {
                    return <Mcq
                        key={question.id}
                        {...questionProps}
                        isSeeAnswers
                        answerType={this.state.answerTypeSelected}
                    />
                }
            }
        }
    }

    changeSelectedQuestionIndex = (index) => {
        this.setState({
            selectedQuestionIndex: index
        })
    }

    changeAnswerTypeSelected = (type) => {
        this.setState({
            answerTypeSelected: type
        })
    }

    getAnswerStatus = (answer) => {
        if (answer) {
            if (answer.isAttempted) {
                if (answer.isCorrect) {
                    return 'correct'
                } else {
                    return 'wrong'
                }
            }

            return 'notAttempted'
        }

        return ''
    }

    render () {
        const quizAnswers = this.props.userQuizAnswers.getIn([0, 'quizAnswers'])
        const sortedQuizAnswers = quizAnswers ?
            getSortedQuizAnswers(sortBy(quizAnswers.toJS(), 'question.learningObjective.order')) || []
            : []
        if (!this.props.userQuizAnswersStatus.getIn(['loading'])) {
            return(
                <div className={styles.mainContainer}>
                    <div className={styles.questionAreaContainer}>
                        <div className={styles.questionNumberContainer}>
                            {
                                sortedQuizAnswers.map((quiz,index)=>{
                                    return (
                                        <div className={classNames({
                                            [styles.circle]: true,
                                            [styles.unAttemptedCircle]: !quiz.isAttempted,
                                            [styles.correctCircle]: quiz.isCorrect,
                                            [styles.incorrectCircle]: quiz.isAttempted && !quiz.isCorrect,
                                            [styles.activeCircle]: this.state.selectedQuestionIndex === index + 1
                                        })}
                                             key={quiz.question.id}
                                             onClick={() => this.changeSelectedQuestionIndex(index + 1)}
                                        >
                                            { index+1 }
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <div className={styles.questionContainer}>
                        {
                            this.renderQuestion(sortedQuizAnswers, this.state.selectedQuestionIndex)
                        }
                    </div>
                    <div>
                        <div className={styles.footer}>
                            <div className={styles.answerTypeContainer}>
                                <div className={
                                    classNames({
                                        [styles.type]: true,
                                        [styles.selectedType]: this.state.answerTypeSelected === 'YS' &&
                                        this.getAnswerStatus(sortedQuizAnswers[this.state.selectedQuestionIndex - 1]) === 'correct',
                                        [styles.wrong]: this.state.answerTypeSelected === 'YS' &&
                                        this.getAnswerStatus(sortedQuizAnswers[this.state.selectedQuestionIndex - 1]) === 'wrong',
                                        [styles.notAnswered]: this.state.answerTypeSelected === 'YS' &&
                                        this.getAnswerStatus(sortedQuizAnswers[this.state.selectedQuestionIndex - 1]) === 'notAttempted'
                                    })
                                }
                                        onClick={() => this.changeAnswerTypeSelected('YS')}
                                >
                                    YOUR ANSWER
                                </div>
                                <div className={styles.type} />
                                <div className={
                                    classNames({
                                        [styles.type]: true,
                                        [styles.selectedType]: this.state.answerTypeSelected === 'RS'
                                    })
                                }
                                        onClick={() => this.changeAnswerTypeSelected('RS')}
                                >
                                    RIGHT ANSWER
                                </div>
                            </div>
                        </div>
                        {
                            this.props.match.path === '/sessions/see-answers-latest/:topicId'
                                ? (
                                    <div className={styles.buttonWrapper}>
                                        <div
                                            onClick={() => {
                                                if (this.props.location.state) {
                                                    this.props.history.push(`/sessions/codingAssignment/${this.props.match.params.topicId}`,{
                                                        prevTopicId: this.props.location.state && this.props.location.state.quizReportTopicId
                                                    })
                                                }
                                            }}
                                        >
                                            <NextButton title='Coding Assignment'/>
                                        </div>
                                    </div>
                                )
                                : (
                                    <div />
                                )
                        }
                    </div>
                </div>
            )
        }

        return <Skeleton />
    }
}

export default SeeAnswers
