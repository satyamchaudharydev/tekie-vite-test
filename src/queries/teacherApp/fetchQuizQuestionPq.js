import gql from "graphql-tag";
import duck from "../../duck";

const fetchQuizQuestionsPq = async (loId) => {
  return duck.query({
    query: gql`
    {
      fetchQuizQuestionsPq: learningObjectives(filter: {
        id: "${loId}"
      }){
  id
            questionBank(filter:{
              and:[
                {
                status: published 
                },
                {
                  assessmentType: practiceQuestion
                }
              ]
            }){
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
        }
      
    `,
    type: "fetchQuizQuestionsPq/fetch",
    key: "fetchQuizQuestionsPq",
  });
};
export default fetchQuizQuestionsPq;