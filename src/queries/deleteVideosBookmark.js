import gql from 'graphql-tag'
import duck from '../duck'

const deleteBookmarkVideos = async videosList =>
  duck.query({
    query: gql`
      mutation deleteBookmarkVideos($videoUpdate: [UserVideosUpdate]!) {
        updateUserVideos(input: $videoUpdate) {
          id
          isBookmarked
        }
      }
    `,
    variables: {
      videoUpdate: videosList
    },
    type: 'deleteBookmarkUserVideo/update'
  })

export default deleteBookmarkVideos
