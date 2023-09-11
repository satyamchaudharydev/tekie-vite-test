import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'

const fetchUserInvites = (id, force = false) => duck.createQuery ({
    query : gql`
        query getInvitedUser($id:ID){
          userInvites(filter:{
            invitedBy_some:{id: $id}
          }){
            acceptedBy{
              id
              name
              studentProfile{
                id
                parents{
                  id
                  user{
                    id
                    phone{
                      number
                      countryCode
                    }
                  }
                }
              }
            }
            registrationVerified
            registrationVerifiedDate
            trialTaken
            trialTakenDate
            coursePurchased
            coursePurchasedDate
            createdAt
          }
          
          userCredits(filter:{
            user_some:{id:$id}
          }){
            id
            credits
          }

          userCreditLogs(filter: {
            user_some:{
              id: $id
            }
          }) {
            id
            reason
            amount
            type
            user {
              id
              name
            }
            createdAt
            updatedAt
          }
          
        }
    `,
    variables: {
        id
    },
    changeExtractedData: (extractedData, originalData) => {
        return {
            ...extractedData,
            userInvite: extractedData && extractedData.userInvite && extractedData.userInvite.length > 0 ?
                extractedData.userInvite.map(user => ({
                ...user,
                id: user && user.acceptedBy && user.acceptedBy.id
            })) :
            []
        }
    },
    type: 'userInvite/fetch',
    key: 'userInvite',
    force
})


export default fetchUserInvites
