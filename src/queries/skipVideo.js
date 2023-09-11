import gql from 'graphql-tag'
import duck from '../duck'

const skipVideo = async topicId =>
  duck.query({
    query: gql`
      mutation B {
        skipVideo(topicId: "${topicId}") {
          learningObjective {
            id
          }
        }
      }
    `,
    overrideAutoReducer: (state, action) => {
      const loId = action.payload.getIn(['originalData', 'skipVideo', 'learningObjective', 'id'])
      if (loId) {
        const loIndex = state.getIn(['learningObjective', 'data']).findIndex(lo => lo.get('id') === loId)
        const learningObjective = state.getIn(['learningObjective', 'data', loIndex])
        state = state.setIn(['learningObjective', 'data', loIndex], learningObjective.set('isUnlocked', true))
        // required for updating rewatch history when visiting memory section
        state = state.setIn(['learningVideosRewatch', 'fetchStatus', 'learningVideosRewatch', 'success'], false)
        state = state.setIn(['rewatchMeta', 'fetchStatus', 'rewatchMeta', 'success'], false)
      }
      return state
    },
    key: topicId,
    type: 'skipVideo/fetch'
  })

export default skipVideo
