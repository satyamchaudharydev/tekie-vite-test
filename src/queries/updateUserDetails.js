import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../duck'

const updateUserDetails = async (input,id, key) =>
  duck.query({
    query: gql`
    mutation updateUser($input:UserUpdate,$id:ID!){
      updateUser(
        id:$id
        input:$input){
        id
        dateOfBirth
        timezone
        email
        gender
        phone{
          countryCode
          number
        }
      }
    }
    `,
    variables: {
      input,
      id
    },
    type: 'user/fetch',
    key: key || 'accountProfile',
    changeExtractedData: (extractedData, originalData) => {
      localStorage.setItem('timezone', get(originalData, 'updateUser.timezone'))
      return extractedData
    }
  })

const updateStudentProfile = async (input,id) =>
  duck.query({
    query: gql`
    mutation updatestudentprofile($input:StudentProfileUpdate,$id:ID!){
      updateStudentProfile(
        id:$id
        input:$input){
        id
        grade
        schoolName
        profileAvatarCode
        user{
          id
        }
      }
    }
    `,
    variables: {
      input,
      id
    },
    type: 'studentProfile/fetch',
    key: 'accountProfile'
  })

export {updateUserDetails,updateStudentProfile}