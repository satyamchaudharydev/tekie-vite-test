import get from "lodash/get"
import { buddyQueries } from "../../constants/buddyLogin"
import { getAppUserAuthToken } from "../../utils/data-utils"
import requestToGraphql from "../../utils/requestToGraphql"
import { buddyQueryStatusGetter, buddyQueryStatusSetter } from "../utils/buddyQueryStatus"


const fetchUserVideosForBuddies = ({ userBuddies, topicId, courseId, videoId, tokenType = '', buddyQueriesTracker }) => {
  if (userBuddies.length) {
    userBuddies.forEach(buddy => {
      const buddyId = get(buddy, 'id')
      if (!buddyQueryStatusGetter({buddyId,queryName:buddyQueries.USER_VIDEOS,buddyQueriesTracker,componentId:videoId})) {
        requestToGraphql(`{
          userVideos(
            filter: {
              and: [
                { user_some: { id: "${buddyId}" } }
                { topic_some: { id: "${topicId}" } }
                ${courseId ? `{course_some:{id:"${courseId}"}}` : ''}
                ${videoId ? `{video_some:{id:"${videoId}"}}` : ''}
              ]
            }
          ) {
            id
          }
        }`, {
          tokenType
        }, getAppUserAuthToken(get(buddy, 'token')))
        buddyQueryStatusSetter({buddyId,queryName:buddyQueries.USER_VIDEOS,buddyQueriesTracker,componentId:videoId})
      }
    })
  }
}

export default fetchUserVideosForBuddies