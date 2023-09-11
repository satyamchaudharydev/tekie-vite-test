import gql from 'graphql-tag'
import duck from '../duck'

const updateUserVideo = async (id, input) =>
  duck.query({
    query: gql`
      mutation updateUserVideo($id: ID!, $input: UserVideoUpdate) {
        updateUserVideo(id: $id, input: $input) {
          id
          isBookmarked
          isLiked
        }
      }
    `,
    variables: {
      id,
      input
    },
    type: duck.action.userVideoUpdate,
    key: 'userVideo'
  })

export default updateUserVideo
