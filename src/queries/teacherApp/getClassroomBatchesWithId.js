import gql from 'graphql-tag'
import duck from '../../duck';


const fetchClassroomBatchesWithId = async (classroomId) => {
  return duck.query({
    query: gql`
        {
          classrooms:batches(filter:{id:"${classroomId}"}) {
              currentComponent {
                currentTopic {
                  order
                }
              }
            }
        }
    `,
    type: 'teacherAppClassroomsWithId/fetch',
    key: 'teacherAppClassroomsWithId'
  })
}

export default fetchClassroomBatchesWithId