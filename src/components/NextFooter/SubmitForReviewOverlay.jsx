import { get } from 'lodash'
import React from 'react'
import { homeworkComponents } from '../../constants/homework'
import SubmitOverlayMenu from '../../pages/Quiz/components/SubmitOverlayMenu/SubmitOverlayMenu'
import updateMentorMenteeSession from '../../queries/sessions/updateMentorMenteeSession'
import getMe from '../../utils/getMe'

const SubmitForReviewOverlay = (props) => {
  // const visible = parent === 'homework' && !isSubmittedForReview && (this.state.showSubmitOverlay || this.state.reviewSubmitClicked)
  const { topic, topicId, courseId, mentorMenteeSessionUpdateStatus, mentorMenteeSession } = props
  const getHomeWorkComponents = () => {
    let topicComponentRule = []
    topicComponentRule = get(topic, 'topicComponentRule', [])
    const homeworkComponentRule = topicComponentRule.filter(
      e => homeworkComponents.includes(get(e, 'componentName'))
    )
    const quizComponent = topicComponentRule.filter(rule => 
      get(rule, 'componentName') === 'quiz')[0] || null
    const assignmentComponent = topicComponentRule.filter(rule => 
      get(rule, 'componentName') === 'homeworkAssignment'
    )[0] || null
    const practiceComponent = topicComponentRule.filter(rule => 
      get(rule, 'componentName') === 'homeworkPractice'
    )[0] || null
    return {
        quizComponent,
        assignmentComponent,
        practiceComponent,
        homeworkComponentRule,
    }
  }

  const getSubmitOverlayMsg = () => {
    const { mentorMenteeSession } = props
    const { quizComponent, assignmentComponent, practiceComponent } = getHomeWorkComponents()
    if (mentorMenteeSession) {
      if (quizComponent && assignmentComponent && practiceComponent) {
          if (!mentorMenteeSession.getIn([0, 'isQuizSubmitted']) && props.visible) {
              return 'Complete quiz before submitting!'
          } else if (!mentorMenteeSession.getIn([0, 'isAssignmentSubmitted']) && props.visible) {
              return 'Complete coding assignment before submitting!'
          } else if (!mentorMenteeSession.getIn([0, 'isPracticeSubmitted']) && props.visible) {
              return 'Complete practice before submitting!'
          }
      } else if (quizComponent && assignmentComponent) {
          if (!mentorMenteeSession.getIn([0, 'isQuizSubmitted']) && props.visible) {
              return 'Complete quiz before submitting!'
          } else if (!mentorMenteeSession.getIn([0, 'isAssignmentSubmitted']) && props.visible) {
              return 'Complete coding assignment before submitting!'
          }
      } else if (quizComponent || assignmentComponent || practiceComponent) {
          if (quizComponent && !mentorMenteeSession.getIn([0, 'isQuizSubmitted']) && props.visible) {
              return 'Complete quiz before submitting!'
          }
          if (assignmentComponent && !mentorMenteeSession.getIn([0, 'isAssignmentSubmitted']) && props.visible) {
              return 'Complete coding assignment before submitting!'
          }
          if (practiceComponent && !mentorMenteeSession.getIn([0, 'isPracticeSubmitted']) && props.visible) {
              return 'Complete practice before submitting!'
          }
      }
      if (props.visible) {
          return 'Are you sure you want to submit the homework for review?'
      }
    }
  }

  const checkIfHomeworkCompleted = () => {
    const { quizComponent, assignmentComponent, practiceComponent, homeworkComponentRule } = getHomeWorkComponents()
    if (homeworkComponentRule && homeworkComponentRule.length) {
      return homeworkComponentRule.every(componentRule => {
        if (componentRule.componentName === 'quiz') {
            return mentorMenteeSession.getIn([ 0, 'isQuizSubmitted' ]);
        } else if (componentRule.componentName === 'homeworkAssignment') {
            return mentorMenteeSession.getIn([0, 'isAssignmentSubmitted'])
        } else if (componentRule.componentName === 'homeworkPractice') {
            return mentorMenteeSession.getIn([0, 'isPracticeSubmitted'])
        }
        return false;
      })
    } else {
      if (quizComponent && (assignmentComponent || practiceComponent)) {
        return (mentorMenteeSession &&
              mentorMenteeSession.getIn([0, 'isQuizSubmitted']) &&
            (mentorMenteeSession.getIn([0, 'isAssignmentSubmitted']) ||
                mentorMenteeSession.getIn([0, 'isPracticeSubmitted']))
          )
      } else if (quizComponent || assignmentComponent || practiceComponent) {
        if(quizComponent) return (mentorMenteeSession && mentorMenteeSession.getIn([0, 'isQuizSubmitted']))
        if(assignmentComponent) return (mentorMenteeSession && mentorMenteeSession.getIn([0, 'isAssignmentSubmitted']))
        if(practiceComponent) return (mentorMenteeSession && mentorMenteeSession.getIn([0, 'isPracticeSubmitted']))
      }
    }
    return false
  }

  const submitForReview = async () => {
    const shouldSubmit = checkIfHomeworkCompleted(mentorMenteeSession)
    let sessionId = null
    //   const badgeInCache = unlockBadge &&
    //     filterKey(unlockBadge, `unlockBadge/quiz/${topicId}`)
    if (mentorMenteeSession && mentorMenteeSession.toJS().length > 0) {
        mentorMenteeSession.toJS().forEach((session) => {
            if (session.topicId === topicId) {
                sessionId = session.id
            }
        })
    }
    if (shouldSubmit && sessionId) {
      const input = {
          isSubmittedForReview: true
      }
      updateMentorMenteeSession(sessionId, input, topicId, true).call()
    }
  }

  if (props.visible) {
    return (
      <SubmitOverlayMenu
        title='Submit for Review'
        visible={props.visible}
        onQuizSubmit={() => {}}
        message={getSubmitOverlayMsg()}
        closeOverlay={props.closeOverlay}
        isLoading={mentorMenteeSessionUpdateStatus && mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'loading'])}
        isSuccess={mentorMenteeSessionUpdateStatus && mentorMenteeSessionUpdateStatus.getIn([`mentorMenteeSession/${topicId}`, 'success'])}
        submitForReviewOverlay={true}
        closeImmediately={true}
        onSubmitForReview={submitForReview}
        isHomeworkComplete={checkIfHomeworkCompleted(mentorMenteeSession)}
        userFirstAndLatestQuizReport={props.userFirstAndLatestQuizReport}
        userId={get(getMe(), 'id')}
        topicId={topicId}
        courseId={courseId}
        topicComponentRule={get(topic, 'topicComponentRule')  }
        disabled={!checkIfHomeworkCompleted(mentorMenteeSession)}
        history={props.history}
      />
    )
  }

  return <></>
}

export default SubmitForReviewOverlay

