import gql from 'graphql-tag'
import duck from '../../duck/duckIfCacheExists'

const fetchTopicDetails = (topicId, force = false) => {
    return duck.createQuery({
      query: gql`
        query {
          topics(filter:{id: "${topicId}"}) {
              id
              title
              description
              videoTitle
              order
              
            chapter {
                id
                title
                order
            }
              topicComponentRule {
                componentName
                order
                childComponentName
                learningObjectiveComponentsRule{
                    componentName
                    order
                }
                learningObjective{
                    id
                    title
                    order
                    messagesMeta{
                        count
                    }
                    questionBankMeta(filter:{and:[{assessmentType:practiceQuestion}{status:published}]}){
                        count
                    }
                    comicStripsMeta(filter:{status:published}){
                        count
                    }
                    learningSlidesMeta {
                        count
                    }
                    practiceQuestionLearningSlidesMeta: learningSlidesMeta(filter:{type:practiceQuestion}){
                        count
                    }
                }
                blockBasedProject{
                    id
                    order
                    title
                    isHomework
                }
                video{
                    id
                }
            }
            }
      }
      `,
      variables: {
        CDNCaching: true,
      },
      type: "topic/fetch",
      key: `topic/${topicId}`,
      force,
    });
}

export default fetchTopicDetails;
