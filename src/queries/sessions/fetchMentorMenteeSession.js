import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../../duck/duckIfCacheExists'
import getCourseId from '../../utils/getCourseId'
import { getSlotNames } from '../../utils/slots/slot-names'

const getFiltersIfRequired = (
    filterType,
    menteeSessionId,
    mentorSessionId,
    menteeId,
    topicId
) => {
    if (filterType && filterType === 'mentorMenteeSessionFilter') {
        return (
            `{and: [
                    {mentorSession_some: {id:"${menteeSessionId}"}},
                    {menteeSession_some: {id: "${mentorSessionId}"}}
                    {course_some:{id:"${getCourseId(topicId)}"}}
            ]}
            `
        )
    } else if (filterType && filterType === 'menteeFilter') {
        return (
            `{and: [
                {menteeSession_some: {
                    user_some: {
                        id: "${menteeId}"
                    }
                }}
                {course_some:{id:"${getCourseId(topicId)}"}}
            ]},orderBy: sessionStartDate_DESC
            `
        )
    } else if (filterType && filterType === 'menteeTopicFilter') {
        return (
            `{and: [
                    {menteeSession_some: {
                        user_some: {
                            id: "${menteeId}"
                        }
                    }},
                    {course_some:{id:"${getCourseId(topicId)}"}}
                    {topic_some: {id: "${topicId}"}}
            ]}
            `
        )
    } else if (filterType && filterType === 'menteeCompletedFilter') {
        return (
            `{and:[
                {menteeSession_some: {user_some: {id: "${menteeId}"}}}
                {sessionStatus: completed}
                {course_some:{id:"${getCourseId(topicId)}"}}
            ]},orderBy: sessionStartDate_DESC
            `
        )
    }
}

const getKey = (filterType, topicId, menteeId) => {
    if (filterType === 'menteeTopicFilter') {
        return `mentorMenteeSession/${topicId}`
    } else if (filterType === 'menteeFilter') {
        return `mentorMenteeSession/${menteeId}`
    } else if (filterType === 'mentorMenteeSessionFilter') {
        return `mentorMenteeSession/${topicId}`
    } else if (filterType === 'menteeCompletedFilter') {
        return `mentorMenteeSession/completed`
    }
    return 'mentorMenteeSession'
}

const fetchMentorMenteeSession = (
  menteeSessionId,
  mentorSessionId,
  menteeId,
  filterType,
  tokenType,
  force = false,
  topicId,
  key
) =>
  duck.createQuery({
    query: gql`
        query {
            mentorMenteeSessions(filter:${getFiltersIfRequired(
              filterType,
              menteeSessionId,
              mentorSessionId,
              menteeId,
              topicId
            )}) {
                id
                createdAt
                updatedAt
                sessionStartDate
                sessionEndDate
                sessionStatus
                assignmentSubmitDate
                quizSubmitDate
                isSubmittedForReview
                sessionStatus
                rating
                sessionJoinedByMenteeAt
                menteeSession {
                    id
                    ${
                      filterType === "menteeCompletedFilter"
                        ? `
                                bookingDate
                                ${getSlotNames()}
                            `
                        : ""
                    }
                }
                mentorSession{
                    id
                }
                isQuizSubmitted
                isAssignmentSubmitted
                isAssignmentAttempted
                isPracticeSubmitted
                practiceSubmitDate
                isHomeworkCheckedByMentor
                isReviewSubmittedOnTime
                topic {
                    id
                    title
                    order
                    topicQuestions {
                        question {
                            id
                        }
                    }
                    topicAssignmentQuestions {
                        assignmentQuestion {
                            id
                        }
                    }
                    topicHomeworkAssignmentQuestion {
                        assignmentQuestion {
                            id
                        }
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
                            order
                            title
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
                            practiceQuestionLearningSlidesMeta: learningSlidesMeta(
                              filter: { type: practiceQuestion }
                            ) {
                              count
                            }
                        }
                        blockBasedProject{
                            id
                            order
                            isHomework
                            title
                        }
                        video{
                            id
                        }
                    }
                    thumbnail {
                        id
                        uri
                    }
                    thumbnailSmall {
                        id
                        uri
                    }
                    chapter {
                        id
                        title
                        order
                    }
                }
            }
        }
    `,
    variables: {
      tokenType,
    },
    type: "mentorMenteeSession/fetch",
    key: key || getKey(filterType, topicId, menteeId),
    force,
    changeExtractedData: (extractedData, originalData) => {
      if (extractedData.mentorMenteeSession && originalData.mentorMenteeSessions) {
        extractedData.mentorMenteeSession.forEach((session, index) => {
          const ogMentorMenteeSession = originalData.mentorMenteeSessions.filter(el => get(session, 'id') === get(el, 'id'))[0]
          if (get(ogMentorMenteeSession, 'topic.id')) {
            extractedData.mentorMenteeSession[index]["order"] = get(ogMentorMenteeSession, 'topic.order')
              // extractedData.topic[index]["order"];
            extractedData.mentorMenteeSession[index]["topicId"] = get(ogMentorMenteeSession, 'topic.id')
              // extractedData.topic[index]["id"];
            extractedData.mentorMenteeSession[index]["topicTitle"] = get(ogMentorMenteeSession, 'topic.title')
              // extractedData.topic[index]["title"];
            extractedData.mentorMenteeSession[index]["topicThumbnail"] = get(ogMentorMenteeSession, 'topic.thumbnail')
              // extractedData.topic[index]["thumbnail"];
            extractedData.mentorMenteeSession[index]["topicThumbnailSmall"] = get(ogMentorMenteeSession, 'topic.thumbnailSmall')
              // extractedData.topic[index]["thumbnailSmall"];
            extractedData.mentorMenteeSession[index]["chapterTitle"] = get(ogMentorMenteeSession, 'topic.chapter.title')
              // extractedData.chapter[index]["title"];
            extractedData.mentorMenteeSession[index]["chapterId"] = get(ogMentorMenteeSession, 'topic.chapter.id')
              // extractedData.chapter[index]["id"];
            extractedData.mentorMenteeSession[index]["chapterOrder"] = get(ogMentorMenteeSession, 'topic.chapter.order')
              // extractedData.chapter[index]["order"];
            if (
              filterType === "menteeCompletedFilter" &&
              get(originalData, "mentorMenteeSessions")
            ) {
              const filteredSessionFromOriginalData = get(
                originalData,
                "mentorMenteeSessions"
              ).filter((_s) => get(_s, "id") === get(session, "id"));
              if (
                filteredSessionFromOriginalData &&
                filteredSessionFromOriginalData.length
              ) {
                extractedData.mentorMenteeSession[index][
                  "sessionBookingDate"
                ] = get(
                  filteredSessionFromOriginalData,
                  "0.menteeSession.bookingDate"
                );
                for (let i = 0; i < 24; i += 1) {
                  if (
                    get(
                      filteredSessionFromOriginalData,
                      `0.menteeSession.slot${i}`
                    )
                  ) {
                    extractedData.mentorMenteeSession[index]["slotTime"] = i;
                  }
                }
              }
            }

          }
        });
        extractedData.mentorMenteeSession =
          extractedData.mentorMenteeSession.filter(el => get(el, 'order', null));
      }

      return extractedData;
    },
  });

export default fetchMentorMenteeSession
