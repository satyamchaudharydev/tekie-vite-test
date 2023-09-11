import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from "../../duck/duckIfCacheExists";

const fetchBookSessionInfo = (
    menteeId,
    force = false
) => duck.createQuery({
    query: gql`
        query {
            mentorMenteeSessions(filter:{menteeSession_some: {
                user_some: {
                    id: "${menteeId}"
                }
                }},orderBy: sessionStartDate_DESC) {
                id
                sessionStartDate
                sessionEndDate
                sessionStatus
                assignmentSubmitDate
                quizSubmitDate
                isSubmittedForReview
                sessionStatus
                menteeSession {
                    id
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
                topic {
                    id
                    title
                    order
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
                    }
                }
            }
            salesOperations(filter: {
                client_some: {
                  id: "${menteeId}"
                }
            }) {
                id
                allottedMentor {
                  id
                  name
                  username
                  profilePic {
                    uri
                  }
                }
            }
        }
    `,
    variables: {
        tokenType: 'withMenteeToken'
    },
    type: 'bookSessionInfo/fetch',
    key: `bookSessionInfo/${menteeId}`,
    force,
    changeExtractedData: (extractedData, originalData) => {
        if (extractedData.mentorMenteeSession) {
            extractedData.mentorMenteeSession.forEach((session, index) => {
                extractedData.mentorMenteeSession[index]['order'] = extractedData.topic[index]['order']
                extractedData.mentorMenteeSession[index]['topicId'] = extractedData.topic[index]['id']
                extractedData.mentorMenteeSession[index]['topicTitle'] = extractedData.topic[index]['title']
                extractedData.mentorMenteeSession[index]['topicThumbnail'] = extractedData.topic[index]['thumbnail']
                extractedData.mentorMenteeSession[index]['topicThumbnailSmall'] = extractedData.topic[index]['thumbnailSmall']
                extractedData.mentorMenteeSession[index]['chapterTitle'] = extractedData.chapter[index]['title']
            })
        }
        if (extractedData.salesOperation && originalData) {
            const originalSalesOperation = get(originalData, 'salesOperations.0')
            extractedData.salesOperation.forEach((_s, index) => {
                extractedData.salesOperation[index]['mentorId'] = get(originalSalesOperation, 'allottedMentor.id')
            })
        }
        return extractedData
    }
})

export default fetchBookSessionInfo
