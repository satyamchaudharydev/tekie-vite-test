import get from "lodash/get"
import { PYTHON_COURSE } from "../../config"
import { getAppUserAuthToken } from "../../utils/data-utils"
import { getCourseName } from "../../utils/getCourseId"
import requestToGraphql from "../../utils/requestToGraphql"
import getCourseId from "../../utils/getCourseId"
import { buddyQueryStatusGetter, buddyQueryStatusSetter } from "../utils/buddyQueryStatus"
import { buddyQueries } from "../../constants/buddyLogin"


const fetchUserAssignmentForBuddies = ({ userBuddies, topicId, tokenType = '', buddyQueriesTracker }) => {

  if (userBuddies.length) {
    userBuddies.forEach(buddy => {
      const buddyId = get(buddy, 'id')
      if (!buddyQueryStatusGetter({buddyId,queryName: buddyQueries.USER_ASSIGNMENTS, buddyQueriesTracker})) {
        requestToGraphql(`{
          userAssignments(filter:{
          and: [
            {user_some: {id:"${get(buddy, 'id')}"}}
            {topic_some:{id: "${topicId}"}}
            ${(getCourseName() !== PYTHON_COURSE) ? `{course_some:{id: "${getCourseId(topicId)}"}}` : ''}
          ]
          }) {
          id
          }
        }`, {
          tokenType
        }, getAppUserAuthToken(get(buddy, 'token')))
        buddyQueryStatusSetter({buddyId, queryName:buddyQueries.USER_ASSIGNMENTS, buddyQueriesTracker})
      }
    })
  }

}

export default fetchUserAssignmentForBuddies