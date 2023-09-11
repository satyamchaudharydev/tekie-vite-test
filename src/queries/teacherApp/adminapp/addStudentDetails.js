import gql from "graphql-tag";
import duck from "../../../duck";
import { get } from "lodash";
const addStudentsData = async (object) => {
  
  const input = {
    parentName: object.parentName,
    childName: object.studentName,
    grade: object.selectedGrade.value,
    schoolName: object.classroomName,
    parentPassword: object.password,
    section: object.selectedSection.value,
    parentEmail: object.email,
    parentPhone: {
      countryCode: "+91",
      number: object.phoneNumber,
    },
    rollNo:object.rollNumber
  };

 
  return duck.query({
    query: gql`
      mutation($input: ParentChildSignUpInput!) {
       addStudentsData: parentChildSignUp(
          input: $input
          schoolId: "cl0agvnfo00036kujh14653xj"
        ) {
          id
        }
      }
    `,
    variables: {
      input,
      tokenType: 'appTokenOnly'
    },
    type: "addStudentsData/add",
    key: "addStudentsData",
    
  });
};
export default addStudentsData;
