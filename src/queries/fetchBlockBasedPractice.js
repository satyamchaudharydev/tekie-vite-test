import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'
import buddyQueriesCaller from './utils/buddyQueriesCaller'

const fetchBlockBasedPractice = (userId, blockBasedPracticeId, courseId, tokenType, force = false, topicId) => {
  buddyQueriesCaller('userBlockBasedPractices',{topicId,courseId,blockBasedPracticeId,tokenType})
    return duck.createQuery({
      query: gql`
        query {
          userBlockBasedPractices(
            filter: {
              and: [
                { user_some: { id: "${userId}" } }
                { topic_some: { id: "${topicId}" } }
                 ${blockBasedPracticeId ? `{ blockBasedPractice_some: { id_in: ${JSON.stringify(blockBasedPracticeId)} } }` : ''}
                { course_some: { id: "${courseId}" } }
              ]
            }
        ) {
            id
            answerLink
            attachments {
              id
              uri
              name
              type
              createdAt
            }
            updatedAt
            savedBlocks
            status
            startTime
            endTime
            blockBasedPractice {
              id
              title
              order
              difficulty
              status
              projectCreationDescription
              externalPlatformLink
              initialBlocks
              layout
              platFormLinkLabel
              type
              isSubmitAnswer
              isHomework
              externalPlatformLogo {
                id
                uri
              }
              projectThumbnail {
                id
                uri
              }
              projectDescription
              answerDescription
              embedViewHeight
              externalDescriptionEnabled
              answerFormat
              answerFormatDescription
              answerFormatViewHeight
              gsuiteFileType
              gsuiteTempleteURL
            }
        }
      }
      `,
      variables: {
          tokenType
      },
      type: 'userBlockBasedPractices/fetch',
      key: 'userBlockBasedPractices',
      force
    })
}

export default fetchBlockBasedPractice
