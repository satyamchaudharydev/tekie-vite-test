import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../../duck'


const fetchContentTags = async () => {
    return duck.query({
        query: gql`
        {
            contentTags(
              filter: {
                and: [
                  { tagStatus: active }
                  { displayOnWebsite: true }
                  { isEventTag: true }
                ]
              }
            ) {
              id
              title
            }
          }
        `,
        type: 'contentTags/fetch',
        key:"contentTags"
    })
}

export default fetchContentTags