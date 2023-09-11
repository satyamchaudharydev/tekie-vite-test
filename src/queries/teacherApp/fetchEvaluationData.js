import gql from "graphql-tag";
import duck from "../../duck";
import { filterSubmittedAssignmentData } from "../../pages/TeacherApp/pages/Classroom/ClassroomDetails/ClassroomDetails.helpers";
import getIdArrForQuery from "../../utils/getIdArrForQuery";

const fetchEvaluationData = async (userIds, topicId, courseId) => {
  return duck.query({
    query: gql`
      {
        getSubmittedAssignmentsStudents(
            userIds: [${getIdArrForQuery(userIds)}],
            topicId: "${topicId}",
            courseId: "${courseId}"
        ) {
          codingQuestions {
              assignmentQuestion {
                id
                statement
                answerCodeSnippet
                isHomework
                editorMode
              }
              evaluation {
                id
                star
                comment
                tags {
                  id
                  name
                }
              }
              isAttempted
              startTime
              endTime
              assignmentQuestionDisplayOrder
              userAnswerCodeSnippet
            }
            userAssignment {
                id
                assignmentStatus
                user {
                  id
                  name
                  studentProfile {
                    rollNo
                  }
                }
                assignment {
                  assignmentQuestion {
                    id
                    statement
                    answerCodeSnippet
                    isHomework
                    editorMode
                  }
                  evaluation {
                    id
                    star
                    comment
                    tags {
                      id
                      name
                    }
                  }
                  isAttempted
                  startTime
                  endTime
                  assignmentQuestionDisplayOrder
                  userAnswerCodeSnippet
                }
            }
            blockBasedPracitce {
                id
                user {
                  id
                  name
                  studentProfile {
                    rollNo
                  }
                }
                blockBasedPractice {
                  id
                  title
                  projectDescription
                  projectCreationDescription
                  answerFormatDescription
                  answerFormat
                  layout
                  isHomework
                  externalDescriptionEnabled
                }
                status
                startTime
                endTime
                evaluationStatus
                answerLink
                savedBlocks
                attachments {
                  id
                  uri
                  name
                  type
                  createdAt
                }
                evaluation {
                  id
                  star
                  comment
                  tags {
                    id
                    name
                  }
                }
                topic {
                  id
                }
                course {
                  id
                }
                createdAt
                updatedAt
            }
        }
      }
    `,
    type: 'evaluationData/fetch',
    key: 'evaluationData',
    changeExtractedData: (extractedData, originalData) => {
        if (originalData.getSubmittedAssignmentsStudents) {
            const evaluationData = filterSubmittedAssignmentData(originalData.getSubmittedAssignmentsStudents)
            extractedData.evaluationData = evaluationData
            return extractedData
        }
    }
});
};
export default fetchEvaluationData;
