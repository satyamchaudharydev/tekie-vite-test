import gql from 'graphql-tag'
import get from 'lodash/get'
import duck from '../duck/duckIfCacheExists'

const fetchTopicJourney = (topicId, force = false, courseId = null) =>
  duck.createQuery({
    query: gql`
    mutation{
      userTopicJourney(
        topicId:"${topicId}",
        ${courseId ? `courseId:"${courseId}"` : ''} 
      ){
        video {
         id
         title
          description
          thumbnail{
            id
            uri
          }
          isUnlocked
        }
        topicStatus
        blockBasedPractices {
          id
          title
          description
          isUnlocked
          order
        }
        blockBasedProjects {
          id
          title
          isUnlocked
          order
          description
        }
        videos {
          id
          title
          description
          isUnlocked
          order
        }
        learningObjectives {
          id
          title
          order
          description
          isUnlocked
          chatStatus
          practiceQuestionStatus
          comicStripStatus
          learningSlideStatus
        }
        quiz {
          masteryLevel
          title
          description
          thumbnail {
            id
            uri
          }
          isUnlocked
          status
        }
      }
    }`,
    type: 'topicJourney/fetch',
    key: `topicJourney/${topicId}`,
    force,
    changeExtractedData: (extractedData, originalData) => {
      if (extractedData && extractedData.userTopicJourney && topicId) {
        extractedData.userTopicJourney.id = topicId
        extractedData.userTopicJourney.blockBasedProjects = get(originalData, 'userTopicJourney.blockBasedProjects', [])
        return extractedData
      }
      return {}
    }
  })

export default fetchTopicJourney
