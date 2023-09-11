import gql from 'graphql-tag'
import duck from '../../../duck'
import {getSlotNames} from '../../../utils/slots/slot-names'

const fetchUpcomingSessions = (batchId) => {
    const date = new Date().toISOString()
    return duck.query({
      query: gql`
        query {
            getNextOrPrevClassroomSessions(input:[
              {
                classroomId: "${batchId}",
                limit: 2,
                queryType: next,
                documentType: classroom,
                bookingDate:" ${date}"
              }
            ]) {
              classroomId
              limit
              queryType
              documentType
              sessions {
                id
                topicTitle
                topicOrder
                bookingDate
                totalStudents
                startMinutes
                endMinutes
                ${getSlotNames()}
                completedHomeworkMeta
                thumbnailSmall{
                  uri
                }
                recordType
                sessionMode
                sessionStartDate
                sessionEndDate
                sessionStatus
                sessionRecordingLink
              }
            }
          }
      `,
      type: 'classroomSession/fetch',
      key: 'classDetail'
    })
}

export default fetchUpcomingSessions

