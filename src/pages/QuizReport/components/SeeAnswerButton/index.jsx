import React, { Component } from 'react'
import styles from './SeeAnswerButton.module.scss'
import ArrowButton from '../../../../components/Buttons/ArrowButton'

export default class SeeAnswerButton extends Component {
    handleOnClick = () => {
        if (this.props.path === '/quiz-report-first/:topicId') {
            this.props.history.push(`/see-answers-first/${this.props.topicId}`)
        } else if (this.props.path === '/quiz-report-latest/:topicId') {
            this.props.history.push(`/see-answers-latest/${this.props.topicId}`)
        } else if (this.props.path === '/sessions/quiz-report-latest/:topicId') {
            this.props.history.push(`/sessions/see-answers-latest/${this.props.topicId}`)
            this.props.history.push({
                pathname: `/sessions/see-answers-latest/${this.props.topicId}`,
                state: {
                    quizReportTopicId: this.props.quizReportTopicId
                }
            })
        }
    }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.buttonWrapper}
             onClick={this.handleOnClick}
        >
          <ArrowButton
            title="See Answers"
            buttonContainer={styles.buttonContainer}
            buttonText={styles.buttonText}
            iconCircle={styles.iconCircle}
          />
        </div>
      </div>
    )
  }
}

