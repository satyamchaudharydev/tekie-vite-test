import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'

const fetchQuizQuestions = async (userId, topicId, courseId) =>
  duck.query({
    query: gql`
      query{
    userQuizs(
        filter: {
            and: [
                { user_some: { id: "${userId}" } },
                { topic_some: { id: "${topicId}" } },
                ${courseId ? `{course_some:{id:"${courseId}"}},` : ''}
                { quizStatus: incomplete },
            ]
        }
    ){
        id
        topic{
            id
            order
        }
        nextComponent {
            topic {
                id
                title
                videoTitle
                videoThumbnail {
                    id
                    uri
                }
                videoDescription
                thumbnail {
                    id
                    name
                    uri
                }
            }
        }
        user{
            id
            username
        }
        quiz{
            question{
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
                questionCodeSnippet
                answerCodeSnippet
                mcqOptions{
                    statement
                    blocksJSON
                    initialXML
                    isCorrect
                    questionBankImage {
                        id
                        image {
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
                arrangeOptions{
                    statement
                    displayOrder
                    correctPosition
                    correctPositions
                }
                mcqType
            }
            questionDisplayOrder
        }
        quizStatus
    }
}
    `,
    type: 'userQuiz/fetch',
    key: `userQuiz/${topicId}`
  })

export default fetchQuizQuestions