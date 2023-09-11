import gql from 'graphql-tag'
import duck from '../../duck'

export const fetchVideos = (ids) => {
    return duck.createQuery({
        query: gql`
            query {
                videos(
                    filter: {
                        id_in: [${ids.map(id => `"${id}"`)}]
                    }
                )
                {
                    id
                    title
                    description
                    subtitle {
                       name
                       uri
                    }
                    thumbnail {
                        uri
                    }
                    videoFile {
                        name
                        uri
                    }
                    id
                }
            }
        `,
    type: 'videos/fetch',
    key: 'videos',

    })
}