import gql from "graphql-tag"
import { get } from "lodash"
import duck from "../../duck"
import getIdArrForQuery from "../../utils/getIdArrForQuery"
import removeQuoteInArrForQuery from "../../utils/removeQuoteInArrForQuery"


const getClassroomSessions = async (filterQuery, loggedInUser) => {
  const startDate = new Date(new Date(filterQuery.startDate).setHours(0, 0, 0, 0)).toISOString()
  const endDate = new Date(new Date(filterQuery.endDate).setHours(0, 0, 0, 0)).toISOString()
  const schoolIds = [get(loggedInUser, 'rawData.mentorProfile.schools[0].id')]||[get(loggedInUser, 'schools[0].id')]||[]
  const userIdList = [get(loggedInUser, "id")]
  
  const queryObject=`{
    id
    sessionStartedByMentorAt
    courseData:course{
      id
      title
      codingLanguages{
        value
      }
      defaultLoComponentRule{
        componentName
        order
      }
    }
    topicData:topic {
      id
      order
      title
      description
      classType
      topicComponentRule {
        order
        childComponentName
        blockBasedProject{
          id
        }
        learningObjectiveComponentsRule{
          componentName
          order
        }
        learningObjective {
          id
          messagesMeta {
            count
          }
          questionBankMeta {
            count
          }
          comicStripsMeta {
            count
          }
          learningSlidesMeta {
            count
          }
          practiceQuestionLearningSlidesMeta: learningSlidesMeta(
            filter: { type: practiceQuestion }
          ) {
            count
          }
        }
        video {
          id
        }
        componentName
      }
      thumbnailSmall {
        id
        uri
      }
    }
    startMinutes
    eventType
    endMinutes
    classroom {
      id
      students{
        id
      }
      code
      classroomTitle
      description
      classes {
        id
        grade
        section
      }
      currentComponentTopicOrder
    }
    previousTopic {
      id
      title
      order
      description
      classType
      topicComponentRule {
        order
        childComponentName
        blockBasedProject{
          id
        }
        learningObjectiveComponentsRule{
          componentName
          order
        }
        learningObjective {
          id
          messagesMeta {
            count
          }
          questionBankMeta {
            count
          }
          comicStripsMeta {
            count
          }
          learningSlidesMeta {
            count
          }
          practiceQuestionLearningSlidesMeta: learningSlidesMeta(
            filter: { type: practiceQuestion }
          ) {
            count
          }
        }
        video {
          id
        }
        componentName
      }
    }
    documentType
    attendance {
       student{
        id
         grade
       }
      isPresent
      status
      absentReason
    }
    slot0
    slot1
    slot2
    slot3
    slot4
    slot5
    slot6
    slot7
    slot8
    slot9
    slot10
    slot11
    slot12
    slot13
    slot14
    slot15
    slot16
    slot17
    slot18
    slot19
    slot20
    slot21
    slot22
    slot23
    bookingDate
    documentType
    sessionType
    sessionRecordingLink
    sessionMode
    sessionStatus
    sessionStartDate
    sessionEndDate
    sessionOtp{
      otp
    }
  }`
  const getFilterValues=()=>{
    if(get(loggedInUser, "role")==="schoolAdmin"){
      return `{
        startDate: "${startDate}",
        endDate: "${endDate}",
        documentType:classroom,
        isAdmin:${get(loggedInUser, "role")==="schoolAdmin"},
        grades:[${removeQuoteInArrForQuery(filterQuery.grades)}],
        sections:[${removeQuoteInArrForQuery(filterQuery.sections)}],
        courses:[${getIdArrForQuery(filterQuery.courses)}],
        sessionStatus:[${removeQuoteInArrForQuery(filterQuery.sessionStatus)}],
        schools:[${getIdArrForQuery(schoolIds)}]
      }`
    }
    return `{
      startDate: "${startDate}",
      endDate: "${endDate}",
      userIds: [${getIdArrForQuery(userIdList)}],
      documentType:classroom,
      isAdmin:${get(loggedInUser, "role")==="schoolAdmin"},
      grades:[${removeQuoteInArrForQuery(filterQuery.grades)}],
      sections:[${removeQuoteInArrForQuery(filterQuery.sections)}],
      courses:[${getIdArrForQuery(filterQuery.courses)}],
      sessionStatus:[${removeQuoteInArrForQuery(filterQuery.sessionStatus)}],
      schools:[${getIdArrForQuery(schoolIds)}]
    }`
  }
      
  return duck.query({
    query: gql`
    {
      classroomSessions(filter:${getFilterValues()} )${queryObject}
    }
    `,
    type: "classroomSessions/fetch",
    key: "classroomSessions",
    // changeExtractedData: (extrData, ogData) => {
    //   const x = ogData.classroomSessions
    //   const y = x.map(obj => ({ ...obj, topicData: { ...obj.topic } }))
    //   return {...extracetdData,y}
    // }
  });
}

export default getClassroomSessions