import gql from 'graphql-tag'
import duck from '../duck'

const addToUserStudentProfile = (id) => {
  return duck.query({
    query: gql`
    mutation addstudentprofile($input:StudentProfileInput!,$userId:ID){
      addStudentProfile(input:$input,userConnectId:$userId){
        id
        schoolName
        user{
          id
        }
      }
    }
    `,
    variables: {
      input: {
        schoolName: ''
      },
      userId: id
    },
    type: 'studentProfile/fetch',
    key: 'accountProfile'
  })
}

export default addToUserStudentProfile