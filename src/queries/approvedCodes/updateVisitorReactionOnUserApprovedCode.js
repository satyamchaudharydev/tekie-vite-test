import gql from 'graphql-tag'
import duck from '../../duck'

const updateVisitorReactionOnUserApprovedCode = (reactedBy, userApprovedCodeID, reactionInput) =>
  duck.createQuery({
    query: gql`
    mutation {
        updateVisitorReactionOnUserApprovedCode(
            reactedByID:"${reactedBy}",
            userApprovedCodeID:"${userApprovedCodeID}"
            ${reactionInput}
        ) {
            result
            error
        }
    }
    `,
    key: 'updateVisitorReactionOnUserApprovedCode',
    type: 'visitorReactionOnUserApprovedCode/update',
})

export default updateVisitorReactionOnUserApprovedCode
