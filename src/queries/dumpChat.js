import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'
import { getCourseConnectString } from '../utils/getCourseId'
import buddyQueriesCaller from './utils/buddyQueriesCaller'

const dumpChat = (userId, learningObjectiveId, input, userLOId, force = false, courseId, topicId = '') =>
 { 
  buddyQueriesCaller('addUserActivityChatDump',{learningObjectiveId, chatAction:input,courseId,topicId})
  return duck.createQuery({
        query: gql`
      mutation addUserActivityChatDump(
        $userId: ID
        $learningObjectiveId: ID
        $input: UserActivityChatDumpInput!
      ) {
        addUserActivityChatDump(
          userConnectId: $userId
          ${!courseId ? getCourseConnectString(topicId) : ''}
          learningObjectiveConnectId: $learningObjectiveId
          ${courseId ? `courseConnectId: "${courseId}"` : ''}
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
        type: 'dumpChat/fetch',
        force
    })}

export default dumpChat
