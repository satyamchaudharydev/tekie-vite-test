import gql from 'graphql-tag'
import { get } from 'lodash'
import duck from '../../duck'
import buddyQueriesCaller from '../utils/buddyQueriesCaller'

const addLearningSlideDump = async (ids, input) => {
  const learningObjectiveConnectId = get(ids, 'loId')
  const courseConnectId = get(ids, 'courseId')
  const topicConnectId = get(ids, 'topicId')
  const learningSlideConnectId = get(ids, 'learningSlideId')
  const userConnectId = get(ids, 'userId')
  buddyQueriesCaller('addUserActivityLearningSlideDump',{learningSlideConnectId, courseConnectId,topicConnectId,learningObjectiveConnectId,learningSlideInput:input})
  return duck.query({
    query: gql`
    mutation ($input: UserActivityLearningSlideDumpInput!) {
      addUserActivityLearningSlideDump(
        input: $input,
        ${userConnectId ? `userConnectId: "${userConnectId}"` : ''}
        ${learningSlideConnectId ? `learningSlideConnectId: "${learningSlideConnectId}"` : ''}
        ${courseConnectId ? `courseConnectId: "${courseConnectId}"` : ''}
        ${topicConnectId ? `topicConnectId: "${topicConnectId}"` : ''}
        ${learningObjectiveConnectId ? `learningObjectiveConnectId: "${learningObjectiveConnectId}"` : ''}
      ) {
        id
        type
      }
    }
    `,
    variables: {
      input
    },
    type: 'userActivityLearningSlideDump/add',
    key: 'userActivityLearningSlideDump',
  })
}

export default addLearningSlideDump