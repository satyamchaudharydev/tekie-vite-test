import gql from 'graphql-tag'
import duck from '../../duck/duckIfCacheExists'
const fetchSessionFeedbackTags =  () => {
    return duck.createQuery({
        query: gql`
        query{
            sessionFeedbackTags{
                id
                label
                feedbackType
                grades
                components    
                rating         
            }
        }
        `,
        type: 'sessionFeedbackTags/fetch',
        key: 'sessionFeedbackTags'
    })
}
export default fetchSessionFeedbackTags