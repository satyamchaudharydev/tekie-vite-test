import gql from 'graphql-tag'
import duck from '../../duck'

const getAdditionalFilter = (sessionConnectId) => {
  if (sessionConnectId) {
    return `mentorSessionConnectId: "${sessionConnectId}",`
  }
  return ''
}

const updateBatchSession = (batchSessionId, input, sessionConnectId, studentsConnectIds) => (
  duck.query({
    query: gql`
        mutation updateBatchSession($input: BatchSessionUpdate){
        updateBatchSession(
          input: $input,
          id:"${batchSessionId}",
          ${getAdditionalFilter(sessionConnectId)}
          ${studentsConnectIds ? `studentsConnectIds: [${studentsConnectIds}]` : ''}
        ) {
          id
          isRetakeSession
          sessionStatus
          attentionCount
          attentionAmount
          interactionCount
          interactionAmount
          studentBehaviour
          lengthOfContent
          learningObjectiveComponent
          contentImprovementSuggestion
          functionalitySuggestion
          generalSuggestion
        }
        }
        `,
    variables: {
      input,
      callBatchAPI: true
    },
    type: 'mentorSessions/update',
    key: 'updateBatchSession'
  })
)

export default updateBatchSession
