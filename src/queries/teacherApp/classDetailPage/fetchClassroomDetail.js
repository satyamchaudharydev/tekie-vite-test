import gql from 'graphql-tag'
import duck from '../../../duck'
import { getSlotNames } from '../../../utils/slots/slot-names'

const fetchClassroomDetail = (batchId) => {
    return duck.query({
      query: gql`
        query {
            classroomDetail(batchId: "${batchId}") {
                id
                batchThumbnail
                createdAt
                customSessionLink
                learingCount
                revisionCount
                assignmentCount
                testCount
                classroomCourse {
                  id
                  title
                  thumbnail
                  tools {
                    value
                  }
                  programming {
                    value
                  }
                  theory {
                    value
                  }
                }
                classroomData: classroomDetail {
                  description
                  classroomTitle
                  classes{
                    grade
                    section
                  }
                  students {
                    id
                    section
                    grade
                    user {
                      id
                      name
                      profilePic{
                        uri
                      }
                    }
                    parents {
                      id
                      user {
                        id
                        name
                        email
                        phone {
                          number
                          countryCode
                        }
                      }
                    }
                  }
                }
                sessions {
                  id
                  sessionOtp {
                    section
                    grade
                    otp
                  }
                  bookingDate
                  sessionRecordingLink
                  ${getSlotNames()}
                  sessionStartDate
                  sessionEndDate
                  sessionRecordingLink
                  sessionStatus
                  sessionMode
                  sessionType
                  documentType
                  attendance {
                    isPresent
                  }
                  classroom {
                    description
                    code
                  }
                  topic {
                    id
                    title
                    order
                    thumbnailSmall {
                      id
                      uri
                      name
                    }
                  }
                  previousTopic {
                    id
                    title
                    order
                    thumbnailSmall {
                      id
                      uri
                      name
                    }
                  }
                }
              }
      }
      `,
      type: 'classroomDetail/fetch',
      key: `classroomDetail`,
      changeExtractedData: (extracted, original) => {
        return { ...original }
      }
    })
}

export default fetchClassroomDetail

