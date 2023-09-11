import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'
import buddyQueriesCaller from './utils/buddyQueriesCaller'

const dumpPracticeQuestion = (
    userId,
    learningObjectiveId,
    input,
    force = false,
    courseId
) =>
   {
    buddyQueriesCaller('addUserActivityPQDump',{courseId,learningObjectiveId,pqDumpInput:input,tokenType:'withMenteeMentorToken'})
    return duck.createQuery({
        query: gql`
      mutation addUserActivityPQDump($input: [PracticeQuestionsTypeInput]!){
        addUserActivityPQDump(
          userConnectId: "${userId}"
          learningObjectiveConnectId: "${learningObjectiveId}"
          ${courseId ? `courseConnectId: "${courseId}"` : ''}
          input: {
             pqAction: next
             practiceQuestionsDump: $input
          }
        ) {
          id
        }
      }
    `,
        variables: {
            input,
            tokenType: 'withMenteeMentorToken'
        },
        type: 'dumppq/fetch',
        key: `dumppq/${learningObjectiveId}`,
        force
    })}

export default dumpPracticeQuestion
