import gql from 'graphql-tag'
import duck from '../../../../../../../duck'
// classworkAssignmentMeta
// homeworkAssignmentMeta
// homeworkQuizMeta

const fetchPreviousClassromDetails = (classroomId, bookingDate, queryType = 'previous', limit = 1) => {
  return duck.query({
    query: gql`
        query {
            getNextOrPrevClassroomSessions(input:[
                    {
                    classroomId: "${classroomId}",
                    limit: ${limit},
                    queryType: ${queryType},
                    bookingDate: "${bookingDate}",
                    }]) {
                    id: classroomId
                    sessions {
                      id
                      recordType
                      sessionStatus
                      isHomeworkExists
                      isQuizExists
                      completedHomeworkMeta
                      completedQuizMeta
                      totalStudents
                      topicTitle
                      topicOrder
                      classworkAssignmentMeta
                      homeworkAssignmentMeta
                      homeworkQuizMeta
                      thumbnailSmall {
                        uri
                      }
                      bookingDate
                      startMinutes
                      endMinutes
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
                      classType
                      topicComponentRule{
                        componentName
                        learningObjectiveComponentsRule{
                          componentName
                          order
                        }
                        learningObjective{
                          id
                          title
                          messagesMeta{
                            count
                          }
                          learningSlidesMeta(filter:{
                            status:published
                          }){
                            count
                          }
                            learningSlidesQuestionMeta:questionBankMeta(filter:{
                              and:[
                              {
                                status:published
                              }
                                {
                                  learningSlides_exists:true
                                }
                            ]
                            
                          }){
                            count
                          }
                          questionBankMeta(filter:{
                            status:published
                          }){
                            count
                          }
                        }
                        blockBasedProject {
                          id
                        }
                        video{
                          id
                           videoStartTime
                          videoEndTime
                        }
                      }
                    }
                }
        }
      `,
    type: 'classroomNextSessions/fetch',
    key: `classroomNextSessions/${classroomId}`
  })
}

export default fetchPreviousClassromDetails
