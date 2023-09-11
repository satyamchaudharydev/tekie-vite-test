import gql from 'graphql-tag'
import duck from '../../duck'
import get from 'lodash/get'


const fetchBatchSessionDetails = (sessionId, fromQuestionLevel = false) => {
  return duck.query({
    query: gql`{
  batchSessionData: batchSession(id:"${sessionId}") {
    id
    sessionStatus
    isRetakeSession
    sessionStartDate
    sessionEndDate
    courseData: course{
      id
      title
    }
    sessionComponentTracker{
      id
    }
    topicData: topic {
      id
      title
      order
      classType
      courses {
        id
      }
      thumbnail {
        id
        uri
      }
      thumbnailSmall {
        id
        uri
      }
      topicComponentRule {
        order
        childComponentName
        blockBasedProject {
          id
          title
          type
          isSubmitAnswer
        }
        learningObjective {
          id
          title
        ${fromQuestionLevel ? `questionBank(filter:{and:[
          {
            status:published
          }
          {
            assessmentType:practiceQuestion
          }
        ]}){
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
        }`: ''}
          questionBankMeta(filter:{and:[
            {
              assessmentType: practiceQuestion
            }
            {
              status:published
            }
          ]}) {
            count
          }
          quizMeta:questionBankMeta(filter:{and:[
            {
              assessmentType: quiz
            }
            {
              status:published
            }
          ]}) {
            count
          }
        }
        componentName
      }
    }
    batchData: batch {
      id
      code
      classroomTitle
    }
    attendance {
      status
      isPresent
      student {
        id
        rollNo
        profileAvatarCode
        studentData: user{
          id
          name
          profilePic{
            id
            uri
          }
        }
      }
    }
  }
}
`,
    type: 'batchSessionData/fetch',
    key: 'batchSessionsForReports',
    changeExtractedData: (extractedData, originalData) => {
      extractedData.batchSessionData = get(originalData, 'batchSessionData')
      return {
        ...extractedData
      }
    }
  })
}

export default fetchBatchSessionDetails