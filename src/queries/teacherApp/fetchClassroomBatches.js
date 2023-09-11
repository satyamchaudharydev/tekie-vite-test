import gql from 'graphql-tag'
import duck from '../../duck/duckIfCacheExists';


const fetchClassroomBatches =(loggedInUserId) => {
  const academicYearId = localStorage.getItem('academicYear') || ''
  let academicYearFilter = ''
  if (academicYearId && ![null, undefined, 'null', 'undefined'].includes(academicYearId)) {
    academicYearFilter = `{ academicYear_some: { id: "${academicYearId}" } }`
  }
  return duck.createQuery({
    query: gql`
        {
            classrooms: batches(filter:{
              and:[
                {allottedMentor_some:{
                  id:"${loggedInUserId}"
                }}
                {
                  documentType:classroom
                }
                { isTeacherTraining_not: true }
                ${academicYearFilter}
              ]
            }) {
              classes{
                grade
                section
              }
              id
              classroomTitle
              courseData: course {
                id
                title
                status
                minGrade
                maxGrade
              }
              currentComponent {
                currentTopic {
                  order
                }
              }
            }
        }
    `,
    type: 'teacherAppClassrooms/fetch',
    key: 'teacherAppClassrooms'
  })
}

export default fetchClassroomBatches