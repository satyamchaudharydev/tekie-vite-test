import { get } from "lodash"
import { PYTHON_COURSE } from "../../config"
import { getAppUserAuthToken} from "../../utils/data-utils"
import { getCourseName } from "../../utils/getCourseId"
import requestToGraphql from "../../utils/requestToGraphql"
import getCourseId from "../../utils/getCourseId"
import { buddyQueries } from "../../constants/buddyLogin"
import { buddyQueryStatusGetter, buddyQueryStatusSetter } from "../utils/buddyQueryStatus"

const fetchChatPracticeForBuddies=({userBuddies,learningObjectiveId,tokenType='',courseId,topicId,buddyQueriesTracker})=>{
    if(userBuddies.length){
      let additionalFilter = ''
      if (courseId) {
        additionalFilter += `{ course_some: { id: "${courseId}" } }`
      }
      userBuddies.forEach(buddy=>{
        const buddyId = get(buddy, 'id')
        if (!buddyQueryStatusGetter({buddyId,queryName:buddyQueries.USER_LEARNING_OBJECTIVES,buddyQueriesTracker,componentId:learningObjectiveId})){
          requestToGraphql(`{
            userLearningObjectives(
              filter: {
                and: [
                  { user_some: { id: "${get(buddy,'id')}" } }
                  ${(getCourseName() !== PYTHON_COURSE) ? `{course_some:{id: "${getCourseId(topicId)}"}}` : ''}
                  ${topicId ? `{ topic_some: { id: "${topicId}" } }` : ''}
                  { learningObjective_some: { id: "${learningObjectiveId}" } }
                  ${additionalFilter}
                ]
              }
          ){
              id
        }
          }`,{
            tokenType
          },getAppUserAuthToken(get(buddy,'token')))
        buddyQueryStatusSetter({buddyId,queryName:buddyQueries.USER_LEARNING_OBJECTIVES,buddyQueriesTracker,componentId:learningObjectiveId})
        }
      })
      
    }
    }

    export default fetchChatPracticeForBuddies