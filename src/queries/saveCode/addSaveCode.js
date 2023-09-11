import gql from 'graphql-tag'

import { FETCH_SAVE_CODE_KEY } from './fetchSavedCode'
import duck from '../../duck'

const addSaveCode = (userId, input) =>
  duck.createQuery({
    query: gql`
    mutation addUserSavedCode($input: UserSavedCodeInput!){
        addUserSavedCode(
            userConnectId: "${userId}",
            input: $input
        ) {
            id
            user{
                id
                name
                }
            code
            fileName
            description
            createdAt
            updatedAt
            languageType
            hasRequestedByMentee
            isApprovedForDisplay
            userApprovedCode {
                id
                status
            }
        }
    }
    `,
    variables: {
        input
    },
    key: FETCH_SAVE_CODE_KEY,
    type: 'savedCode/add',
})

export default addSaveCode
