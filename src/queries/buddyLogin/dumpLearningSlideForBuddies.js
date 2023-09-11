import get from "lodash/get";
import { buddyQueries } from "../../constants/buddyLogin";
import { getAppUserAuthToken} from "../../utils/data-utils";
import requestToGraphql from "../../utils/requestToGraphql";
import { buddyQueryStatusGetter} from "../utils/buddyQueryStatus";


const dumpLearningSlideForBuddies=({userBuddies,learningSlideConnectId, courseConnectId,topicConnectId,learningObjectiveConnectId,learningSlideInput,buddyQueriesTracker})=>{
      if(userBuddies.length){
        userBuddies.forEach(buddy=>{
          const buddyId = get(buddy, 'id')
          if (!buddyQueryStatusGetter({buddyId,queryName: buddyQueries.ADD_USER_ACTIVITY_LEARNINGSLIDE_DUMP, buddyQueriesTracker})){
            requestToGraphql(`mutation ($input: UserActivityLearningSlideDumpInput!) {
              addUserActivityLearningSlideDump(
                input: $input,
                ${get(buddy,'id') ? `userConnectId: "${get(buddy,'id')}"` : ''}
                ${learningSlideConnectId ? `learningSlideConnectId: "${learningSlideConnectId}"` : ''}
                ${courseConnectId ? `courseConnectId: "${courseConnectId}"` : ''}
                ${topicConnectId ? `topicConnectId: "${topicConnectId}"` : ''}
                ${learningObjectiveConnectId ? `learningObjectiveConnectId: "${learningObjectiveConnectId}"` : ''}
              ) {
                id
              }
            }`,{
              input:learningSlideInput,
          },getAppUserAuthToken(get(buddy,'token')))
          }
        })
      }
  }

  export default dumpLearningSlideForBuddies