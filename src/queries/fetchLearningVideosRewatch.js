import gql from 'graphql-tag'
import duck from '../duck'

const fetchVideosRewatch = async userId =>
  duck.query({
    query: gql`
      query {
        userVideos(filter: {
          and: [
            {user_some: {id: "${userId}"}},
            {or:[{status:complete}, {status:skip}]}
          ]}) {
          id
          status
          topic {
            id
            order
            title
            videoTitle
            videoThumbnail {
              id
              uri
            }
            chapter{
              title
              id
              order
            }
            videoStartTime,
            videoEndTime
          },
        }
      }
    `,
    type: 'learningVideosRewatch/fetch',
    key: 'learningVideosRewatch'
  })

export default fetchVideosRewatch
