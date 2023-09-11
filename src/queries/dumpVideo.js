import gql from 'graphql-tag'
import duck from '../duck'
import buddyQueriesCaller from './utils/buddyQueriesCaller'

const dumpVideo = (userId, topicId, input, nextLoId, force = false, courseId, videoId) => 
{
  buddyQueriesCaller('addUserActivityVideoDump',{topicId,courseId,videoId,videoAction:input,tokenType:'withMenteeMentorToken'})
  return duck.createQuery({
    query: gql`
      mutation addUserActivityVideoDump(
        $userId: ID
        $topicId: ID
        $input: UserActivityVideoDumpInput!
      ) {
        addUserActivityVideoDump(
          userConnectId: $userId
          topicConnectId: $topicId
          ${courseId ? `courseConnectId: "${courseId}"` : ''}
          ${videoId ? `videoConnectId: "${videoId}"` : ''}
          input: $input
        ) {
          id
        }
      }
    `,
    variables: {
        userId,
        topicId,
        input,
        tokenType: 'withMenteeMentorToken'
    },
    key: topicId,
    type: 'dumpVideo/fetch',
    force
})}

export default dumpVideo
