import gql from "graphql-tag";
import duck from "../../duck";

const fetchLearningSlide = async (queryIds) => {
  return duck.query({
    query: gql`
    {
      learningSlides(filter:{id_in:[${queryIds}]}, orderBy: order_ASC) {
          id
          order
          type
          name
          type
          layoutType
          slideContents{
            id
            gridPlacement
            type
            codeInput
            codeOutput
            url
            statement
            codeEditorConfig{
              editorMode
              layout
            executionAccess
            }
            media {
              uri
              id
            }
          }
          practiceQuestions {
            id
            statement
            questionType
            questionLayoutType
            blockLayoutType
            explanation
            hints {
              hint
              hintPretext
            }
            questionCodeSnippet
            answerCodeSnippet
            mcqOptions {
              statement
              isCorrect
              initialXML
              blocksJSON
              questionBankImage {
                image {
                  uri
                }
              }
            }
            fibInputOptions {
              correctPosition
              answers
            }
            fibBlocksOptions {
              statement
              displayOrder
              correctPositions
            }
            arrangeOptions {
              statement
              displayOrder
              correctPosition
              correctPositions
            }
          }
        }
      }
    `,
    type: "learningSlide/fetch",
    key: "learningSlide",
  });
};

export default fetchLearningSlide;
