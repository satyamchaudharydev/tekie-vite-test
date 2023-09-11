
import gql from 'graphql-tag'
import duck from '../duck'

const updateUserCourseCompletion = (courseCompletionId, input, mentorIds) =>
  duck.createQuery({
    query: gql`
      mutation updateUserCourseCompletion($input: UserCourseCompletionUpdate) {
        updateUserCourseCompletion(id: "${courseCompletionId}", mentorsConnectIds: [${mentorIds}], input: $input) {
          id
          rating
          comment
          certificate {
            uri
          }
        }
      }
    `,
    variables: {
      input,
    },
    type: 'userCourseCompletions/update',
    key: 'userCourseCompletions'
  })

export default updateUserCourseCompletion
