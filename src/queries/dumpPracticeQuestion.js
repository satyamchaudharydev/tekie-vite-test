import gql from 'graphql-tag'
import duck from '../duck'
import { Map } from 'immutable'
import addKeyToList from '../utils/addKeyToList'
import buddyQueriesCaller from './utils/buddyQueriesCaller'

const dumpPracticeQuestion = async (
  userId,
  learningObjectiveId,
  input,
  nextComponent,
  topicId,
  userLOId,
  tokenType,
  courseId
) =>
  {
    buddyQueriesCaller('addUserActivityPQDump',{topicId,courseId,learningObjectiveId,pqDumpInput:input,tokenType})
    return duck.query({
    query: gql`
      mutation addUserActivityPQDump($input: [PracticeQuestionsTypeInput]!){
        addUserActivityPQDump(
          userConnectId: "${userId}"
          learningObjectiveConnectId: "${learningObjectiveId}"
          ${courseId ? `courseConnectId: "${courseId}"` : ''}
          ${topicId ? `topicConnectId: "${topicId}"` : ""}
          input: {
             pqAction: next
             practiceQuestionsDump: $input
          }
        ) {
          id
        }
      }
    `,
    variables: {
      input,
      tokenType
    },
    overrideAutoReducer: (state, action) => {
      if (action.payload.getIn(['originalData', 'addUserActivityPQDump', 'id']) && nextComponent) {
        if (nextComponent.get('nextComponentType') === 'quiz') {
          const userTopicJourneyIndex = state.getIn(['userTopicJourney', 'data']).findIndex(journeyTopic => journeyTopic.get('id') === topicId)
          state = state.setIn(['userTopicJourney', 'data', userTopicJourneyIndex, 'quiz', 'isUnlocked'], true)
        } else if (nextComponent.get('nextComponentType') === 'message') {
          const id = nextComponent.getIn(['learningObjective', 'id'])
          if (id) {
            const learningObjectiveIndex = state.getIn(['learningObjective', 'data']).findIndex(lo => lo.get('id') === id)
            state = state.setIn(['learningObjective', 'data', learningObjectiveIndex, 'isUnlocked'], true)
          }
        }
      }
      let newState = state
      const userLearningObjective = newState.getIn([
        'userLearningObjective',
        'data'
      ])
      const userLoItemIndex = userLearningObjective.findIndex(
        newState => newState.get('id') === userLOId
      )
      const userLoItem = userLearningObjective.find(
        newState => newState.get('id') === userLOId
      )
      if (!userLoItem) return newState
      const practiceQuestions = userLoItem.getIn(['practiceQuestions'])
      newState = newState.setIn(
        ['userLearningObjective', 'data', userLoItemIndex],
        userLoItem.set('practiceQuestionStatus', 'complete')
      )
      practiceQuestions.forEach((pq, index) => {
        const item = practiceQuestions.getIn([index])
        const itemToSet = item.set('status', 'complete')
        newState = newState.setIn(
          [
            'userLearningObjective',
            'data',
            userLoItemIndex,
            'practiceQuestions',
            index
          ],
          itemToSet
        )
      })
      let isRewatchKeyPresentInLO
      // set pqCountRewatch key in learningobjective
      (
        { newState, isKeyPresent: isRewatchKeyPresentInLO } = addKeyToList(newState, 'learningObjective', learningObjectiveId, 'practiceRewatch')
      );

      // set pqCountRewatch key in topic
      (
        { newState } = addKeyToList(newState, 'topic', topicId, 'practiceRewatch')
      )

      // update pqCountRewatch
      if (!isRewatchKeyPresentInLO) {
        const pqCountRewatch = newState.getIn(['pqCountRewatch', 'data', 'count'])
        if (pqCountRewatch === undefined) {
          newState = newState.setIn(['pqCountRewatch', 'data'], Map({ count: 1 }))
        } else {
          newState = newState.setIn(['pqCountRewatch', 'data', 'count'],
            pqCountRewatch + 1
          )
        }
      }
      return newState
    },
    type: 'dumppq/fetch',
    key: `dumppq/${learningObjectiveId}`
  })}

export default dumpPracticeQuestion
