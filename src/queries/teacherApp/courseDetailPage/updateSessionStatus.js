import gql from 'graphql-tag'
import duck from '../../../duck'

const updateSessionStatus = (sessionId, input) => (
  duck.query({
    query: gql`
        mutation updateBatchSession($input: BatchSessionUpdate){
        updateBatchSession(
          input: $input,
          id:"${sessionId}",
        ) {
            id
            sessionStatus
            sessionStartDate
            sessionEndDate
            isRetakeSession
            }
        }
        `,
    variables: {
      input,
    },
    type: 'batchSessions/update',
  })
)

export default updateSessionStatus
