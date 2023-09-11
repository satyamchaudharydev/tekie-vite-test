import gql from 'graphql-tag'
import duck from '../../duck';

const fetchClassroomCourses = async () => {

  return duck.query({
    query: gql`
    {
      classroomCourses: coursePackages (filter:{ status:published }
      ) {
        id
        title
        minGrade
        maxGrade
        coursesData: courses {
          id
          tools { value }
          theory { value }
          programming { value }
        }
      }
    }
  `,
    type: 'classroomCourses/fetch',
    key: 'classroomCourses'
  })
}
export default fetchClassroomCourses

/**
 * classroomCourses: courses (filter:{ status:published }
 *       ) {
 *         id
 *         title
 *         minGrade
 *         maxGrade
 *         tools { value }
 *         theory { value }
 *         programming { value }
 *       }
 */
