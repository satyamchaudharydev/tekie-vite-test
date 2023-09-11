import gql from "graphql-tag";
import duck from "../../duck";

const fetchPqReportDetail = async (batch, topic , learningObjectiveId) => {


  return duck.query({
    query: gql`
    {
      fetchPqReportDetail: getPracticeQuestionReport(
        batchId:"${batch}",
        topicId: "${topic}",
        learningObjectiveId: "${learningObjectiveId}",
        learningObjectiveComponent: "practiceQuestion"
      ){
        practiceQuestionOverallReport{
          loId
          loTitle
          submittedPercentage,
          attemptedPercentage,
          unattemptedPercentage,
          firstTryPercentage,
          secondTryPercentage,
          thirdTryPercentage,
          avgTriesPerQuestion,
          avgTimePerQuestion,
          pqIndividualQuestionReport {
            submissions {
              userId
              averageTries
              userName
              rollNo
              firstTry
              secondTry
              thirdTry
            }
            questionId,
            firstTryPercentage,
            secondTryPercentage,
            thirdTryPercentage,
            avgTries
          }
        }
      }
    }
    `,
    type: "fetchPqReportDetail/fetch",
    key: "fetchPqReportDetail",
  });
};
export default fetchPqReportDetail;
