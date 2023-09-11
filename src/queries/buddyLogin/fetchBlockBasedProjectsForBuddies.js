import get from "lodash/get"
import { buddyQueries } from "../../constants/buddyLogin"
import { getAppUserAuthToken } from "../../utils/data-utils"
import requestToGraphql from "../../utils/requestToGraphql"
import { buddyQueryStatusGetter, buddyQueryStatusSetter } from "../utils/buddyQueryStatus"


const fetchBlockBasedProjectsForBuddies = ({ userBuddies, topicId, blockBasedProjectId, courseId, tokenType='',buddyQueriesTracker}) => {

    if (userBuddies.length) {
        userBuddies.forEach(buddy => {
          const buddyId = get(buddy, 'id')
          if (!buddyQueryStatusGetter({buddyId,queryName: buddyQueries.USER_BLOCKBASED_PROJECTS, buddyQueriesTracker})){
            requestToGraphql(`
            {
                userBlockBasedProjects(
                  filter: {
                    and: [
                      { user_some: { id: "${get(buddy, 'id')}" } }
                      { topic_some: { id: "${topicId}" } }
                      { blockBasedProject_some: { id: "${blockBasedProjectId}" } }
                      { course_some: { id: "${courseId}" } }
                    ]
                  }
              ){
                  id
                }
                }`, {
                tokenType
            }, getAppUserAuthToken(get(buddy, 'token')))
            console.log('called')
            buddyQueryStatusSetter({buddyId,queryName: buddyQueries.USER_BLOCKBASED_PROJECTS, buddyQueriesTracker})
          }
        })
    }
}

export default fetchBlockBasedProjectsForBuddies
