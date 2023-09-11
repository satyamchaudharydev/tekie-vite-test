import gql from "graphql-tag"
import requestToGraphql from "../../utils/requestToGraphql"

const isFeedbackSubmitted = async ({courseId,batchId,topicId,userId}) => {
    return await requestToGraphql(gql`
     query {
        sessionFeedbacks(filter: {and: [{topic_some : {id: "${topicId}"}},{batch_some : {id: "${batchId}"}},{user_some : {id: "${userId}"}}]}) {
            id
            rating
    
        }
        }
    `)


}
export default isFeedbackSubmitted

 