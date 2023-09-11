import gql from 'graphql-tag'
import duck from '../duck'

const updateSignupBonusNotification = (id, isVerifiedUser) =>
  duck.createQuery({
    query: gql`
      mutation {
        updateUser(
          id: "${id}"
          input: {
            ${isVerifiedUser ? 'verificationStatus: verified' : ''}
          }
        ) {
          id
          verificationStatus
        }
      }
    `,
    type: 'user/fetch',
    key: 'userSignUpBonus'
  })

export default updateSignupBonusNotification
