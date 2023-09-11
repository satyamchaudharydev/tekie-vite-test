import gql from 'graphql-tag'
import duck from '../../../duck'
import {getSlotNames} from '../../../utils/slots/slot-names'

const fetchPrevSessions = (batchId, bookingDate) => {
    return duck.query({
      query: gql`
        query {
            getNextOrPrevClassroomSessions(input:[
              {
                classroomId: "${batchId}",
                limit: 1,
                queryType: previous,
                documentType: classroom,
                bookingDate:" ${bookingDate}"
              }
            ]) {
              classroomId
              limit
              queryType
              documentType
              sessions {
                id
                totalStudents
                completedHomeworkMeta
              }
            }
          }
      `,
      type: 'classroomSession/fetch',
      key: 'homeworkPage'
    })
}

export default fetchPrevSessions

