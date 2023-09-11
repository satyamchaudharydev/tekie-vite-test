import get from "lodash/get"
import { buddyQueries } from "../../constants/buddyLogin"
import { getAppUserAuthToken} from "../../utils/data-utils"
import requestToGraphql from "../../utils/requestToGraphql"
import { buddyQueryStatusGetter} from "../utils/buddyQueryStatus"


const dumpPracticeQuestionForBuddies=({userBuddies,topicId,courseId,learningObjectiveId,pqDumpInput,tokenType="",buddyQueriesTracker})=>{

    if(userBuddies.length){
      userBuddies.forEach(buddy=>{
        const buddyId = get(buddy, 'id')
        if (!buddyQueryStatusGetter({buddyId,queryName: buddyQueries.ADD_USER_ACTIVITY_PQ_DUMP, buddyQueriesTracker})){
          requestToGraphql(`
          mutation addUserActivityPQDump($input: [PracticeQuestionsTypeInput]!){
            addUserActivityPQDump(
              userConnectId: "${get(buddy,'id')}"
              learningObjectiveConnectId: "${learningObjectiveId}"
              ${courseId ? `courseConnectId: "${courseId}"` : ''}
              ${topicId ? `topicConnectId: "${topicId}"` : ''}
              input: {
                 pqAction: next
                 practiceQuestionsDump: $input
              }
            ) {
              id
            }
          }`,{
            input:pqDumpInput,
            tokenType
          },getAppUserAuthToken(get(buddy,'token')))

        }
      })
    }
  }

  export default dumpPracticeQuestionForBuddies