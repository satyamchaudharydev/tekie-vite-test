import { PYTHON_COURSE } from "../../config"
import getCourseId, { getCourseName } from "../../utils/getCourseId"

const FETCH_CODING_ASSIGNMENT = (
  userId,
  topicId,
  courseId,
) => {
  let courseFilter = ''
  if (courseId) {
    courseFilter = `{ course_some: { id: "${courseId}" } }`
  } else courseFilter = `{ course_some: { id: "${getCourseId(topicId)}" } }`
  return `
    userAssignments(filter:{
      and: [
        {user_some: {id:"${userId}"}}
        {topic_some:{id: "${topicId}"}}
        ${courseFilter}
      ]
    }) @duck(
      type: "userAssignment/fetch"
      key: "${topicId}"
    ) {
      id
      assignment {
        assignmentQuestion {
          id
          order
          status
          statement
          isHomework
          questionCodeSnippet
          initialCode
          editorMode
          answerCodeSnippet
          topic {
            id
            learningObjectives(filter: {
              status: published
            }) {
              id
            }
          }
          hints {
            hintPretext
            hint
          }
        }
        assignmentQuestionDisplayOrder
        userAnswerCodeSnippet
        isAttempted
      }
      assignmentStatus
  }`
}

export default FETCH_CODING_ASSIGNMENT