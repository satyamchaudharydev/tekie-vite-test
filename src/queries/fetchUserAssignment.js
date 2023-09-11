import gql from 'graphql-tag'
import { PYTHON_COURSE } from '../config'
import duck from '../duck/duckIfCacheExists'
import getCourseId, { getCourseName } from '../utils/getCourseId'
import buddyQueriesCaller from './utils/buddyQueriesCaller'

const fetchUserAssignment = (userId, topicId, PUBLISHED, tokenType, force = false) =>
    {
      buddyQueriesCaller('userAssignments',{topicId,tokenType})
        return duck.createQuery({
        query: gql`
          query {
            userAssignments(filter:{
            and: [
              {user_some: {id:"${userId}"}}
              {topic_some:{id: "${topicId}"}}
              ${(getCourseName() !== PYTHON_COURSE) ? `{course_some:{id: "${getCourseId(topicId)}"}}` : ''}
            ]
            }) {
            id
            user{
              id
              name
            }
            assignment {
              assignmentQuestion {
                id
                order
                status
                statement
                isHomework
                questionCodeSnippet
                initialCode
                editorMode
                answerCodeSnippet
                topic {
                  id
                  learningObjectives(filter: {
                    status: ${PUBLISHED}
                  }) {
                    id
                  }
                }
                hints {
                  hintPretext
                  hint
                }
              }
              assignmentQuestionDisplayOrder
              userAnswerCodeSnippet
              isAttempted
              startTime
              endTime
              evaluation {
                id
              }
            }
            assignmentStatus
            }
          }
        `,
            type: 'userAssignment/fetch',
            key: topicId,
            variables: {
                tokenType
            },
            force
    })}

export default fetchUserAssignment
