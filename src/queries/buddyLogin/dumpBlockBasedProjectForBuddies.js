import get from "lodash/get";
import { buddyQueries } from "../../constants/buddyLogin";
import { getAppUserAuthToken } from "../../utils/data-utils";
import requestToGraphql from "../../utils/requestToGraphql";
import { buddyQueryStatusGetter} from "../utils/buddyQueryStatus";


const dumpBlockBasedProjectForBuddies = ({ userBuddies, topicId, projectId, courseId, blockBasedProjectInput,buddyQueriesTracker }) => {
  if (userBuddies.length) {
    userBuddies.forEach(buddy => {
      const buddyId = get(buddy, 'id')
      if (!buddyQueryStatusGetter({buddyId,queryName: buddyQueries.ADD_USER_ACTIVITY_BLOCKBASEDPROJECT_DUMP, buddyQueriesTracker})) {
        requestToGraphql(`mutation addUserActivityBlockBasedProjectDump(
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
        }`, {
          userId: get(buddy, 'id'),
          topicId,
          projectId,
          courseId,
          input: blockBasedProjectInput,
          tokenType: 'withMenteeMentorToken'
        }, getAppUserAuthToken(get(buddy, 'token')))

      }
    })
  }
}

export default dumpBlockBasedProjectForBuddies