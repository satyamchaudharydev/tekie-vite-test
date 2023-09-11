import gql from 'graphql-tag'
import duck from '../../duck'

const fetchSaveCodeSingle = (codeId) =>
  duck.createQuery({
    query: gql`
    {
        userSavedCode(
            id: "${codeId}"
        ){
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
            hasRequestedByMentee
            isApprovedForDisplay
            userApprovedCode {
                id
                status
            }
        }
        }
    `,
    key: 'fetchSavedCode',
    type: 'savedCode/fetch',
})

export default fetchSaveCodeSingle
