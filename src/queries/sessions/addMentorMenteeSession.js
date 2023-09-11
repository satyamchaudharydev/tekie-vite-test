import gql from 'graphql-tag'
import duck from '../../duck/duckIfCacheExists'
import { getCourseConnectString } from '../../utils/getCourseId'

const addMentorMenteeSession = (
    mentorSessionConnectedId,
    menteeSessionConnectedId,
    topicConnectedId,
    input,
    force = false,
    key,
    coursePackageId
) => duck.createQuery({
    query: gql`
        mutation($input:MentorMenteeSessionInput!) {
            addMentorMenteeSession(input: $input, ${mentorSessionConnectedId ? `mentorSessionConnectId: "${mentorSessionConnectedId}"` : ''}, 
            menteeSessionConnectId: "${menteeSessionConnectedId}", topicConnectId: "${topicConnectedId}"
            ${coursePackageId ? `coursePackageConnectId: "${coursePackageId}"` : ''}
            ${getCourseConnectString(topicConnectedId)}
            ) {
                id
                sessionStartDate
                sessionEndDate
                sessionStatus
                menteeSession {
                    id
                }
                mentorSession{
                    id
                }
                topic{
                    id
                    title
                    order
                }
                isQuizSubmitted
                isHomeworkCheckedByMentor
                isAssignmentSubmitted
                isAssignmentAttempted
                isPracticeSubmitted
                practiceSubmitDate
                assignmentSubmitDate
                isSubmittedForReview
            }
        }
    `,
    variables: {
        input,
        tokenType: 'withMenteeMentorToken'
    },
    type: 'mentorMenteeSession/add',
    key: key || `mentorMenteeSession/${topicConnectedId}`,
    force
})

export default addMentorMenteeSession
