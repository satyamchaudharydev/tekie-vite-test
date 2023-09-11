import gql from 'graphql-tag'
import duck from '../../../duck';

const fetchClassroomGrades = async () => {

  return duck.query({
    query: gql`
    {
        classroomGrades: school(id: "ckwvx2tg100000twv4emecbm4") {
           id
           classes {
             id
             grade
             section
           }
         }
       }
  `,
    type: 'classroomGrades/fetch',
    key: 'classroomGrades'
  })
}
export default fetchClassroomGrades