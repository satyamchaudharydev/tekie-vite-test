import gql from 'graphql-tag'
import duck from '../../../duck'

const updateAdhocSession = (sessionId, input) => (
  duck.query({
    query: gql`
        mutation updateAdhocSession($input: AdhocSessionUpdate){
            updateAdhocSession(
          input: $input,
          id:"${sessionId}",
        ) {
            id
            sessionStatus
            sessionStartDate
            sessionEndDate
            }
        }
        `,
    variables: {
      input,
    },
    type: 'batchSessions/update',
  })
)

export default updateAdhocSession
