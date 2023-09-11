import gql from "graphql-tag"
import duck from "../../duck"

const markSessionAsIncomplete = async ({ sessionId }) => {
    const batchSessionInput = `logoutAllStudents: true,`
    return duck.query({
        query: gql`
           mutation{
               updateBatchSession(id:"${sessionId}",input:{${batchSessionInput}}){
                   id
                   startMinutes
                   endMinutes
                   sessionStartDate
                   sessionEndDate
                   isRetakeSession
                   sessionStatus
                   attendance {
                        isPresent
                        status
                        absentReason
                    }
                    retakeSessions {
                        id
                        sessionStartDate
                        sessionEndDate
                        sessionStatus
                    }
               }
           }
        `,
        type: 'markSessionAsIncomplete/update',
        key: 'markSessionAsIncomplete'
    })
}

export default markSessionAsIncomplete