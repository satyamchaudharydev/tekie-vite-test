import get from "lodash/get";
import { buddyQueries } from "../../constants/buddyLogin";
import { getAppUserAuthToken } from "../../utils/data-utils";
import { getCourseConnectString } from "../../utils/getCourseId";
import requestToGraphql from "../../utils/requestToGraphql";
import { buddyQueryStatusGetter} from "../utils/buddyQueryStatus";


const dumpChatForBuddies = ({ userBuddies, topicId, learningObjectiveId, courseId, chatAction = { chatAction: "next" }, buddyQueriesTracker }) => {
  if (userBuddies.length) {
    userBuddies.forEach(buddy => {
      const buddyId = get(buddy, 'id')
      if (!buddyQueryStatusGetter({buddyId,queryName:buddyQueries.ADD_USER_ACTIVITY_CHAT_DUMP, buddyQueriesTracker})) {
        requestToGraphql(`mutation addUserActivityChatDump(
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
            }`, {
          userId: get(buddy, 'id'),
          learningObjectiveId,
          input: chatAction,
          tokenType: 'withMenteeMentorToken'
        }, getAppUserAuthToken(get(buddy, 'token')))
      }
    })
  }
}

export default dumpChatForBuddies