import gql from 'graphql-tag'
import duck from '../../duck';
import getEnumArrForQuery from '../../utils/getEnumArrForQuery';
import getIdArrForQuery from '../../utils/getIdArrForQuery';

const fetchBatchesMeta = async ({ mentorId, classroomIn, gradeIn, sectionIn }) => {
  return duck.query({
    query: gql`
    {
      batchesMeta(filter: {
        and:
        [
          ${mentorId ? `{ allottedMentor_some: { id: "${mentorId}" } }` : ''}
          ${classroomIn && classroomIn.length > 0 ? `{ classroomTitle_in: [${getIdArrForQuery(classroomIn)}] }` : ''}
          ${gradeIn && gradeIn.length > 0 ? `{ classes_some: { grade_in: [${getEnumArrForQuery(gradeIn)}]} }` : ''}
          ${sectionIn && sectionIn.length > 0 ? `{ classes_some: { section_in: [${getEnumArrForQuery(sectionIn)}] } }` : ''}
          { documentType: classroom }
        ]
      },) {
        count
      }
    }
  `,
    type: 'batchesMeta/fetch',
    key: 'batchesMeta'
  })
}
export default fetchBatchesMeta