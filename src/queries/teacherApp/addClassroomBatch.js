import gql from 'graphql-tag'
import duck from '../../duck';
import { get } from 'lodash';
import getIdArrForQuery from '../../utils/getIdArrForQuery';

export const updateClassroomBatch = async (batchId, studentIds) => {
  return duck.query({
    query: gql`
    mutation {
      updateBatch(
        id: "${batchId}",
        studentsConnectIds: [${getIdArrForQuery(studentIds)}]
      ) {
        id
        createdAt
        thumbnailSmall
        studentsMeta {
          count
        }
        classes {
          grade
          section
        }
        classroomTitle
        course {
          tools { value }
          theory { value }
          programming { value }
        }
      }
    }
  `,
    type: 'teacherBatches/update',
    key: 'teacherBatches'
  })
}

const addClassroomBatch = async (input, connectIds) => {

  return duck.query({
    query: gql`
    mutation($input: BatchInput!) {
      addBatch(input: $input,
        courseConnectId: "${get(connectIds, 'courseConnectId')}"
        coursePackageConnectId: "${get(connectIds, 'coursePackageConnectId')}"
        allottedMentorConnectId: "${get(connectIds, 'allottedMentorConnectId')}"
        studentsConnectIds: [${getIdArrForQuery(get(connectIds, 'studentsConnectIds'))}]
        classesConnectIds: [${getIdArrForQuery(get(connectIds, 'classesConnectIds'))}]
        schoolConnectId: "${get(connectIds, 'schoolConnectId')}"
      ) {
        id
        createdAt
        thumbnailSmall
        studentsMeta {
          count
        }
        classes {
          grade
          section
        }
        classroomTitle
        course {
          tools { value }
          theory { value }
          programming { value }
        }
      }
    }
  `,
    variables: {
      input
    },
    type: 'teacherBatches/add',
    key: 'teacherBatches'
  })
}
export default addClassroomBatch
