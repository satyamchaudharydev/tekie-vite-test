
import gql from 'graphql-tag'
import duck from '../duck'

const updateMentorFeedback = (id, input) =>
  duck.createQuery({
    query: gql`
      mutation updateMentorMenteeSession($id: ID!, $input: MentorMenteeSessionUpdate) {
        updateMentorMenteeSession(id: $id, input: $input) {
          id
        }
      }
    `,
    variables: {
      id,
      input
    },
    type: 'mentorFeedback/update',
    key: 'mentorFeedback'
  })

export default updateMentorFeedback
