import gql from 'graphql-tag'
import duck from '../../../duck'


const fetchBlocklyReports = (topicId) => {
    return duck.query({
        query: gql`{
        blocklyReports:topic(id: "${topicId}") {
          topicComponentRule {
            componentName
            blockBasedProject {
              id
              title
              type
              isHomework
              order
              projectDescription
              externalPlatformLink
              externalPlatformLogo {
                id
                name
                uri
              }
              layout
              answerFormat
              answerFormatDescription
              projectCreationDescription
              externalDescriptionEnabled
            }
          }
        }
      }`,
        type: 'blocklyReports/fetch',
        key: 'blocklyReports',
    }
    )
}

export default fetchBlocklyReports