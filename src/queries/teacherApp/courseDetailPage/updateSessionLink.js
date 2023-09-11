import gql from 'graphql-tag'
import duck from '../../../duck'

const updateSessionLink = (batchId, link) =>
   duck.query({
    query: gql`
    mutation {
        updateBatch(id: "${batchId}",input: { customSessionLink: "${link}"}){
            id
            customSessionLink
        }
    }
    `,
    type: 'updateBatch/update',
})


export default updateSessionLink
