import gql from 'graphql-tag'
import requestToGraphql from '../../utils/requestToGraphql';

const fetchClassroomStudentProfiles = async ({ schoolId, grade, section }) => {
  return requestToGraphql(
    gql`
    query {
      studentProfiles(filter: {
        and: [
          { school_some: { id: "${schoolId}" } }
          { grade: ${grade} }
          { section: ${section} }
          ]
        }
      ) {
        id
        user {
          id
          name
        }
        grade
        section
      }
    }
  `
  )}
export default fetchClassroomStudentProfiles
