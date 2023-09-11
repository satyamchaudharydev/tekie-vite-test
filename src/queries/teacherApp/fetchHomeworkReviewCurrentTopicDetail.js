import gql from "graphql-tag";
import duck from "../../duck";

const fetchHomeworkReviewCurrentTopicDetail = async (topic,batch,course) => {
  return duck.query({
    query: gql`
      {
        homeworkReviewCurrentTopicDetail: batchSessions(
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
            classes {
              grade
              section
            }
          }
         homeworkReviewCourse: course {
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
          bookingDate
          startMinutes
          endMinutes
          slot0
          slot1
          slot2
          slot3
          slot4
          slot5
          slot6
          slot7
          slot8
          slot9
          slot10
          slot11
          slot12
          slot13
          slot14
          slot15
          slot16
          slot17
          slot18
          slot19
          slot20
          slot21
          slot22
          slot23
        }
      }
    `,
    type: "homeworkReviewCurrentTopicDetail/fetch",
    key: "homeworkReviewCurrentTopicDetail",
  });
};
export default fetchHomeworkReviewCurrentTopicDetail;