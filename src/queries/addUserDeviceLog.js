import gql from 'graphql-tag'
import duck from '../duck'

const addUserDeviceLog = (input, userConnectId, token) => duck.query({
  query: gql`
    mutation($input: UserDeviceLogInput!) {
      addUserDeviceLog(
        input: $input,
        userConnectId:"${userConnectId}",
      ) {
        id
      }
    }
  `,
  variables: {
    input,
    token
  },
  type: 'userDeviceLog/fetch'
})

export default addUserDeviceLog
