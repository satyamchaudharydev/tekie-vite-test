import gql from "graphql-tag"
import duck from "../../duck"

const endAdhocSession = (sessionId) => {

    return duck.query({
        query: gql`
        
           mutation{
               updateAdhocSession(id:"${sessionId}",input:{sessionStatus:completed}){
                   id
               }
           }
        
        `,
        type: 'updateAdhocSession/update',
        key: 'updateAdhocSession'
    })
}

export default endAdhocSession