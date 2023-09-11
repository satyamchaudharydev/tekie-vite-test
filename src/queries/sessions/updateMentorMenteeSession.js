import gql from 'graphql-tag'
import duck from '../../duck/duckIfCacheExists'

const updateMentorMenteeSession = (id, input, topicId, force = false, courseId) => duck.createQuery ({
    query : gql`
      mutation($input:MentorMenteeSessionUpdate) {
      updateMentorMenteeSession(
        id: "${id}",
        input:$input,
          ${courseId ? `courseConnectId:"${courseId}"` : ''}
      ){
        id
        topic{
          id
          title
        }
        sessionStartDate
        sessionEndDate
        isQuizSubmitted
        isHomeworkCheckedByMentor
        isAssignmentSubmitted
        isAssignmentAttempted
        isPracticeSubmitted
        practiceSubmitDate
        assignmentSubmitDate
        isSubmittedForReview
        sessionStatus
        quizSubmitDate
        menteeSession {
          id
        }
        mentorSession {
          id
        }
      }
    }
    `,
    variables: {
        input,
        tokenType: 'withMenteeMentorToken'
    },
    type: 'mentorMenteeSession/update',
    key: `mentorMenteeSession/${topicId}`,
    force
})


export default updateMentorMenteeSession
