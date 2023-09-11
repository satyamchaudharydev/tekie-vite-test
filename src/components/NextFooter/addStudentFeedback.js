import gql from "graphql-tag"
import requestToGraphql from "../../utils/requestToGraphql"


export const addStudentFeedback = async ({studentFeedback,batchId,coursePackageId,topicId,userId}) => {
    // fix unxpected token error
    // write without variables
 console.log({studentFeedback,batchId,coursePackageId,topicId,userId})
    
    return await requestToGraphql(gql`
         mutation addStudentFeedback($studentFeedback: SessionFeedbackInput!, $topicId: ID!, $batchId: ID!, $userId: ID!, $coursePackageId: ID!) {
            addSessionFeedback(input: $studentFeedback, topicConnectId: $topicId, batchConnectId: $batchId, userConnectId: $userId, coursePackageConnectId: $coursePackageId) {
                id
                }}
                `,
                
                {
                    studentFeedback: studentFeedback,
                    topicId: topicId,
                    batchId: batchId,
                    userId: userId,
                    coursePackageId: coursePackageId
                }

            
        )
        }
       
        


