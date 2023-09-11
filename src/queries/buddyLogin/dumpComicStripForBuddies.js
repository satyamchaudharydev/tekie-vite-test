
import get from "lodash/get";
import { buddyQueries } from "../../constants/buddyLogin";
import { getAppUserAuthToken} from "../../utils/data-utils";
import requestToGraphql from "../../utils/requestToGraphql";
import { buddyQueryStatusGetter} from "../utils/buddyQueryStatus";


const dumpComicStripForBuddies=({userBuddies,learningObjectiveId, courseId,comicStripInput={},buddyQueriesTracker})=>{
      if(userBuddies.length){
        userBuddies.forEach(buddy=>{
          const buddyId = get(buddy, 'id')
          if (!buddyQueryStatusGetter({buddyId,queryName: buddyQueries.ADD_USER_ACTIVITY_COMICSTRIP_DUMP, buddyQueriesTracker})){
            requestToGraphql(`mutation addUserActivityComicStripDump(
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
            }`,{
              userId:get(buddy,'id'),
              learningObjectiveId,
              input:comicStripInput,
              tokenType: 'withMenteeMentorToken'
          },getAppUserAuthToken(get(buddy,'token')))
          }
        })
      }
  }

  export default dumpComicStripForBuddies