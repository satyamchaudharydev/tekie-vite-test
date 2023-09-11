import gql from "graphql-tag"
import duck from "../../duck"
import { get } from 'lodash'
import getIdArrForQuery from "../../utils/getIdArrForQuery"

const addTeacherMentorProfile = ({input, userConnectId, schoolConnectIds, schoolClassesConnectIds}) => {
  return duck.query({
    query: gql`
    mutation ($input: MentorProfileInput!){
      addMentorProfile(
        input: $input,
        userConnectId: "${userConnectId}",
        schoolsConnectIds: [${getIdArrForQuery(schoolConnectIds)}],
        schoolClassesConnectIds: [${getIdArrForQuery(schoolClassesConnectIds)}]
        ) {
        id
      }
    }
  `,
  variables : {
    input
  },
  type: 'addMentorProfile/add',
  key: 'addMentorProfile',
  // extractedData: (extracted, original) => {
  //   return { ...extracted }
  // }
})
}

const addTeacherUserProfile = (userInput, settingsInput) => {
  const input = {
    role: "mentor", 
    secondaryRole: "schoolTeacher", 
    name: get(userInput, 'teacherName'), 
    email: get(userInput, 'email'), 
    password: get(userInput, 'password'), 
    phone: { 
      countryCode: "+91", 
      number: get(userInput, 'phone'),
    }
  }

  return duck.query({
    query: gql`
    mutation ($input: UserInput!){
      addUser(input: $input) {
        id
      }
    }
  `,
  variables : {
    input
  },
  type: 'addUser/add',
  key: 'addUser',
  changeExtractedData: async (extracted, original) => {
    if (get(original, 'addUser.id')) {
      const teacherData = {
        input: { ...settingsInput },
        schoolConnectIds: get(userInput, 'schoolConnectIds'),
        schoolClassesConnectIds: get(userInput, 'schoolClassesConnectIds'),
        userConnectId: get(original, 'addUser.id')
      }
      await addTeacherMentorProfile(teacherData)
    }
    return { ...extracted }
  }
})
}

export default addTeacherUserProfile