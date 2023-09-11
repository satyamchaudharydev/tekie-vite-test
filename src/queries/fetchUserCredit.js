import gql from 'graphql-tag'
import duck from '../duck'

const fetchUserCredit = id =>
  duck.createQuery({
    query: gql`
    query userCredit(
      $id: ID
    ) {
      userCredits(filter:{
        user_some:{id:$id}
      }) {
        id
        credits
      }
    }
    `,
  variables: {
     id
  },
  key: 'userCredit/' + id,
  type: 'userCredit/fetch',
})

export default fetchUserCredit
