import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../../duck/duckIfCacheExists'
import { getCourseString } from '../../utils/getCourseId'

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
const url = "/sessions/menteeCourseHomework/63da0a50e80b3c0287e8486c/645e035843436e2800117bb2"

const fetchMentorMenteeSession = (
  menteeSessionId,
  mentorSessionId,
  menteeId,
  filterType,
  tokenType,
  force = false,
  topicId,
  key,
  batchId
) =>
  duck.query({
    query: url,
    options: {
      rest: true,
      method: "get",
      headers: {},
      data: {},
      apiType: "menteeCourseHomework",
    },
    type: "mentorMenteeSession/fetch",
    key: key || getKey(filterType, topicId, menteeId),
    force,
    changeExtractedData: (extractedData, originalData) => {
      if (extractedData.menteeCourseHomework && originalData.menteeCourseHomework) {
        extractedData.menteeCourseHomework.forEach((session, index) => {
          const ogmenteeCourseHomework = originalData.menteeCourseHomework.filter(el => get(session, 'id') === get(el, 'id'))[0]
          if (get(ogmenteeCourseHomework, 'topic.id')) {
            // extractedData.menteeCourseHomework[index]["id"] = get(ogmenteeCourseHomework, 'topic.title')
            extractedData.menteeCourseHomework[index]["sessionStatus"] = 'completed'
            extractedData.menteeCourseHomework[index]["order"] = get(ogmenteeCourseHomework, 'topic.order')
              // extractedData.topic[index]["order"];
            extractedData.menteeCourseHomework[index]["topicId"] = get(ogmenteeCourseHomework, 'topic.id')
              // extractedData.topic[index]["id"];
            extractedData.menteeCourseHomework[index]["topicTitle"] = get(ogmenteeCourseHomework, 'topic.title')
              // extractedData.topic[index]["title"];
            extractedData.menteeCourseHomework[index]["topicThumbnail"] = get(ogmenteeCourseHomework, 'topic.thumbnail')
              // extractedData.topic[index]["thumbnail"];
            extractedData.menteeCourseHomework[index]["topicThumbnailSmall"] = get(ogmenteeCourseHomework, 'topic.thumbnailSmall')
              // extractedData.topic[index]["thumbnailSmall"];
            extractedData.menteeCourseHomework[index]["chapterTitle"] = get(ogmenteeCourseHomework, 'topic.chapter.title')
              // extractedData.chapter[index]["title"];
            extractedData.menteeCourseHomework[index]["chapterId"] = get(ogmenteeCourseHomework, 'topic.chapter.id')
              // extractedData.chapter[index]["id"];
            extractedData.menteeCourseHomework[index]["chapterOrder"] = get(ogmenteeCourseHomework, 'topic.chapter.order')
              // extractedData.chapter[index]["order"];
            if (
              filterType === "menteeCompletedFilter" &&
              get(originalData, "menteeCourseHomework")
            ) {
              const filteredSessionFromOriginalData = get(
                originalData,
                "menteeCourseHomework"
              ).filter((_s) => get(_s, "id") === get(session, "id"));
              if (
                filteredSessionFromOriginalData &&
                filteredSessionFromOriginalData.length
              ) {
                extractedData.menteeCourseHomework[index][
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
                    extractedData.menteeCourseHomework[index]["slotTime"] = i;
                  }
                }
              }
            }
            extractedData.menteeCourseHomework[index]["topic"] = get(ogmenteeCourseHomework, 'topic')
            if (batchId) {
              extractedData.menteeCourseHomework[index]["batchId"] = batchId
            }
          }
        });
        extractedData.menteeCourseHomework =
          extractedData.menteeCourseHomework.filter(el => get(el, 'order', null));
      }
      console.log({ extractedData }, originalData)
      return extractedData;
    },
  });

export default fetchMentorMenteeSession
