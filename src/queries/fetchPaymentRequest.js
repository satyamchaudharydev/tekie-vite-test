import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'

const fetchPaymentRequest = (productId, discountCode, isCreditUsed, force = false) =>
    duck.createQuery({
        query: gql`
        mutation{
          getPaymentRequest(
            productId: "${productId}",
            discountCode: "${discountCode}",
            isCreditUsed: ${isCreditUsed}
          ){
            txnId
            hash
            amount
            firstName
            email
            phone{
              countryCode
              number
            }
            productInfo
          }
        }
    `,
        type: 'paymentRequest/fetch',
        key: productId,
        force
    })

export default fetchPaymentRequest
