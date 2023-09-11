import gql from "graphql-tag";
import duck from "../../../duck";
import { get } from "lodash";
const updateStudentsData = async (object , singleData) => {
  
  const inputObject = {
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
  };
 
  return duck.query({
    query: gql`
    mutation {
        updateParent: updateUser(id: "${get(singleData,"parents[0].user.id","")}", input: {name: "${inputObject.parentName}", email: "${inputObject.parentEmail}", phone: {countryCode: "+91", number: "${inputObject.parentPhone.number}"}}) {
          id
        }
        updateStudent: updateUser(id: "${get(singleData , "singleStudentName.id")}", input: {name: "${inputObject.childName}"}) {
          id
        }
        updateStudentProfile(id: "${get(singleData , "id")}", input: {grade: ${inputObject.grade}, section: ${inputObject.section}}) {
          id
        }
      }
    `,
   
    type: "updateStudentsData/update",
    key: "updateStudentsData",
    
  });
};
export default updateStudentsData;

