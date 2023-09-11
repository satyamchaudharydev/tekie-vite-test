import gql from 'graphql-tag'
import duck from '../../duck/duckIfCacheExists'
import getCourseId from '../../utils/getCourseId'

const fetchTopics = (force = false) => duck.createQuery ({
    query : gql`
            query {
                  topics(filter:{
                    chapter_some:{
                      courses_some:{
                        id: "${getCourseId()}"
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
    type: 'topic/fetch',
    key: 'topic',
    force
})


export default fetchTopics
