import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'
import getCourseId from '../utils/getCourseId'
/**
 *
 * @param {string} topicId
 * @param {'video'|'message'|'practiceQuestion'|'quiz'} component
 */
const fetchUnlockBadge = async (topicId, component) =>
    duck.query({
        query: gql`
      mutation getUnlockedUserBadge($getUnlockedUserBadgeInput: GetUnlockedUserBadgeInput) {
        getUnlockedUserBadge(input: $getUnlockedUserBadgeInput) {
          displayBadge
          badge{
            id
            name
            description
            type
            activeImage{
              id
              uri
              name
            }
          }
        }
      }    
    `,
    changeExtractedData: (extractedData, originalData) => {
        const changedData = extractedData
        if (extractedData && extractedData.unlockBadge && extractedData.unlockBadge.badge && extractedData.unlockBadge.badge.id) {
          changedData.unlockBadge.id = extractedData.unlockBadge.badge && extractedData.unlockBadge.badge.id
          return changedData
        }
        return {}
    },
    variables: {
      getUnlockedUserBadgeInput: {
          topicId,
          component,
          courseId: getCourseId(topicId)
      }
    },
    type: 'unlockBadge/fetch',
    key: `unlockBadge/${component}/${topicId}`
  })

export default fetchUnlockBadge