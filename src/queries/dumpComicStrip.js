import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'
import buddyQueriesCaller from './utils/buddyQueriesCaller'

const dumpComicStrip = (userId, learningObjectiveId, courseId, input, force = false) => {
  buddyQueriesCaller('addUserActivityComicStripDump', { learningObjectiveId, courseId, comicStripInput: input })
  return duck.createQuery({
    query: gql`
      mutation addUserActivityComicStripDump(
        $userId: ID
        $learningObjectiveId: ID
        $input: UserActivityComicStripDumpInput!
      ) {
        addUserActivityComicStripDump(
          userConnectId: $userId
          ${courseId ? `courseConnectId: "${courseId}"` : ''}
          learningObjectiveConnectId: $learningObjectiveId
          input: $input
        ) {
          id
        }
      }
    `,
    variables: {
      userId,
      learningObjectiveId,
      input,
      tokenType: 'withMenteeMentorToken'
    },
    key: learningObjectiveId,
    type: 'dumpComicStrip/fetch',
    force
  })
}

export default dumpComicStrip
