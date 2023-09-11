import gql from 'graphql-tag'
import duck from '../duck'
import { List, Map } from 'immutable'
import addKeyToList from '../utils/addKeyToList'

const dumpQuiz = async (topicId, quizDumpInput, nextTopicId) =>
    duck.query({
        query: gql`
      mutation addquizDump($input: GetQuizReportInput!) {
        getQuizReport(input: $input){
          topic {
            id
            title
          }
          firstQuizReport {
            quizReportId
            quizReport {
              totalQuestionCount
              correctQuestionCount
              inCorrectQuestionCount
              unansweredQuestionCount
              masteryLevel
            }
            learningObjectiveReport {
              learningObjective {
                id
                order
                title
                videoThumbnail {
                  id
                  name
                  uri
                }
              }
              totalQuestionCount
              correctQuestionCount
              inCorrectQuestionCount
              unansweredQuestionCount
              recommendationText
              masteryLevel
            }
          }
          latestQuizReport {
            quizReportId
            quizReport {
              totalQuestionCount
              correctQuestionCount
              inCorrectQuestionCount
              unansweredQuestionCount
              masteryLevel
            }
            learningObjectiveReport {
              learningObjective {
                id
                order
                title
                videoThumbnail {
                  id
                  name
                  uri
                }
              }
              recommendationText
              masteryLevel
              totalQuestionCount
              correctQuestionCount
              inCorrectQuestionCount
              unansweredQuestionCount
            }
          }
        }
      }

    `,
        variables: {
            input: quizDumpInput
        },
        overrideAutoReducer: (state, action) => {
            if (action.payload.getIn(['originalData', 'getQuizReport', 'topic', 'id'])) {
                const userTopicJourneyIndex = state.getIn(['userTopicJourney', 'data']).findIndex(journeyTopic => journeyTopic.get('id') === nextTopicId)
                if (userTopicJourneyIndex > -1) {
                  if (userTopicJourneyIndex) {
                    state = state.setIn(['userTopicJourney', 'data', userTopicJourneyIndex, 'video', 'isUnlocked'], true)
                  }
                }
                const nextTopicIndex = state.getIn(['topic', 'data']).findIndex(topic => topic.get('id') === nextTopicId)
                if (nextTopicIndex > -1) {
                  state = state.setIn(['topic', 'data', nextTopicIndex, 'isUnlocked'], true)
                }
            }

            // update topic to include the userProfileRewatch key
            let { newState, isKeyPresent: isRewatchKeyPresentInTopic, item: topic } = addKeyToList(state, 'topic', topicId, 'userProfileRewatch')

            // update chapter to include the userProfileRewatch key
            const chapterIdOfTopic = topic.getIn(['chapters', 0, 'id'])
            let isRewatchKeyPresentInChapter
            ({ newState, isKeyPresent: isRewatchKeyPresentInChapter } = addKeyToList(newState, 'chapter', chapterIdOfTopic, 'userProfileRewatch'))

            // Now update quiz metacount
            if (!isRewatchKeyPresentInChapter && !isRewatchKeyPresentInTopic) {
                const quizCountRewatch = newState.getIn(['quizCountRewatch', 'data', 0, 'totalTopicsMeta', 'count'])
                if (!quizCountRewatch) {
                    newState = newState.setIn(['quizCountRewatch', 'data'],
                        List([{ totalTopicsMeta: { count: 1 } }])
                    )
                } else {
                    newState = newState.setIn(['quizCountRewatch', 'data', 0, 'totalTopicsMeta', 'count'],
                        quizCountRewatch + 1
                    )
                }
            }
            // add quiz report to state
            const userFirstAndLatestQuizReport = action.payload.getIn(['extractedData', 'userFirstAndLatestQuizReport'])
                .set('__keys', List([`userQuizReport/${topicId}`])).set('id', topicId)
            const indexOfReport = newState.getIn(['userFirstAndLatestQuizReport', 'data']).findIndex((quizReport) => {
                return quizReport.get('id') === topicId
            })
            if (indexOfReport === -1) {
                newState = newState.updateIn(['userFirstAndLatestQuizReport', 'data'], quizReports => quizReports.push(userFirstAndLatestQuizReport))
            } else {
                newState = newState.setIn(['userFirstAndLatestQuizReport', 'data', indexOfReport], userFirstAndLatestQuizReport)
            }
            newState = newState.setIn(['userQuizReport', 'fetchStatus'],
                Map(
                    {
                        [`userQuizReport/${topicId}`]: Map({
                            loading: false,
                            failure: false,
                            success: true
                        })
                    }
                ))
            return newState
        },
        type: 'dumpQuiz/fetch',
        key: `dumpQuiz/${topicId}`
    })

export default dumpQuiz