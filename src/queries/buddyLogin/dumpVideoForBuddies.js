import { get } from "lodash"
import { buddyQueries } from "../../constants/buddyLogin"
import { getAppUserAuthToken } from "../../utils/data-utils"
import requestToGraphql from "../../utils/requestToGraphql"
import { buddyQueryStatusGetter} from "../utils/buddyQueryStatus"


const dumpVideoForBuddies = ({ userBuddies, topicId, courseId, videoId, videoAction = { videoAction: 'skip' }, tokenType = '',buddyQueriesTracker }) => {

  if (userBuddies.length) {
    userBuddies.forEach(buddy => {
      const buddyId = get(buddy, 'id')
      if (!buddyQueryStatusGetter({buddyId,queryName: buddyQueries.ADD_USER_ACTIVITY_VIDEO_DUMP, buddyQueriesTracker})) {
        requestToGraphql(`
        mutation addUserActivityVideoDump(
            $userId: ID
            $topicId: ID
            $input: UserActivityVideoDumpInput!
          ) {
            addUserActivityVideoDump(
              userConnectId: $userId
              topicConnectId: $topicId
              ${courseId ? `courseConnectId: "${courseId}"` : ''}
              ${videoId ? `videoConnectId: "${videoId}"` : ''}
              input: $input
            ) {
              id
            }
          }
    `, {
          userId: get(buddy, 'id'),
          topicId,
          input: videoAction,
        }, getAppUserAuthToken(get(buddy, 'token')))
      }

    })

  }
}

export default dumpVideoForBuddies