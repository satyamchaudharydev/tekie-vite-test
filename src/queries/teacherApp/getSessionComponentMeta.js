import gql from 'graphql-tag'
import duck from '../../duck';


const getSessionComponentMeta = async (sessionId) => {

    return duck.query({
        query: gql`
         {
            getSessionComponentMeta(sessionId:"${sessionId}") { 
                id
                topicId
                classroomId
                classroomTitle
                totalStudents
                completedPQMeta
                isPQComponentExists
                sessionStatus
                completedAssignmentDetailsByUser {
                    userId
                    username
                    rollNo
                    isHomeworkSubmitted
                    isQuizSubmitted
                    isAssignmentSubmitted
                    isPracticeSubmitted
                }
       }
    }
    `,
        type: 'currentClassroomMeta/fetch',
        key: 'currentClassroomMeta'
    })
}
export default getSessionComponentMeta
