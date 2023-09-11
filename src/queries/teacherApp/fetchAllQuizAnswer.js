import gql from "graphql-tag";
import { get } from "lodash";
import duck from "../../duck";
import getIdArrForQuery from "../../utils/getIdArrForQuery";


const fetchAllStudentQuizAnswer = async (topicId , studentsIdArray) => {
    let emptyArray =[]
    function arrayMaker(){
        for (let index = 0; index < studentsIdArray.length; index++) {
            const element = studentsIdArray[index];
           const item = get(element,"homeworkStudentsName.user.id","")
            emptyArray.push(item)
        }
        return emptyArray
    }
    
  return duck.query({
    query: gql`
      {
        allStudentsQuizAnswers: userQuizReports(
          filter: {
            and: [
              {
                user_some: {
                  id_in: [
                    ${getIdArrForQuery(arrayMaker())}
                  ]
                }
              }
              { topic_some: { id: "${topicId}" } }
            ]
          }
        ) {
          id
              user{
                  id
              }
          
          quizAnswers {
            isAttempted
            isCorrect
            question {
              id
              order
              questionLayoutType
              blockLayoutType
              statement
              hint
              questionType
              difficulty
              assessmentType
              learningObjective {
                id
                order
              }
              learningObjectives(filter: {}) {
                id
                order
              }
              mcqOptions {
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
              fibInputOptions {
                answers
              }
              fibBlocksOptions {
                statement
                displayOrder
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
            }
            mcqOptions {
              isCorrect
              statement
              blocksJSON
              initialXML
              questionBankImage {
                id
                image {
                  uri
                }
              }
            }
            userMcqAnswer {
              isSelected
              statement
              blocksJSON
              initialXML
              questionBankImage {
                id
                image {
                  uri
                }
              }
            }
            fibInputOptions {
              answers
              correctPosition
            }
            userFibInputAnswer {
              answer
              position
            }
            fibBlocksOptions {
              correctPositions
              statement
            }
            userFibBlockAnswer {
              statement
              position
            }
            arrangeOptions {
              displayOrder
              correctPosition
              correctPositions
              statement
            }
            userArrangeAnswer {
              statement
              position
            }
          }
        }
      }
    `,
    type: "allStudentsQuizAnswers/fetch",
    key: "allStudentsQuizAnswers",
  });
};

export default fetchAllStudentQuizAnswer;
