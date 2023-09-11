import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../../duck'

const fetchFavouriteCheats = () => duck.query ({
    query : gql`
      {
        getCheatSheet(input: { isFavourite: true }) {
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
    type: 'favouriteCheats/fetch',
    key: 'favouriteCheats',
    changeExtractedData: (extractedData, originalData) => {
      let cheatSheet = []
      get(originalData, 'getCheatSheet.cheatSheetConcepts', []).forEach(({ isSelected, isBookmarked, userCheatSheetId, cheatsheet }) => {
        cheatSheet.push({ isSelected, isBookmarked, userCheatSheetId, ...cheatsheet })
      })
      return {
        ...extractedData,
        favouriteCheats: cheatSheet
      }
    }
})


export default fetchFavouriteCheats
