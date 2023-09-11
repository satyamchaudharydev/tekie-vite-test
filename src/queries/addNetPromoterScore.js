import gql from 'graphql-tag'
import duck from '../duck'

const addNetPromoterScore = (id, input, batchOrSessionId, courseId, batchType = false) =>
  duck.createQuery({
    query: gql`
    mutation($input: NetPromoterScoreInput!) {
      addNetPromoterScore(
        input: $input,
        userConnectId:"${id}",
        courseConnectId:"${courseId}",
        ${batchOrSessionId ? `${batchType ? `batchSessionConnectId:"${batchOrSessionId}"` : `mentorMenteeSessionConnectId:"${batchOrSessionId}"`}` : ''}
      ) {
        id
      }
    }
    `,
    variables: {
      input
    },
    key: 'addNps',
    type: 'nps/add',
})

export default addNetPromoterScore
