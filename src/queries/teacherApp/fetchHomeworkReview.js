import gql from "graphql-tag";
import duck from "../../duck";

const fetchHomeworkReview = async (batch,course,topic) => {
  return duck.query({
    query: gql`
      {
        homeworkReview: getClassroomReport(
          batchId: "${batch}"
          topicId: "${topic}"
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
            questions{
              questionId
             percentageCorrect
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
            questions{
              questionId
             percentageCorrect
           }
          }
          blockBasedPractice  {
            submittedPercentage
            unattemptedPercentage
            totalQuestions
            averageScore
            averageCorrect
            averageIncorrect
            averagePartiallyCorrect
            questions{
              questionId
             percentageCorrect
           }
          }
        }
      }
    `,
    type: "homeworkReview/fetch",
    key: "homeworkReview",
  });
};
export default fetchHomeworkReview;
