import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../../duck'

const fetchCheatSheets = ({ topicId, isFavourite, key }) => duck.query({
  query: gql`
      {
        getCheatSheet(input: { ${topicId ? `topicId: "${topicId}"` : ''} ${isFavourite ? 'isFavourite: true' : ''} }) {
          cheatSheetTopics {
            isSelected
            topic {
              id
              title
              order
              thumbnail {
                id
                uri
              }
            }
          }
          cheatSheetConcepts {
            isSelected
            isBookmarked
            userCheatSheetId
            cheatsheet {
              id
              title
              order
              status
              topic {
                id
                title
              }
              content {
                order
                type
                statement
                syntax
                image {
                  id
                  uri
                }
                emoji {
                  id
                  code
                  image {
                    id
                    uri
                  }
                }
                terminalInput
                terminalOutput
              }
            }
          }
        }
      }
    `,
  type: 'cheatSheetConcepts/fetch',
  key: key || 'cheatSheetConcepts',
  changeExtractedData: (extractedData, originalData) => {
    let cheatSheet = []
    get(originalData, 'getCheatSheet.cheatSheetConcepts', []).forEach(({ isSelected, isBookmarked, userCheatSheetId, cheatsheet }) => {
      cheatSheet.push({ isSelected, isBookmarked, userCheatSheetId, ...cheatsheet })
    })
    let topics = []
    get(originalData, 'getCheatSheet.cheatSheetTopics', []).forEach(({ isSelected, topic }) => {
      topics.push({ isSelected, ...topic })
    })
    return {
      cheatSheetConcepts: cheatSheet,
      cheatSheetTopics: topics,
    }
  }
})


export default fetchCheatSheets
