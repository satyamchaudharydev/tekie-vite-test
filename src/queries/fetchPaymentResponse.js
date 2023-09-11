import gql from 'graphql-tag'
import duck from '../duck/duckIfCacheExists'

const fetchPaymentResponse = (id, hash, status, payuMoneyId, force = false) =>
    duck.createQuery({
        query: gql`
        mutation{
          getPaymentResponse(id: "${id}",
          hash: "${hash}",
          status: "${status}",
          payuMoneyId: "${payuMoneyId}",
          ){
            result
          }
        }
    `,
        type: 'paymentResponse/fetch',
        key: id,
        force
    })

export default fetchPaymentResponse
