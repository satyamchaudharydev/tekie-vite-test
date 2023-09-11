import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../../duck'

const getInput = (cheatSheetId, topicId) => {
  if (topicId) {
    return `(input:{ topicId: "${topicId}" })`
  }
  if (cheatSheetId) {
    return `(input:{ cheatSheetId: "${cheatSheetId}" })`
  }
  return ''
}
const fetchTopics = (cheatSheetId, topicId) => {
  return duck.query ({
    query : gql`{
        getCheatSheet${getInput(cheatSheetId, topicId)} {
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
    type: 'getCheatSheet/fetch',
    key: 'getCheatSheet/default',
  changeExtractedData: (extractedData, originalData) => {
    let topics = []
    let cheatSheet = []
    get(originalData, 'getCheatSheet.cheatSheetTopics', []).forEach(({ isSelected, topic }) => {
      topics.push({ isSelected, ...topic })
    })
    get(originalData, 'getCheatSheet.cheatSheetConcepts', []).forEach(({ isSelected, isBookmarked, userCheatSheetId, cheatsheet }) => {
      cheatSheet.push({ isSelected, isBookmarked, userCheatSheetId, ...cheatsheet })
    })
    return {
      cheatSheetTopics: topics,
      cheatSheetConcepts: cheatSheet
    }
    }
})
}


export default fetchTopics
