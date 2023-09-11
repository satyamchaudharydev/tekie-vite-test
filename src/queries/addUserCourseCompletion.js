
import gql from 'graphql-tag'
import duck from '../duck'

const addUserCourseCompletion = (courseConnectId, userConnectId, input, mentorIds) =>
  duck.createQuery({
    query: gql`
      mutation addUserCourseCompletion($courseConnectId: ID!, $userConnectId: ID!, $input: UserCourseCompletionInput!) {
        addUserCourseCompletion(courseConnectId: $courseConnectId, userConnectId: $userConnectId, input: $input,
        mentorsConnectIds: [${mentorIds}]) {
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
      courseConnectId,
      userConnectId,
      input,
    },
    type: 'userCourseCompletions/add',
    key: 'userCourseCompletions'
  })

export default addUserCourseCompletion
