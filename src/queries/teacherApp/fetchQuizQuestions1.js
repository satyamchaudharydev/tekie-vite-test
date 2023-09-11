import gql from "graphql-tag";
import duck from "../../duck";

const fetchQuizQuestions1 = async (batch ,course,topic) => {

  return duck.query({
    query: gql`
    {
       fetchQuizQuestions1: questionBanks(filter: {and: [{topics_some: {id: "${topic}"}},{courses_some: {id: "${course}"}}, {assessmentType: quiz},{status:published}]}) {
          id
          questionType
          difficulty
          assessmentType
                order
                questionLayoutType
                blockLayoutType
                statement
                hint
                mcqOptions{
                  isCorrect
                  statement
                  blocksJSON
                  initialXML
                  questionBankImage {
                      id
                      image {
                          id
                          uri
                      }
                  }
              }
              fibInputOptions{
                  answers
                  correctPosition

                  
              }
              fibBlocksOptions{
                  statement
                  displayOrder
                  correctPositions
              }
              explanation
              answerCodeSnippet
              questionCodeSnippet
              arrangeOptions {
                  statement
                  displayOrder
                  correctPosition
                  correctPositions
              }
          courses {
            id
          }
        }
      }
    `,
    type: "fetchQuizQuestions1/fetch",
    key: "fetchQuizQuestions1",
  });
};
export default fetchQuizQuestions1;