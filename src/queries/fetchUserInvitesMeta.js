import gql from 'graphql-tag'
import duck from '../duck'


const fetchUserInvitesMeta = id =>
  duck.createQuery({
    query: gql`
      query{
        userInvitesMeta(filter:{
          invitedBy_some:{id:"${id}"}
        }) {
          count
        }
      }
    `,
  key: 'userInvitesMeta',
  type: 'userInvitesMeta/fetch',
})

export default fetchUserInvitesMeta
