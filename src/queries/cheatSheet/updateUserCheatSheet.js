import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../../duck'

const updateUserCheatSheet = ({ input, cheatsheetConnectId, id, userConnectId, courseConnectId }) =>
  duck.query({
    query: gql`
    mutation($input: UserCheatSheetUpdate) {
      updateUserCheatSheet(input: $input,
        id: "${id}",
        cheatsheetConnectId:"${cheatsheetConnectId}",
        courseConnectId: "${courseConnectId}",
        userConnectId:"${userConnectId}") {
        id
        isBookmarked
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
    `,
    variables: {
      input
    },
    key: 'updateUserCheatSheet',
    type: 'cheatSheetConcepts/update',
    changeExtractedData: (_, originalData) => {
      const userCheatSheetId = get(originalData, 'updateUserCheatSheet.id')
      const { isBookmarked, cheatsheet } = get(originalData, 'updateUserCheatSheet')
      duck.merge(() => ({
        cheatSheetConcepts: { userCheatSheetId, isBookmarked, ...cheatsheet }
      }))
      return {}
    }
})

export default updateUserCheatSheet
