import gql from 'graphql-tag'
import duckCache from '../duck/duckIfCacheExists'
import duckWithoutCache from '../duck'
import { checkIfDefaultCourse } from '../utils/getCourseId'

const getFilter = (userId, loId, courseId, topicId) => {
  if (loId) {
    return `and: [
      { user_some: { id: "${userId}" } }
      { learningObjective_some: { id: "${loId}" } }
      ${courseId && !checkIfDefaultCourse() ? `{course_some:{id:"${courseId}"}}` : ''}
    ]`
  }
  return `and: [
    { user_some: { id: "${userId}" } }
    { learningObjective_some: { topics_some: {id: "${topicId}"} } }
  ]`
}

const fetchPQReport = (userId, loId, courseId, force = false, tokenType, topicId) => {
  const duck = topicId ? duckWithoutCache : duckCache
  return duck.createQuery({
    query: gql`
      {
        ${
          topicId ? `topic(id: "${topicId}") {
            id
            title
          }` : ''
        }        
        ${
          topicId ? `user(id: "${userId}") {
            name
            schools {
              name
              logo {
                uri
              }
            }
          }` : ''
        }        
        userPracticeQuestionReports(
          filter: {
            ${getFilter(userId, loId, courseId, topicId)}
          }
          orderBy: createdAt_DESC
          ${topicId ? '' : 'first: 1'}
        ) {
          id
          createdAt
          firstTryCount
          secondTryCount
          threeOrMoreTryCount
          answerUsedCount
          helpUsedCount
          ${topicId ? `learningObjective {
              id
              title
              order
            }` : ''}
          detailedReport {
            question {
              id
              order
              questionLayoutType
              blockLayoutType
              statement
              hint
              explanation
              questionType
              difficulty
              assessmentType
              questionCodeSnippet
              answerCodeSnippet
              status
              mcqOptions {
                statement
                isCorrect
                blocksJSON
                initialXML
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
            isCorrect
            firstTry
            secondTry
            thirdOrMoreTry
            isAnswerUsed
            isHintUsed
          }
        }
      }
    `,
      variables: {
          tokenType
     },
      type: 'userPracticeQuestionReport/fetch',
      key: `userPracticeQuestionReport/${loId}`,
      force
  })
}

export default fetchPQReport
