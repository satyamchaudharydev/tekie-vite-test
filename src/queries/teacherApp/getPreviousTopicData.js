import gql from 'graphql-tag'
import duck from '../../duck';


const getPreviousTopicData = async (topicId) => {
    return duck.query({
        query: gql`
        {
          previousSessionTopicData:topic(id:"${topicId}") {
              id
              order
              title
              topicComponentRule{
                componentName
              }
            }
          }
    `,
        type: 'previousSessionTopicData/fetch',
        key: 'previousSessionTopicData'
    })
}
export default getPreviousTopicData