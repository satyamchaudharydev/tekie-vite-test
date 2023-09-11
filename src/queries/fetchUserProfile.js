import gql from 'graphql-tag'
import duck from '../duck'
import config from '../config'

const fetchUserProfile = userId =>
  duck.createQuery({
    query: gql`
      {
        userProfiles(
          filter: { user_some: { id: "${userId}" } }
        ) {
          id
          topicsCompleted
          charactersUnlocked
          proficientTopics {
            id
          }
          proficientTopicCount
          freeProficientTopicCount
          masteredTopics {
            id
          }
          masteredTopicCount
          freeMasteredTopicCount
          familiarTopics {
            id
          }
          familiarTopicCount
          freeFamiliarTopicCount
        }
        topics(
          filter: {
            status: ${config.published}
          }
        ) {
          id
        }
      }
    `,
    type: duck.action.userProfileFetch,
    key: 'userProfile'
  })

export default fetchUserProfile
