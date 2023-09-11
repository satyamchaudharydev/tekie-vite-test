import get from "lodash/get";
import { buddyQueries } from "../../constants/buddyLogin";
import { getAppUserAuthToken } from "../../utils/data-utils";
import requestToGraphql from "../../utils/requestToGraphql";
import { buddyQueryStatusGetter} from "../utils/buddyQueryStatus";


const dumpBlockBasedPracticeForBuddies = ({ userBuddies, topicId, projectId, courseId, blockBasedPracticeInput,buddyQueriesTracker }) => {
    if (userBuddies.length) {
        userBuddies.forEach(buddy => {
          const buddyId = get(buddy, 'id')
          if (!buddyQueryStatusGetter({buddyId,queryName: buddyQueries.ADD_USER_ACTIVITY_BLOCKBASEDPRACTICE_DUMP, buddyQueriesTracker})){
            requestToGraphql(`mutation addUserActivityBlockBasedPracticeDump(
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
            }`, {
              userId: get(buddy, 'id'),
              topicId,
              projectId,
              courseId,
              input: blockBasedPracticeInput,
              tokenType: 'withMenteeMentorToken'
          }, getAppUserAuthToken(get(buddy, 'token')))
          }
        })
    }
}

export default dumpBlockBasedPracticeForBuddies