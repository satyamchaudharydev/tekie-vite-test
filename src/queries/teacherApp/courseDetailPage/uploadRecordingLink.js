import gql from 'graphql-tag'
import duck from '../../../duck'

const updateRecordingLink = (sessionId, link) => (
  duck.query({
    query: gql`
    mutation {
        updateBatchSession(id: "${sessionId}", input: { sessionRecordingLink: "${link}" }) {
          id
          sessionRecordingLink
        }
      }
        `,
    type: 'batchSessions/update',
  })
)

export default updateRecordingLink
