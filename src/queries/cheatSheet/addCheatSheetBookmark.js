import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../../duck'

const addUserCheatSheet = ({ input, userConnectId, cheatsheetConnectId, courseConnectId }) =>
  duck.query({
    query: gql`
    mutation($input: UserCheatSheetInput!) {
        addUserCheatSheet(input: $input,
          userConnectId: "${userConnectId}",
          courseConnectId: "${courseConnectId}",
          cheatsheetConnectId: "${cheatsheetConnectId}") {
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
    key: 'addUserCheatSheet',
    type: 'cheatSheetConcepts/add',
    changeExtractedData: (_, originalData) => {
      const UserCheatSheetId = get(originalData, 'addUserCheatSheet.id')
      const { isBookmarked, cheatsheet } = get(originalData, 'addUserCheatSheet')
      duck.merge(() => ({
        cheatSheetConcepts: { UserCheatSheetId, isBookmarked, ...cheatsheet }
      }))
      return {}
    }
})

export default addUserCheatSheet
