import gql from 'graphql-tag'
import duck from '../duck'

const deleteuserLO = async userLOList =>
  duck.query({
    query: gql`
      mutation deleteUserLO($userLOUpdate: [UserLearningObjectivesUpdate]!) {
        updateUserLearningObjectives(input: $userLOUpdate) {
          id
          isChatBookmarked
          isPracticeQuestionBookmarked
        }
      }
    `,
    variables: {
      userLOUpdate: userLOList
    },
    type: 'deleteBookmarkUserLO/update'
  })

export default deleteuserLO
