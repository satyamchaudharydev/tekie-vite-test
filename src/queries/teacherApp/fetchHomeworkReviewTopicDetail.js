import gql from "graphql-tag";
import duck from "../../duck";

const fetchHomeworkReviewTopicDetail = async (topic,batch,course) => {
  return duck.query({
    query: gql`
      {
        homeworkReviewTopicDetail: batchSessions(
          filter:{and:[{topic_some: {id: "${topic}"}}, {batch_some: {id: "${batch}"}}]}
        ) {
          id
          homeworkReviewTopic: topic {
            id
            title
            classType
            order
            topicQuestions{
              order
              question{
                 id
                questionType
                difficulty
                assessmentType
                      order
                      questionLayoutType
                      blockLayoutType
                      statement
                      hint
                      mcqOptions{
                        isCorrect
                        statement
                        blocksJSON
                        initialXML
                        questionBankImage {
                            id
                            image {
                                id
                                uri
                            }
                        }
                    }
                    fibInputOptions{
                        answers
                        correctPosition
                    }
                    fibBlocksOptions{
                        statement
                        displayOrder
                        correctPositions
                    }
                    explanation
                    answerCodeSnippet
                    questionCodeSnippet
                    arrangeOptions {
                        statement
                        displayOrder
                        correctPosition
                        correctPositions
                    }
              }
      }
            topicComponentRule {
              componentName
              order
              blockBasedProject {
                title
                externalPlatformLogo {
                  uri
                }
              }
              learningObjective{
                title
                id
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
        codingQuestionData:  assignmentQuestions(filter: {and: 
          [{topics_some: {id: "${topic}"}},
            {courses_some: {id: "${course}"}},
          ]}){
          id
          statement
          questionCodeSnippet
          answerCodeSnippet
          editorMode
          isHomework
        }
        fetchBlocklyQuestion: blockBasedProjects(
          filter: {
            and: [
              { topics_some: { id: "${topic}" } }
              { courses_some: { id: "${course}" } }
              { isHomework: true }
              { type: practice }
            ]
          }
        ) {
          id
          title
          order
          projectCreationDescription
          answerFormat
          externalDescriptionEnabled
          answerFormatDescription
          projectDescription
          externalPlatformLink
          externalPlatformLogo {
            id
            name
            uri
          }
        }
      }
    `,
    type: "homeworkReviewTopicDetail/fetch",
    key: "homeworkReviewTopicDetail",
  });
};
export default fetchHomeworkReviewTopicDetail;
