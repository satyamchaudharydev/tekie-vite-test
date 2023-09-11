import gql from 'graphql-tag'
import config from '../../config';
// import { get } from 'lodash'
import duck from '../../duck'
import getCourseId from '../../utils/getCourseId'

const fetchSessionHomepageTopics = (userRole = config.MENTEE, force = false, courseId = '') => duck.createQuery ({
    query : gql`
      query {
        topics(filter:{
          chapter_some:{
            courses_some:{
              id: "${courseId || getCourseId()}"
            }
          }
        }) {
          id
          title
          order
          chapter{
            id
            courses {
              id
            }
          }
        }
      }
    `,
    type: 'sessionHomepage/fetch',
    key: 'sessionHomepage',
    variables: {
      CDNCaching: true,
    },
    force,
    changeExtractedData: (extractedData, originalData) => {
      if (extractedData && extractedData.availableSlot && originalData.topics) {
        extractedData = {
          topics: originalData.topics,
        };
      }
      return extractedData
    }
})

export default fetchSessionHomepageTopics
