import gql from 'graphql-tag'
import duck from '../duck'

const fetchUserBadges = () =>
  duck.query({
    query: gql`
      mutation {
        userBadge {
          characters {
            name
            order
            image {
              id
              name
              uri
            }
            isUnlocked
            description
          }
          equipments {
            name
            order
            image {
              id
              name
              uri
            }
            isUnlocked
            description
          }
        }
      }
    `,
    type: 'userBadge/fetch',
    key: 'userBadge'
  })

export default fetchUserBadges
