import gql from 'graphql-tag'
import duck from '../duck'

const fetchBookmark2 = async userId =>
  duck.query({
    query: gql`
      {
        userVideos(
          filter: {
            and: [
              { user_some: { id: "${userId}" } }
              { isBookmarked: true }
            ]
          }
        ) {
          id
          isBookmarked
          topic {
            id
            order
            title
            videoTitle
            videoThumbnail {
              id
              uri
            }
            videoStartTime,
            videoEndTime
          }
        }
      }
    `,
    type: 'userVideosBookmark/fetch',
    key: 'userVideosBookmark'
  })

export default fetchBookmark2
