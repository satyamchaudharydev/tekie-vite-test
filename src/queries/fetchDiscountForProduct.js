import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'
import config from "../config";

const fetchDiscountForProduct = (couponCode, productId, force = false) => duck.createQuery ({
    query : gql`
        query{
          discounts(filter:{
            and:[
              {code: "${couponCode}"},
              {product_some:{
                id:"${productId}"
              }}
            ]
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


export default fetchDiscountForProduct
