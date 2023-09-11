import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../../duck'

const fetchCurrentTopic = (topicId, force = false) => duck.createQuery ({
    query : gql`
            query {
                topic(id: "${topicId}") {
                    id
                    topicQuestions {
                        order
                    }
                    topicComponentRule {
                        componentName
                        order
                    }
                }
            }
        `,
    type: 'currentTopicDetail/fetch',
    key: 'currentTopicDetail',
    force,
    changeExtractedData: (extractedData, originalData) => {
        extractedData.currentTopicDetail = get(originalData, 'topic')
        return { ...extractedData }
    }
})


export default fetchCurrentTopic
