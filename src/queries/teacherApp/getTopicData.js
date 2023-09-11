import gql from 'graphql-tag'
import duck from '../../duck';


const getHomeworkTitle= async (batchId ) => {

    return duck.query({
        query: gql`
        {
            getHomeworkTitle: classroomDetail(batchId: "${batchId}") {
             classroomHomework: classroomDetail{
                students{
                user{
                id
                name
                }
                }}
                classroomCourse{
                  id
                }
              
              sessions {
                id
                sessionStatus
                documentType
                topic {
                  id
                  title
                  questionsQuizCount
                  topicAssignmentQuestionsCount
                  thumbnailSmall {
                    id
                    uri
                  }
                  topicComponentRule {
                    componentName
                  }
                }
              }
            }
          }
    `,
        type: 'getHomeworkTitle/fetch',
        key: 'getHomeworkTitle'
    })
}
export default getHomeworkTitle