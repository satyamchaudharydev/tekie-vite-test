import gql from 'graphql-tag'

export const getMentorMenteeSessionQuery = (menteeId, topicId) => gql`{
    mentorMenteeSessions(filter:{
        and:[
            {menteeSession_some: {user_some: {id: "${menteeId}"}}}
            {topic_some: {id: "${topicId}"}}
        ]
    }){
        id
        sessionStatus
        sessionJoinedByMenteeAt
    }
}`

export const updateMentorMenteeSessionQuery = (id, date) => gql`mutation{
    updateMentorMenteeSession(
        id: "${id}",
        input:{
            sessionJoinedByMenteeAt: "${date}"
        },
      ){
          id
      }
}`

const getFetchMentorMenteeSessionWithMenteeTopicFilterQuery = (menteeId, topicId) => gql`
query {
    mentorMenteeSessions(filter:{
        and:[
            {menteeSession_some: {user_some: {id: "${menteeId}"}}}
            {topic_some: {id: "${topicId}"}}
        ]
    }) {
        id
        sessionStartDate
        sessionEndDate
        sessionStatus
        assignmentSubmitDate
        quizSubmitDate
        isSubmittedForReview
        sessionStatus
        sessionJoinedByMenteeAt
        menteeSession {
            id
        }
        mentorSession{
            id
        }
        isQuizSubmitted
        isAssignmentSubmitted
        isAssignmentAttempted
        isPracticeSubmitted
        practiceSubmitDate
        isHomeworkCheckedByMentor
        topic {
            id
            title
            order
            thumbnail {
                id
                uri
            }
            thumbnailSmall {
                id
                uri
            }
            chapter {
                id
                title
            }
        }
    }
}
`
export default getFetchMentorMenteeSessionWithMenteeTopicFilterQuery
