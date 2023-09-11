import gql from 'graphql-tag'
import duck from '../../duck'

const fetchBatchSession = (batchId, topicId, force = false) => duck.createQuery ({
    query : gql`
            query {
                batchSessions(filter: {
                and:[
                    {batch_some:{id: "${batchId}"}}
                    {topic_some:{id: "${topicId}"}}
                ]
                }) {
                    id
                    sessionStatus
                    sessionStartDate
                    isRetakeSession
                    mentorSession{
                        id
                    }
                }
            }
        `,
    type: 'batchSession/fetch',
    key: `batchSession/${topicId}`,
    force
})


export default fetchBatchSession
