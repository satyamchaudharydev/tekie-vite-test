import gql from 'graphql-tag'
import duck from '../../duck/duckIfCacheExists'
import { SessionRescheduledGA } from '../../utils/analytics/ga'
// import getIdArrForQuery from '../../utils/getIdArrForQuery'

const updateMenteeSession = (id, input, topicName, force = false, mentorMenteeSessionIdArr) => duck.createQuery ({
    query : gql`
            mutation($input:MenteeSessionUpdate!) {
                updateMenteeSession(id:"${id}",input:$input) {
                    id
                }
            }
    `,
    variables: {
        input
    },
    changeExtractedData: extractedData => {
        SessionRescheduledGA(topicName)
        return extractedData
    },
    type: 'addMenteeSession/update',
    key: 'addMenteeSession',
    force
})


export default updateMenteeSession
