import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'
import config from "../config";

const fetchDiscount = (couponCode, force = false) => duck.createQuery ({
    query : gql`
        query{
          discounts(filter:{
            code: "${couponCode}"
          }){
            id
            percentage
            expiryDate
            code
            product{
              id
            }
          }
        }
    `,
    type: 'discount/fetch',
    key: 'discount',
    force
})


export default fetchDiscount
