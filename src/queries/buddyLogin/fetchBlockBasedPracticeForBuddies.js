import get from "lodash/get"
import { buddyQueries } from "../../constants/buddyLogin"
import { getAppUserAuthToken } from "../../utils/data-utils"
import requestToGraphql from "../../utils/requestToGraphql"
import { buddyQueryStatusGetter, buddyQueryStatusSetter } from "../utils/buddyQueryStatus"


const fetchBlockBasedPracticeForBuddies = ({ userBuddies, topicId, blockBasedPracticeId, courseId, tokenType = '', buddyQueriesTracker }) => {

  if (userBuddies.length) {
    userBuddies.forEach(buddy => {
      const buddyId = get(buddy, 'id')
      if (!buddyQueryStatusGetter({buddyId,queryName: buddyQueries.USER_BLOCKBASED_PRACTICES, buddyQueriesTracker,componentId:blockBasedPracticeId})) {
        requestToGraphql(`   query {
          userBlockBasedPractices(
            filter: {
              and: [
                { user_some: { id: "${get(buddy, 'id')}" } }
                { topic_some: { id: "${topicId}" } }
                ${blockBasedPracticeId ? `{ blockBasedPractice_some: { id: "${blockBasedPracticeId}" } }` : ''}
                { course_some: { id: "${courseId}" } }
              ]
            }
        ){
            id
        }
      }`, {
          tokenType
        }, getAppUserAuthToken(get(buddy, 'token')))
        buddyQueryStatusSetter({buddyId,queryName: buddyQueries.USER_BLOCKBASED_PRACTICES, buddyQueriesTracker,componentId:blockBasedPracticeId})
      }
    })
  }
}

export default fetchBlockBasedPracticeForBuddies