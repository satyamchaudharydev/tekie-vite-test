import gql from 'graphql-tag'
import duck from '../duck'

const fetchUserProfileRewatch = async userId =>
  duck.query({
    query: gql`
      {
        userProfiles(
          filter: { user_some: { id: "${userId}" } }
        ) {
          id
          topicsCompleted
          totalTopicsTemp: totalTopics {
            id
            title
            order
            chapter{
              id
              order
              title
            }
          }
          proficientTopics {
            id
            title
          }
          familiarTopics {
            id
            title
          }
          masteredTopics {
            id
            title
          }
          proficientTopicsMeta {
            count
          }
          familiarTopicsMeta {
            count
          }
          masteredTopicsMeta {
            count
          }
        }
      }
    `,
    type: 'userProfileRewatch/fetch',
    key: 'userProfileRewatch'
  })

export default fetchUserProfileRewatch
