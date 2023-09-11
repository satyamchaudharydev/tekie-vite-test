import gql from 'graphql-tag'
import duck from '../../duck'

const deleteSaveCode = (savedCodeId) =>
  duck.createQuery({
    query: gql`
    mutation deleteUserSavedCode{
        savedCode: deleteUserSavedCode(
            id: "${savedCodeId}"
        ) {
            id
        }
    }
    `,
    key: 'deleteSavedCode',
    type: 'savedCode/delete',
})

export default deleteSaveCode
