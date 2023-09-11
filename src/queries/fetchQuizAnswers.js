import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'

const fetchQuizAnswers = (quizReportId, tokenType, force = false, courseId = null) => duck.createQuery({
  query: gql`
    query($quizReportId:ID){
        userQuizAnswers:userQuizReport(
        id:$quizReportId
      ) {
        id
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
                learningObjective{
                    id
                    order
                }
                learningObjectives(filter:{
                    ${courseId ? `courses_some:{id:"${courseId}"}` : ''}
                }){
                    id
                    order
                }
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
                }
                fibBlocksOptions{
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
    variables: {
        quizReportId,
        tokenType
    },
    type: 'userQuizAnswers/fetch',
    key: `userQuizAnswers/${quizReportId}`,
    force
})

export default fetchQuizAnswers
