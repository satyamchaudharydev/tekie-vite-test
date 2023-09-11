import gql from 'graphql-tag'
import duck from '../../duck'

export const fetchUserVideos = (userId,videoIds) => {
    return duck.createQuery({
        query: gql`
        {
          learnVideos: userVideos(
              filter: {
                and: [
                  { user_some: { id: "${userId}"} }
                  { video_some: { id_in: [ 
                    ${videoIds.map(id => `"${id}"`)}
                  ] } }
                ]
              }
            ) {
              id
              isBookmarked
              video {
                id
                title
              }
            }
          }
        `,
    type: 'learnUserVideos/fetch',
    key: 'learnUserVideos',

    })
}