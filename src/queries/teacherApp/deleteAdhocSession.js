import gql from "graphql-tag"
import duck from "../../duck"

const deleteAddhocSession = (sessionId) => {

    return duck.query({
        query: gql`
        
        mutation{
            deleteAdhocSession(id:"${sessionId}"){
              id
            }
          }
        
        `,
        type: 'deleteClassroomSession/delete',
        key: 'deleteClassroomSession'
    })
}

export default deleteAddhocSession