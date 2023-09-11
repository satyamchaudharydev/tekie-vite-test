import get from "lodash/get"
import { buddyQueries } from "../../constants/buddyLogin"
import { getAppUserAuthToken } from "../../utils/data-utils"
import requestToGraphql from "../../utils/requestToGraphql"
import { buddyQueryStatusGetter} from "../utils/buddyQueryStatus"


const dumpCodingAssignmentForBuddies = ({ userBuddies,topicId,courseId,codingAssignmentInput,tokenType='',buddyQueriesTracker }) => {
    if (userBuddies.length) {
        userBuddies.forEach(buddy => {
          const buddyId = get(buddy, 'id')
          if (!buddyQueryStatusGetter({buddyId,queryName: buddyQueries.ADD_USER_ACTIVITY_ASSIGNMENT_DUMP, buddyQueriesTracker})){
            requestToGraphql(`mutation($input:UserActivityAssignmentDumpInput!) {
              addUserActivityAssignmentDump(
                userConnectId:"${get(buddy,'id')}",
                topicConnectId: "${topicId}",
                ${courseId ? `courseConnectId: "${courseId}",` : ''}
                input:$input
              ) {
                id
              }
            }`, {
              input:codingAssignmentInput,
              tokenType
            }, getAppUserAuthToken(get(buddy, 'token')))
          }
        })
    }
}

export default dumpCodingAssignmentForBuddies