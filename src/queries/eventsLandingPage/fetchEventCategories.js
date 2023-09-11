import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../../duck'


const fetchEventCateogories = async () => {
    return duck.query({
        query: gql`
        {
            eventCategories(
              filter: { and: [{ displayOnWebsite: true }, { status: active }] }
            ) {
              id,
              title
            }
          }
        `,
        type: 'eventCategories/fetch',
        key:"eventCategories"
    })
}

export default fetchEventCateogories



