import gql from 'graphql-tag'
import duck from '../../duck'

const fetchSchoolProfile = (
    id
) => {
  return duck.createQuery({
    query: gql`
    {
        schoolProfile: school(id:"${id}") {
            id
            name
            logo {
                id
                name
                uri
            }
            city
            country
            coordinatorEmail
            coordinatorPhone {
                countryCode
                number
            }
            coordinatorRole
            coordinatorName
        }
    }
    `,
    key: "schoolProfile",
    type: "schoolProfile/fetch",
  });
}

export default fetchSchoolProfile
