
import gql from 'graphql-tag'
import duck from '../duck'

const fetchMentorFeedback = sessionId =>
  duck.createQuery({
    query: gql`
      {
        mentorMenteeSession(id:"${sessionId}") {
          id
          rating
          sessionStartDate
          topic {
            id
            title
          }
          mentorSession {
            id
            user {
              name
              id
            }
          }
        }
      }
    `,
    type: 'mentorFeedback/fetch',
    key: 'mentorFeedback'
  })

export default fetchMentorFeedback
