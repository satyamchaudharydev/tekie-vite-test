import gql from "graphql-tag"
import { get } from "lodash"
import duck from "../../duck"

const startAdhocSession = (sessionId) => {

    return duck.query({
        query: gql`
        
           mutation{
               updateAdhocSession(id:"${sessionId}",input:{sessionStatus:started}){
                   id
               }
           }
        
        `,
        type: 'updateAdhocSession/update',
        key: 'updateAdhocSession',
    })
}

export default startAdhocSession