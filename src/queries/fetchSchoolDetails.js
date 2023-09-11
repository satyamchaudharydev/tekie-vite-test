import gql from 'graphql-tag'
import duck from '../duck'

const fetchSchoolDetails = (code) =>
  duck.query ({
    query : gql`
      {
        getSchoolDetails(input:{
          code: "${code}"
        }) {
          id
          isTeachersAppEnabled
          isOtpLoginEnabled
          isBuddyLoginEnabled
          buddyLoginLimit
          name
          code
          coordinatorEmail
          bgImage {
            id
            uri
          }
          coordinatorPhone {
            countryCode
            number
          }
          coordinatorRole
          coordinatorName
          city
          country
          logo {
            uri
          }
        }
      }
    `,
    type: 'schoolDetails/fetch',
    key: 'schoolDetails',
})


export default fetchSchoolDetails
