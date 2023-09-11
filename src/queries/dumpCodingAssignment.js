import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'
import buddyQueriesCaller from './utils/buddyQueriesCaller'

const dumpCodingAssignment = (
    userId,
    topicId,
    input,
    tokenType,
  force = false,
    courseId,
) =>
    {
      buddyQueriesCaller('addUserActivityAssignmentDump',{courseId,topicId,codingAssignmentInput:input,tokenType})
      return duck.createQuery({
        query: gql`
      mutation($input:UserActivityAssignmentDumpInput!) {
          addUserActivityAssignmentDump(
            userConnectId:"${userId}",
            topicConnectId: "${topicId}",
            ${courseId ? `courseConnectId: "${courseId}",` : ''}
            input:$input
          ) {
            id
          }
        }
    `,
        variables: {
            input,
            tokenType
        },
        type: 'dumpCoding/fetch',
        key: `dumpCoding/${topicId}`,
        force
    })}

export default dumpCodingAssignment
