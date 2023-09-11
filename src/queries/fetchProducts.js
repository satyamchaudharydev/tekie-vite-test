import gql from 'graphql-tag'
import duck from '../duck'
import config from "../config";
import getCourseId from '../utils/getCourseId';

const fetchProducts = (userRole = config.MENTEE, force = false) => duck.createQuery ({
    query : gql`
        query{
          products(filter:{
            and:[
              {
                course_some:{
                  id: "${getCourseId()}"
                }
              },
              {
                status: ${config.published}
              },
              {
                isDemoPack:false
              }
            ]
          }){
            id
            title
            type
            createdAt
            isDemoPack
            price{
              amount
              currency
            }
            status
            course{
              title
              status
              thumbnail {
                uri
              }
            }
            discounts{
              id
              code
              percentage
              expiryDate
              isDefault
            }
          }
        }
    `,
    type: 'product/fetch',
    key: 'product/'+ getCourseId(),
    force
})


export default fetchProducts
