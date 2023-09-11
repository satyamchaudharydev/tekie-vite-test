

import gql from "graphql-tag"
import duck from "../../duck"

const deleteBatchSession = (sessionId) => {
    return duck.query({
        query: gql`
        
        mutation{
            deleteBatchSession(id:"${sessionId}"){
              id
            }
          }
        
        `,
        type: 'deleteClassroomSession/delete',
        key: 'deleteClassroomSession'
    })
}

export default deleteBatchSession