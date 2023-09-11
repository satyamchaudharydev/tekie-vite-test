import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'
import buddyQueriesCaller from './utils/buddyQueriesCaller'

const dumpBlockBasedProject = (userId, topicId, projectId, courseId, input, force = false) =>
   {
    buddyQueriesCaller('addUserActivityBlockBasedProjectDump',{
      topicId, projectId, courseId, blockBasedProjectInput:input
    })
    return  duck.createQuery({
        query: gql`,
      mutation addUserActivityBlockBasedProjectDump(
        $userId: ID
        $topicId: ID
        $projectId: ID
        $courseId: ID
        $input: UserActivityBlockBasedProjectDumpInput!
      ) {
        addUserActivityBlockBasedProjectDump(
          userConnectId: $userId
          topicConnectId: $topicId
          courseConnectId: $courseId
          blockBasedProjectConnectId: $projectId
          input: $input
        ) {
          id
        }
      }
    `,
        variables: {
            userId,
            topicId,
            projectId,
            courseId,
            input,
            tokenType: 'withMenteeMentorToken'
        },
        key: projectId,
        type: 'dumpBlockBasedProject/fetch',
        force
    })}

export default dumpBlockBasedProject
