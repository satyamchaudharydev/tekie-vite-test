import gql from 'graphql-tag'
import duck from '../duck'

const fetchPracticeRewatch = async userId =>
  duck.query({
    query: gql`
    query{
        userLearningObjectives(filter:{
          and:[
            {user_some:{id:"${userId}"}},
            {or:[{practiceQuestionStatus:complete},{practiceQuestionStatus:skip}]}
          ]
        }){
          id
          practiceQuestionStatus
          learningObjective{
            id
            order
            title
            topic{
              id
              order
              title
            }
          }
        }
      }
    `,
    type: 'practiceRewatch/fetch',
    key: 'practiceRewatch'
  })

export default fetchPracticeRewatch
