import gql from 'graphql-tag'
import duck from '../../duck/duckIfCacheExists'

const deleteMenteeSession = (id, force = false) => duck.createQuery ({
    query: gql`
      mutation {
        deleteMenteeSession(id:"${id}") {
          id
        }
      }
    `,
    type: 'menteeSession/delete',
    key: 'deleteMenteeSession',
    force
})


export default deleteMenteeSession
