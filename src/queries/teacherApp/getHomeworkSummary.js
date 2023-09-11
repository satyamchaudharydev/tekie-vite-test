import gql from "graphql-tag"
import duck from "../../duck"

const getHomeworkSummary = async ({ batchId, topicId, isHomework }) => {
  if (isHomework) {
    return duck.query({
      query: gql`
      query{
          getClassroomReport(
            batchId: "${batchId}"
            topicId: "${topicId}",
            isHomework: true
          ) {
            overall {
              submittedPercentage
              attemptedPercentage
              unattemptedPercentage
            }
            quiz {
              submittedPercentage
              unattemptedPercentage
              totalQuestions
              averageScore
              averageCorrect
              averageIncorrect
              averagePartiallyCorrect
              learningObjectiveReport{
                questionId
                percentageCorrect
                title
              }
              submissions{
                userId
                updatedAt
                quizScore
                unansweredQuestionCount
                inCorrectQuestionCount
              }
              submissionsCount
              questions {
                questionId
                percentageCorrect
                percentageIncorrect
                percentageUnattempted
                submissionsCount
              }
            }
            coding {
              submittedPercentage
              unattemptedPercentage
              totalQuestions
              averageScore
              averageCorrect
              averageIncorrect
              averagePartiallyCorrect
              submissions{
                userId
                updatedAt
              }
              submissionsCount
              questions {
                questionId
                percentageCorrect
              }
            }
            blockBasedPractice {
              submittedPercentage
              unattemptedPercentage
              totalQuestions
              averageScore
              averageCorrect
              averageIncorrect
              averagePartiallyCorrect
              submissions{
                userId
                updatedAt
              }
              submissionsCount
              questions {
                questionId
                percentageCorrect
              }
            }
          }
        }
      `,
      type: `getClassroomReport/fetch`,
      key: `getClassroomReport`
    })
  }
  return duck.query({
    query: gql`
    query{
      getClassroomReportForBlockBasedPractice: getClassroomReport(
        batchId: "${batchId}"
        topicId: "${topicId}",
          isHomework: false
        ) {
          overall {
            submittedPercentage
            attemptedPercentage
            unattemptedPercentage
          }
          quiz {
            submittedPercentage
            unattemptedPercentage
            totalQuestions
            averageScore
            averageCorrect
            averageIncorrect
            averagePartiallyCorrect
            learningObjectiveReport{
              questionId
              percentageCorrect
              title
            }
            submissions{
              userId
              updatedAt
            }
            submissionsCount
            questions {
              questionId
              percentageCorrect
              percentageIncorrect
              percentageUnattempted
              submissionsCount
            }
          }
          coding {
            submittedPercentage
            unattemptedPercentage
            totalQuestions
            averageScore
            averageCorrect
            averageIncorrect
            averagePartiallyCorrect
            submissions{
              userId
              updatedAt
            }
            submissionsCount
            questions {
              questionId
              percentageCorrect
            }
          }
          blockBasedPractice {
            submittedPercentage
            unattemptedPercentage
            totalQuestions
            averageScore
            averageCorrect
            averageIncorrect
            averagePartiallyCorrect
            submissions{
              userId
              updatedAt
            }
            submissionsCount
            questions {
              questionId
              percentageCorrect
            }
          }
        }
      }
    `,
    type: `getClassroomReportForBlockBasedPractice/fetch`,
    key: `getClassroomReportForBlockBasedPractice`
  })

}

export default getHomeworkSummary