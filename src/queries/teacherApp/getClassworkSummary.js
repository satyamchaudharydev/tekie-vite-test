import gql from "graphql-tag"
import duck from "../../duck"

const getClassworkSummary =async (batchId, topicId) => {
  return duck.query({
    query: gql`
        query{
            getPracticeQuestionReport(
              batchId:"${batchId}",
              topicId: "${topicId}",
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
                pqIndividualQuestionReport{
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
    type: 'getPracticeQuestionReport/fetch',
    key: 'getPracticeQuestionReport'
  })
}

export default getClassworkSummary