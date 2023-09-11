
import gql from 'graphql-tag'
import duck from '../duck'

const updateAttendence = (batchSessionId, studentProfileId) =>
  duck.createQuery({
    query: gql`
    mutation {
        updateBatchSession(
          id: "${batchSessionId}"
          input: {
            attendance: {
              updateWith: { isPresent: true, status:present }
              updateWhere: { studentReferenceId: "${studentProfileId}" }
            }
          }
        ) {
          id
        }
      }
    `,
    type: 'attendence/update',
    key: 'attendence'
  })

export default updateAttendence
