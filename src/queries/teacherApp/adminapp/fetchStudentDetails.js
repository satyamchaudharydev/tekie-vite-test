import gql from "graphql-tag";
import duck from "../../../duck";

const fetchClassroomStudentsData = async (
  filterGrades,
  filterSection,
  searchTerm
) => {
  let gradesQuery = "[";
  filterGrades.forEach((grade) => (gradesQuery += `${grade},`));
  gradesQuery += "]";

  let gradesQuery1 = "[";
  filterSection.forEach((grade) => (gradesQuery1 += `${grade},`));
  gradesQuery1 += "]";

  return duck.query({
    query: gql`
    {
       classroomStudentsData:  studentProfiles(filter: {and: 
        [${
          searchTerm
            ? `{
          user_some:{
          name_contains:"${searchTerm}"
         }
      }`
            : ""
        }
   
          {school_some: {id: "cl0agvnfo00036kujh14653xj"}}, {grade_in: ${gradesQuery}}{section_in:${gradesQuery1}}]}, first: 5, skip: 0) {
          id
         singleStudentName: user {
            id
            name
          }
          grade
          section
          rollNo
          parents {
            id
            user {
              id
              name
              phone {
                countryCode
                number
              }
              email
            }
          }
        }
        studentProfilesMeta(filter: {and: [{school_some: {id: "ckui3bwt90000yorzac8r6lce"}}, {grade: Grade1}]}) {
          count
        }
      }
  `,
    type: "classroomStudentsData/fetch",
    key: "classroomStudentsData",
  });
};
export default fetchClassroomStudentsData;
