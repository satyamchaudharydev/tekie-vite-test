import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'

const fetchHomePage = (force = false) =>
  duck.createQuery({
    query: gql`
      mutation {
        userCourseSyllabus {
          currentCourse {
            id
            title
          }
          currentTopicComponent
          currentTopicComponentDetail {
            currentTopicId
            currentLearningObjectiveId
            componentTitle
            topicTitle
            thumbnail {
              id
              uri
              name
            }
            percentageCovered
            description
          }
          chapters {
            id
            title
            order
            topics {
              id
              title
              description
              order
              thumbnail {
                id
                name
                uri
              }
              description
              isUnlocked
            }
          }
          totalChapters
          totalTopics
        }
      }
    `,
    type: 'homepage/fetch',
    key: 'homepage',
    force
  })

export default fetchHomePage
