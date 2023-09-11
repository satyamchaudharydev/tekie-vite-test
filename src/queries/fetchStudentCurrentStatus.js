import gql from 'graphql-tag'
import duck from '../duck'

const fetchStudentCurrentStatus = (userId) =>
  duck.query({
    query: gql`
      {
        getStudentCurrentStatus(input: { userId: "${userId}" }) {
            status
        }
      }
    `,
    type: 'getStudentCurrentStatus/fetch',
    key: 'getStudentCurrentStatus'
  })

export default fetchStudentCurrentStatus
