import gql from 'graphql-tag'
import duck from '../../duck';

const fetchSchoolBatchCodes = async (schoolCode) => {

  return duck.query({
    query: gql`
    {
      schoolBatchCodes: batches(filter:{
        code_contains: "CR-${schoolCode}-"
      }, orderBy: createdAt_DESC, first: 2) {
        id
        code
      }
    }
  `,
    type: 'schoolBatchCodes/fetch',
    key: 'schoolBatchCodes'
  })
}
export default fetchSchoolBatchCodes