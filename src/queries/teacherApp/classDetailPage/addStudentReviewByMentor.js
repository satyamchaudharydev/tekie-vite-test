import gql from 'graphql-tag'
import duck from '../../../duck'
import getIdArrForQuery from '../../../utils/getIdArrForQuery'
// courseConnectId: "${courseId}",
const addStudentReviewByMentor = ( input, topicId, userId, batchId, reviewerId) =>
   duck.query({
    query: gql`
    mutation($input: StudentReviewByMentorInput!) {
        addStudentReviewByMentor(
        input: $input,
        topicConnectId: "${topicId}",
        userConnectId: "${userId}",
        batchConnectId: "${batchId}",
        reviewedByConnectId: "${reviewerId}"
      ) {
        id
      }
    }
    `,
    variables: {
      input
    },
    key: 'classroomDetail',
    type: 'studentReviewByMentor/add',
})


export default addStudentReviewByMentor
