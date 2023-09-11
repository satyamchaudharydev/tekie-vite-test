import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'
import buddyQueriesCaller from './utils/buddyQueriesCaller'

const dumpBlockBasedPractice = (userId, topicId, projectId, courseId, input, force = false, authorsIds) =>
   { 
    buddyQueriesCaller('addUserActivityBlockBasedPracticeDump',{topicId, projectId, courseId, authorsIds, blockBasedPracticeInput:input})
    return duck.createQuery({
        query: gql`,
      mutation addUserActivityBlockBasedPracticeDump(
        $userId: ID
        $topicId: ID
        $projectId: ID
        $courseId: ID
        $input: UserActivityBlockBasedPracticeDumpInput!
      ) {
        addUserActivityBlockBasedPracticeDump(
          userConnectId: $userId
          topicConnectId: $topicId
          courseConnectId: $courseId
          blockBasedPracticeConnectId: $projectId
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
        type: 'dumpBlockBasedPractice/fetch',
        force
    })}

export default dumpBlockBasedPractice
