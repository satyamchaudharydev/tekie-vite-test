import gql from 'graphql-tag'
import duck from '../../duck/duckIfCacheExists'
import { SessionBookedGA } from '../../utils/analytics/ga';
import { getCourseConnectString } from '../../utils/getCourseId';

const addMenteeSession = (userId, topicId, input, topicName, force = false) => duck.createQuery ({
    query : gql`
            mutation($input:MenteeSessionInput!) {
                addMenteeSession(input:$input,userConnectId:"${userId}",
                topicConnectId:"${topicId}"
                ${getCourseConnectString(topicId)}) {
                    id
                    topic {
                        id
                    }
                }
            }
    `,
    variables: {
        input
    },
    changeExtractedData: extractedData => {
        SessionBookedGA(topicName)
        return extractedData;
    },
    type: 'addMenteeSession/add',
    key: 'addMenteeSession',
    force
})


export default addMenteeSession
