import gql from 'graphql-tag'
import duck from '../../duck';

export const fetchSchoolClasses = async (schoolId) => {

  return duck.query({
    query: gql`
    {
      schoolClasses(filter:{
        school_some: { id : "${schoolId}" }
      }) {
        id
        grade
        section
      }
    }
  `,
    type: 'schoolClasses/fetch',
    key: 'schoolClasses'
  })
}

export const fetchSchoolTeacherClasses = async (mentorId) => {
  return duck.query({
    query: gql`
    {
      teacherClassrooms: batches(filter:{
        and:[
          { allottedMentor_some: { id: "${mentorId}" } }
          { documentType : classroom }
        ]
      }) {
        id
        classroomTitle
      }
    }
  `,
    type: 'teacherClassrooms/fetch',
    key: 'teacherClassrooms'
  })
}
