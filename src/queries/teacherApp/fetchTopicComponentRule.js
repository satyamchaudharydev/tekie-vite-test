import gql from "graphql-tag";
import duck from "../../duck";

const fetchTopicComponentRule = async (topic) => {
  return duck.query({
    query: gql`
    {
       fetchTopicComponentRule: topic(id: "${topic}") {
          id
          topicComponentRule {
            componentName
            order
            video {
              id
              title
            }
            learningObjectiveComponentsRule{
              componentName
              order
            }
            blockBasedProject {
              id
            }
            learningObjective {
              id
              messagesMeta {
                count
              }
              comicStripsMeta {
                count
              }
              learningSlidesMeta {
                count
              }
              questionBankMeta {
                count
              }
              practiceQuestionLearningSlidesMeta: learningSlidesMeta(
                filter: { type: practiceQuestion }
              ) {
                count
              }
            }
          }
        }
      }
      
    `,
    type: "fetchTopicComponentRule/fetch",
    key: "fetchTopicComponentRule",
  });
};
export default fetchTopicComponentRule;
