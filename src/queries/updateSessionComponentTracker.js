import gql from "graphql-tag"
import extractSubdomain from "../utils/extractSubdomain"
import requestToGraphql from "../utils/requestToGraphql"
import { checkIfEmbedEnabled } from "../utils/teacherApp/checkForEmbed"

const updateSessionComponentTracker = async(componentId, input = {}) => {
    if(!checkIfEmbedEnabled() && componentId){
        await requestToGraphql(gql`mutation updateSessionComponentTracker($input: SessionComponentTrackerUpdate){
            updateSessionComponentTracker(id:"${componentId}",input: $input) {
            id
            }
        }`,
        {
            input
        }
        )
    }
}

export default updateSessionComponentTracker