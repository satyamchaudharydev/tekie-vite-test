import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../duck'

const addUserLocationLog = (input, userConnectId, token) => duck.query({
  query: gql`
    mutation($input: UserLocationLogInput!) {
      addUserLocationLog(
        input: $input,
        userConnectId:"${userConnectId}",
      ) {
        id
      }
    }
  `,
  variables: {
    input: {
      ip: get(input, 'ip', ''),
      city: get(input, 'city', ''),
      region: get(input, 'region', ''),
      regionCode: get(input, 'region_code', ''),
      country: get(input, 'country', ''),
      countryName: get(input, 'country_name', ''),
      countryCode: get(input, 'country_code', ''),
      latitude: `${get(input, 'latitude', '')}`,
      longitude: `${get(input, 'longtitude', '')}`,
      postal: get(input, 'postal', ''),
      timezone: get(input, 'timezone', ''),
      utcOffset: get(input, 'utc_offset', ''),
      countryCallingCode: get(input, 'country_code_calling', ''),
      currency: get(input, 'currency', ''),
    },
    token: token
  },
  type: 'userLocationLog/fetch'
})

export default addUserLocationLog
