import gql from "graphql-tag";
import duck from "../../duck";

const fetchTopicDetailPq = async (topic,batch,course) => {
  return duck.query({
    query: gql`
      {
        topicDetailPq: batchSessions(
          filter:{and:[{topic_some: {id: "${topic}"}}, {batch_some: {id: "${batch}"}}, {course_some: {id: "${course}"}}]}
        ) {
          id
          homeworkReviewTopic: topic {
            id
            title
            classType
            topicComponentRule {
              componentName
              order
              video {
                id
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
          batch {
            id
            students{
                user{
                    id
                    name
                }
            }
            classes {
              grade
              section
              
            }
          }
         homeworkReviewCourse : course {
            id
            defaultLoComponentRule {
              componentName
              order
            }
          }
          schoolSessionsOtp {
            grade
            section
            otp
          }
          
          
        }
      }
    `,
    type: "topicDetailPq/fetch",
    key: "topicDetailPq",
  });
};
export default fetchTopicDetailPq;