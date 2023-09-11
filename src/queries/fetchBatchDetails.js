import gql from 'graphql-tag'
import duck from '../duck'

const fetchBatchDetails = (userId) => {
  const batchQuery = `id
              type
              code
              shouldShowEbook
              classroomTitle
              documentType
              customSessionLink
              coursePackage {
                id
                title
              }
              currentComponent {
                currentCourse {
                  id
                  title
                  description
                }
              }`
  return duck.createQuery({
    query: gql`
      {
        user(id: "${userId}") {
          id
          studentProfile {
            id
            grade
            section
            rollNo
            school{
              id
              name
            }
            batch {
              ${batchQuery}
            }
            studentBatches: batches{
              ${batchQuery}
            }
          }
        }
      }
    `,
    type: 'userBatchInfo/fetch',
    changeExtractedData: (extractedData, originalData) => {
      if (!extractedData.currentCourse) {
        extractedData.currentCourse = []
      }
      return extractedData
    }
})
}

export default fetchBatchDetails
