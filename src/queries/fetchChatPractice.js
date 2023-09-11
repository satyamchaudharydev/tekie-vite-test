import gql from 'graphql-tag'
import { get } from 'lodash'
import { PYTHON_COURSE } from '../config'
import duck from '../duck'
import getCourseId, { getCourseName } from '../utils/getCourseId'
import buddyQueriesCaller from './utils/buddyQueriesCaller'

const fetchChatPractice = (userId, learningObjectiveId, tokenType, force = false, courseId = null, topicId = '') => {
    let additionalFilter = ''
    if (courseId) {
      additionalFilter += `{ course_some: { id: "${courseId}" } }`
    }
    // buddyQueriesCaller('userLearningObjectives',{learningObjectiveId,tokenType,courseId,topicId})
    return duck.createQuery({
      query: gql`
        query {
          userLearningObjectives(
            filter: {
              and: [
                { user_some: { id: "${userId}" } }
                ${((getCourseName() !== PYTHON_COURSE) && !additionalFilter) ? `{course_some:{id: "${getCourseId(topicId)}"}}` : ''}
                ${topicId ? `{ topic_some: { id: "${topicId}" } }` : ''}
                { learningObjective_some: { id: "${learningObjectiveId}" } }
                ${additionalFilter}
              ]
            }
        ){
            id
            chatStatus
            practiceQuestionStatus
            isChatBookmarked
            learningSlideStatus
            learningSlides {
              status
              learningSlide {
                type
                id
                order
                pqQuestion: practiceQuestions{
                  id
                }
              }
            }
            learningObjective{
              id
              title
              videoStartTime
              videoEndTime
              comicStrips {
                title
                comicImages {
                  image {
                    name
                    uri
                  }
                  order
                }
              }
              videoThumbnail{
                uri
                id
              }
              topic{
                id
                videoThumbnail{
                  id
                  uri
                }
              }
              topics(filter:{and:[
              ${courseId ? `{courses_some:{id:"${courseId}"}}` : ''}
            ]}){
                id
                videoThumbnail{
                  id
                  uri
                }
              }
              pqStory
              pqStoryImage{
                id
                uri
              }
              messages {
                id
                statement
                type
                image {
                  id
                  uri
                }
                emoji {
                  id
                  code
                  image {
                    id
                    uri
                  }
                }
                sticker {
                  id
                  code
                  image {
                    id
                    uri
                  }
                }
                question {
                  id
                  order
                  questionLayoutType
                  blockLayoutType
                  statement
                  hint
                  explanation
                  questionType
                  difficulty
                  assessmentType
                  learningSlideData: learningSlides{
                    id
                  }
                  hints {
                    hintPretext
                    hint
                  }
                  learningObjective {
                    id
                    title
                    order
                  }
                  questionCodeSnippet
                  answerCodeSnippet
                  status
                  mcqOptions {
                    statement
                    isCorrect
                    blocksJSON
                    initialXML
                    questionBankImage {
                      image {
                        uri
                      }
                    }
                  }
                  fibInputOptions {
                    correctPosition
                    answers
                  }
                  fibBlocksOptions {
                    statement
                    displayOrder
                    correctPositions
                  }
                  arrangeOptions {
                    statement
                    displayOrder
                    correctPosition
                    correctPositions
                  }
                  learningObjective {
                    id
                    topic {
                      id
                    }
                  }
                }
                terminalInput
                terminalOutput
                editorMode
                order
                alignment
              }
          }

          practiceQuestions {
            question {
              id
              order
              questionLayoutType
              blockLayoutType
              statement
              hint
              hints {
                hint
              }
              explanation
              questionType
              difficulty
              assessmentType
              learningObjective {
                id
                title
                order
              }
              questionCodeSnippet
              answerCodeSnippet
              status
              mcqOptions {
                statement
                isCorrect
                blocksJSON
                initialXML
                questionBankImage {
                  image {
                    uri
                  }
                }
              }
              fibInputOptions {
                correctPosition
                answers
              }
              fibBlocksOptions {
                statement
                displayOrder
                correctPositions
              }
              arrangeOptions {
                statement
                displayOrder
                correctPosition
                correctPositions
              }
              learningObjective {
                id
                topic {
                  id
                }
              }
            }
            status
            attemptNumber
            totalAttemptCount
          }
          isComicStripBookmarked
          nextComponent {
            learningObjective {
              id
              title
              description
              thumbnail {
                id
                uri
              }
            }
            topic {
              id
            }
          nextComponentType
          blockBasedProject{
            title
            order
          }
        }
      }
      }
      `,
      variables: {
          tokenType
      },
      type: 'chatPractice/fetch',
      key: learningObjectiveId,
      force,
      changeExtractedData: (extracted, original) => {
        if (get(original, 'userLearningObjectives[0].id')) {
          extracted.userLearningObjective[0].learningSlides = [...original.userLearningObjectives[0].learningSlides]
          extracted.learningSlide = []
        }
        return { ...extracted }
      }
    })
}

export default fetchChatPractice
