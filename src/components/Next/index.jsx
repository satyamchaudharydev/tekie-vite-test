import React, { Component } from 'react'
import { connect } from 'react-redux'
import { isNumber } from 'lodash'
import cx from 'classnames'
import { withRouter } from 'react-router-dom'
import ArrowButton from '../Buttons/ArrowButton'
import styles from './Next.module.scss'
import fetchTopicJourney from '../../queries/fetchTopicJourney'
import { sort } from '../../utils/immutable'

class Next extends Component {
  handleClick = () => {
    const { match, learningObjective, history } = this.props
    if (
        match.path === '/practice-report/:topicId/:loId' ||
        match.path === '/sessions/practice-report/:topicId/:loId' ||
        match.path === '/revisit/sessions/practice-report/:topicId/:loId'
    ) {

      const { topicId, loId } = match.params
      const orderedLO = sort.ascend(learningObjective, ['order'])
      const currentLOIndex = orderedLO.findIndex(lo => lo.get('id') === loId)
      if (isNumber(currentLOIndex)) {
        if (currentLOIndex + 1 === orderedLO.size) {
          if (match.path === '/sessions/practice-report/:topicId/:loId') {
            history.push(`/sessions/coding/${topicId}`)
          } else if (match.path === '/revisit/sessions/practice-report/:topicId/:loId') {
            history.push(`/revisit/sessions/coding/${topicId}`)
          } else {
            history.push(`/codingAssignment/${topicId}`)
          }
        } else {
          const nextLOId = orderedLO.getIn([currentLOIndex + 1, 'id'])
          if (match.path === '/sessions/practice-report/:topicId/:loId') {
            history.push(`/sessions/chat/${topicId}/${nextLOId}`)
          } else if (match.path === '/revisit/sessions/practice-report/:topicId/:loId') {
            history.push(`/revisit/sessions/chat/${topicId}/${nextLOId}`)
          } else {
            history.push(`/chat/${topicId}/${nextLOId}`)
          }
        }
      }
    }
  }

  render() {
    return (
      <div className={cx(styles.container, this.props.containerClass)}>
        <div className={!this.props.isReportPage ? styles.button : styles.reportPageButtonStyle}>
          <ArrowButton onClick={this.handleClick} title="Next" />
        </div>
      </div>
    )
  }
}

export default withRouter(connect(
  (state, { match }) => fetchTopicJourney(match.params.topicId).mapStateToProps(state)
)(Next))
