import gql from "graphql-tag"
import { get } from "lodash"
import { getAppUserAuthToken } from "../utils/data-utils"
import requestToGraphql from "../utils/requestToGraphql"

const updateUserBlockBasedPracticeForBuddies = async(userId, topicId, projectId, courseId) => {
    const input = {}
    await requestToGraphql(gql`
        mutation addUserBlockBasedPractice(
            $userId: ID
            $topicId: ID
            $projectId: ID
            $courseId: ID
            $input: UserBlockBasedPracticeInput!
          ) {
            addUserBlockBasedPractice(
            userConnectId: $userId
            topicConnectId: $topicId
            courseConnectId: $courseId
            blockBasedPracticeConnectId: $projectId
            input: $input
            ) {
                id
                blockBasedPractice{
                    id
                }
            }
        }
    `,{
        userId,
        topicId,
        projectId,
        courseId,
        input,
    },
    
    )
}

export default updateUserBlockBasedPracticeForBuddies