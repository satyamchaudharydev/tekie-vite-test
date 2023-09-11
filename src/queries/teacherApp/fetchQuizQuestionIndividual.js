import gql from "graphql-tag";
import duck from "../../duck";

const fetchQuizQuestionsIndividualPq = async (loId, assessmentType = 'practiceQuestion') => {
  return duck.query({
    query: gql`
    {
      fetchQuizQuestionsIndividualPq: learningObjectives(filter: {
        id: "${loId}"
      }){
  id
            questionBank(filter:{
              and:[
                {
                status: published 
                },
                {
                  assessmentType: ${assessmentType}
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
    type: "fetchQuizQuestionsIndividualPq/fetch",
    key: "fetchQuizQuestionsIndividualPq",
  });
};
export default fetchQuizQuestionsIndividualPq;