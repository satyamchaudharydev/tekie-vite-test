import gql from 'graphql-tag'
import duck from '../../duck'

const updateSchool = (schoolId, input) =>
  duck.createQuery({
    query: gql`
    mutation updateUserSavedCode($input: SchoolUpdate!){
        updateSchool(
            id: "${schoolId}"
            input: $input
        ) {
            id
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
    variables: {
        input
    },
    key: 'updateSchool',
    type: 'updateSchool/update',
})

export default updateSchool