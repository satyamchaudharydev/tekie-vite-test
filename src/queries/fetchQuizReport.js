import gql from 'graphql-tag'
import duck from '../duck'
import getCourseId from '../utils/getCourseId';
import getIdArrForQuery from '../utils/getIdArrForQuery'

const fetchQuizReport = (topicId, courseId, userIds) =>
  duck.createQuery({
    query: gql`
    mutation{
      ${(userIds && userIds.length) ? 'userFirstAndLatestQuizReports' : 'userFirstAndLatestQuizReport'}(
        topicId: "${topicId}"
        ${courseId ? `courseId:"${getCourseId(topicId) || courseId}"` : ""}
        ${(userIds && userIds.length) ? `userIds:[${getIdArrForQuery(userIds)}]` : ""}
      ) {
        StudentName:user{
          name
        }
        topicData: topic {
          id
          title
          thumbnailSmall{
            id
            uri
          }
        }
        topic {
          id
          title
          thumbnailSmall{
            id
            uri
          }
        }
        nextComponent {
          topic {
            id
            title
            thumbnail {
              id
              name
              uri
            }
          }
        }
        firstQuizReport {
          quizReportId
          quizReport {
            totalQuestionCount
            correctQuestionCount
            inCorrectQuestionCount
            unansweredQuestionCount
            masteryLevel
          }
          learningObjectiveReport {
            learningObjective {
              id
              order
              title
              videoThumbnail {
                id
                name
                uri
              }
            }
            totalQuestionCount
            correctQuestionCount
            inCorrectQuestionCount
            unansweredQuestionCount
            recommendationText
            masteryLevel
          }
        }
        latestQuizReport{
          quizReportId
          quizReport {
            totalQuestionCount
            correctQuestionCount
            inCorrectQuestionCount
            unansweredQuestionCount
            masteryLevel
          }
          learningObjectiveReport {
            learningObjective {
              id
              order
              title
              videoThumbnail {
                id
                name
                uri
              }
            }
            recommendationText
            masteryLevel
            totalQuestionCount
            correctQuestionCount
            inCorrectQuestionCount
            unansweredQuestionCount
          }
        }
      }
    }
    `,
    changeExtractedData: (extractedData) => {
      if (extractedData && extractedData.userFirstAndLatestQuizReport) {
        extractedData.userFirstAndLatestQuizReport.id = topicId;
        return extractedData;
      }
      if (extractedData && extractedData.userFirstAndLatestQuizReports) {
        extractedData.userFirstAndLatestQuizReports = extractedData.userFirstAndLatestQuizReports.map(
          (el) => ({ id: topicId, ...el })
        );
        return extractedData;
      }
    },
    type: "userQuizReport/fetch",
    key: `userQuizReport/${topicId}`,
  });

export default fetchQuizReport
