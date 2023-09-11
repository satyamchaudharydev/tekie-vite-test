import gql from "graphql-tag"
import duck from "../../duck"
import getIdArrForQuery from "../../utils/getIdArrForQuery"

const updateUserBlockBasedPractice=({practiceId, input, userConnectId, blockBasedPracticeConnectId, attachmentsConnectIds, topicConnectId, courseConnectId, evaluationConnectId})=>{
    return duck.query({
        query:gql`
        mutation($input: UserBlockBasedPracticeUpdate) {
            updateUserBlockBasedPractice(
                id: "${practiceId}"
                input:$input
                ${evaluationConnectId ? `evaluationConnectId: "${evaluationConnectId}"` : ''}
                ${userConnectId ? `userConnectId: "${userConnectId}"` : ''}
                ${topicConnectId ? `topicConnectId: "${topicConnectId}"` : ''}
                ${blockBasedPracticeConnectId ? `blockBasedPracticeConnectId: "${blockBasedPracticeConnectId}"` : ''}
                ${courseConnectId ? `courseConnectId: "${courseConnectId}"` : ''}
                ${attachmentsConnectIds.length > 0 ? `attachmentsConnectIds: [${getIdArrForQuery(attachmentsConnectIds)}]` : ''}
            ) {
              id
              answerLink
              savedBlocks
              status
              startTime
              endTime
              evaluationStatus
              evaluation {
                id
                star
                comment
                tags {
                  id
                  name
                  minStar
                  maxStar
                  category
                }
              }
              attachments {
                id
                type
                name
                uri
              }
              updatedAt
              blockBasedPractice {
                id
                type
                isHomework
                title
                projectDescription
                projectCreationDescription
                answerFormatDescription
                answerFormat
                layout
                externalDescriptionEnabled
              }
              user {
                id
                name
                studentProfile {
                  rollNo
                }
              }
            }
        }
        `,
        variables : {
            input
          },
          type: 'userBlockBasedPractice/update',
          key: 'userBlockBasedPractice',
    })
}

export default updateUserBlockBasedPractice