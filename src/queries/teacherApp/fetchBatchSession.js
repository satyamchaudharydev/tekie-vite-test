import gql from 'graphql-tag'
import duck from '../../duck'
import { getSlotNames } from '../../utils/slots/slot-names'

const batchSession = (batchSessionId) => {
  // return duck.query({
  //   query: gql`
  // { 
  //   batchSessionData:batchSession(id:"${batchSessionId}"){
  //     id
  //     course {
  //       id
  //       title
  //     }
  //     subSessions {
  //       id
  //       createdAt
  //       duration
  //     }
  //     topic {
  //       id
  //       order
  //       title
  //       thumbnailSmall {
  //         uri
  //       }
  //       referenceContent
  //     }
  //     batch{
  //       id
  //       type
  //       code
  //       classroomTitle
  //       school {
  //         id
  //         code
  //       }
  //       classes {
  //         id
  //       }
  //     }
  //     loggedInUserStatus{
  //       user{
  //         id
  //         name
  //       }
  //       isLoggedIn
  //       systemId
  //     }
  //     sessionStartDate
  //     sessionEndDate
  //     sessionRecordingLink
  //     bookingDate
  //     isFeedbackSubmitted
  //     attentionCount
  //     attentionAmount
  //     interactionCount
  //     interactionAmount
  //     studentBehaviour
  //     lengthOfContent
  //     learningObjectiveComponent
  //     contentImprovementSuggestion
  //     functionalitySuggestion
  //     generalSuggestion
  //     isFeedbackSubmitted
  //     isRetakeSession
  //     sessionCommentByMentor
  //     ${getSlotNames()}
  //     sessionStatus
  //     attendance{
  //       student{
  //         id
  //         user{
  //           id
  //           name
  //         }
  //         rollNo
  //       }
  //       isPresent
  //       status
  //     }
  //     schoolSessionsOtp {
  //       id
  //       otp
  //     }
  //     sessionComponentTracker{
  //       id
  //       video{
  //         componentId
  //         visited
  //         submitted
  //         user{
  //           id
  //           studentProfile{
  //             rollNo
  //             user{
  //               name
  //             }
  //           }
  //         }
  //     }
  //     learningObjective{
  //         componentId
  //         visited
  //         submitted
  //         user{
  //           id
  //           studentProfile{
  //             rollNo
  //             user{
  //               name
  //             }
  //           }
  //         }
  //     }
  //     blockBasedPractice: practice{
  //         componentId
  //         visited
  //         submitted
  //         user{
  //           id
  //           studentProfile{
  //             rollNo
  //             user{
  //               name
  //             }
  //           }
  //         }
  //     }
  //     assignment: assignments{
  //         componentId
  //         visited
  //         submitted
  //         user{
  //           id
  //           studentProfile{
  //             rollNo
  //             user{
  //               name
  //             }
  //           }
  //         }
  //     }
  //     componentStatus{
  //         componentName
  //         componentStatus
  //     }
  //     }
  //   }
  // }
  // `,
  //   type: 'batchSessionData/fetch',
  //   key: 'batchSessionData',
  //   changeExtractedData: (extractedData, originalData) => {
  //     if (originalData.batchSessionData) {
  //       extractedData.batchSessionData = originalData.batchSessionData
  //     }
  //     if (originalData.batchSessionData) {
  //       return extractedData
  //     }
  //     return {
  //       ...extractedData,
  //       batchSessionData: null
  //     }
  //   }
  // })
}

export default batchSession
